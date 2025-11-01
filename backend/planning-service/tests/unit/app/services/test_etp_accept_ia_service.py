import pytest
from sqlalchemy.orm import Session
from app.services.etp_accept_ia_service import accept_suggestion, TraceNotFoundError
from app.db.models.etp import ETP
from app.models.etp_ai_trace import ETPAITrace
from app.models.etp_section_accepts import ETPSectionAccepts
from tests.utils.etp import create_random_etp
import uuid

def create_random_etp_ai_trace(db: Session, etp_id: int, section_key: str) -> ETPAITrace:
    """Helper function to create a random ETPAITrace for testing."""
    trace = ETPAITrace(
        etp_id=etp_id,
        section_key=section_key,
        llm_model_name="test-model",
        llm_parameters={},
        prompt_used="Test prompt",
        llm_response="New test content",
        parsed_content="New test content"
    )
    db.add(trace)
    db.commit()
    db.refresh(trace)
    return trace

def test_accept_suggestion_happy_path(db: Session) -> None:
    """
    Tests the successful acceptance of an AI suggestion.
    """
    # Setup: Create ETP with initial content
    etp = create_random_etp(db)
    section_key = "justificativa_necessidade"
    old_content = "This is the original content."
    etp.data = {section_key: {"content": old_content}}
    db.add(etp)
    db.commit()
    db.refresh(etp)

    # Setup: Create a valid AI trace
    trace = create_random_etp_ai_trace(db, etp_id=etp.id, section_key=section_key)

    # Execute the service function
    user_id = 1
    new_content = "This is the new, accepted content."
    acceptance_data = {"trace_id": trace.id, "new_content": new_content}

    result = accept_suggestion(
        db, etp_id=etp.id, section=section_key, user_id=user_id, acceptance_data=acceptance_data
    )

    # Assert: Check the returned object
    assert isinstance(result, ETPSectionAccepts)
    assert result.etp_id == etp.id
    assert result.section_key == section_key
    assert result.user_id == user_id
    assert result.trace_id == trace.id
    assert result.previous_content == old_content
    assert result.accepted_content == new_content
    assert "diff" in result.diff_short # Check that a diff was generated

    # Assert: Check the database state
    db.refresh(etp)
    assert etp.data[section_key]["content"] == new_content

    # Assert: Check if the acceptance record was created
    acceptance_record = db.query(ETPSectionAccepts).filter(ETPSectionAccepts.id == result.id).first()
    assert acceptance_record is not None
    assert acceptance_record.accepted_content == new_content

def test_accept_suggestion_invalid_trace_id(db: Session) -> None:
    """
    Tests that TraceNotFoundError is raised for an invalid or non-existent trace_id.
    """
    etp = create_random_etp(db)
    section_key = "justificativa_necessidade"
    user_id = 1
    non_existent_trace_id = 99999
    acceptance_data = {"trace_id": non_existent_trace_id, "new_content": "some content"}

    # Execute and assert exception
    with pytest.raises(TraceNotFoundError) as excinfo:
        accept_suggestion(
            db, etp_id=etp.id, section=section_key, user_id=user_id, acceptance_data=acceptance_data
        )

    assert f"Invalid trace_id '{non_existent_trace_id}'" in str(excinfo.value)

def test_accept_suggestion_mismatched_trace_id(db: Session) -> None:
    """
    Tests that TraceNotFoundError is raised when trace_id exists but doesn't match the ETP or section.
    """
    # Setup: Create two different ETPs
    etp1 = create_random_etp(db)
    etp2 = create_random_etp(db)
    section_key = "justificativa_necessidade"
    user_id = 1

    # Setup: Create a trace for the *second* ETP
    trace_for_etp2 = create_random_etp_ai_trace(db, etp_id=etp2.id, section_key=section_key)

    # Execute: Try to use etp2's trace for etp1
    acceptance_data = {"trace_id": trace_for_etp2.id, "new_content": "some content"}

    with pytest.raises(TraceNotFoundError):
        accept_suggestion(
            db, etp_id=etp1.id, section=section_key, user_id=user_id, acceptance_data=acceptance_data
        )
