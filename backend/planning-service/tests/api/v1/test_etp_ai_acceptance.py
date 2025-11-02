import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch

from app import crud
from app.core.config import API_V1_STR
from app.schemas.etp import ETPCreate, ETPSchema
from app.schemas.ai_execution import AIExecutionCreate
from tests.utils.user import create_random_user


def test_accept_ai_suggestion(client: TestClient, db: Session) -> None:
    user = create_random_user(db)
    etp_in = ETPCreate(title="Test ETP", data={"justificativa": "Initial text"})
    etp = crud.etp.etp.create_with_owner(db=db, obj_in=etp_in, created_by_id=user.id)
    ai_execution_in = AIExecutionCreate(prompt_text="prompt", response_text="AI generated text")
    ai_execution = crud.ai_execution.create(db=db, obj_in=ai_execution_in)

    acceptance_data = {
        "final_text": "User edited and accepted text",
        "execution_id": str(ai_execution.id),
    }

    with patch('app.api.v1.dependencies.get_current_user', return_value={'sub': str(user.id)}):
        response = client.post(
            f"{API_V1_STR}/etp/{etp.id}/accept-section/justificativa",
            json=acceptance_data,
        )

    assert response.status_code == 201
    data = response.json()
    assert data["etp_id"] == str(etp.id)
    assert data["section_name"] == "justificativa"
    assert data["execution_id"] == str(ai_execution.id)
    assert "[-AI generated text-]{+User edited and accepted text+}" in data["diff"] # Simplified diff check

    db.refresh(etp)
    assert etp.data["justificativa"] == "User edited and accepted text"

    history = crud.ia_acceptance_history.get(db=db, id=data["id"])
    assert history is not None
