import pytest
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models.etp import ETP
from tests.utils.user import create_random_user
from app.services.etp_service import perform_merge_patch

# Helper to create a test ETP
def create_test_etp(db: Session, initial_data: dict) -> ETP:
    user = create_random_user(db)
    etp = ETP(
        title="Test ETP",
        data=initial_data,
        created_by=user
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp

def test_perform_merge_patch_update_first_level(db: Session):
    """
    Tests updating a top-level field.
    """
    initial_data = {"justificativa_contratacao": "Initial Justification"}
    etp = create_test_etp(db, initial_data)

    patch_data = {"justificativa_contratacao": "Updated Justification"}

    updated_etp = perform_merge_patch(db=db, etp_id=etp.id, patch_data=patch_data)

    assert updated_etp.data["justificativa_contratacao"] == "Updated Justification"

def test_perform_merge_patch_update_nested(db: Session):
    """
    Tests updating a nested field.
    """
    initial_data = {
        "steps": {
            "step_1": {
                "descricao_necessidade": "Old Description"
            }
        }
    }
    etp = create_test_etp(db, initial_data)

    patch_data = {
        "steps": {
            "step_1": {
                "descricao_necessidade": "New Description"
            }
        }
    }

    updated_etp = perform_merge_patch(db=db, etp_id=etp.id, patch_data=patch_data)

    assert updated_etp.data["steps"]["step_1"]["descricao_necessidade"] == "New Description"

def test_perform_merge_patch_add_new_field(db: Session):
    """
    Tests adding a new field that didn't exist before.
    """
    initial_data = {"existing_field": "value"}
    etp = create_test_etp(db, initial_data)

    patch_data = {"new_field": "new_value"}

    updated_etp = perform_merge_patch(db=db, etp_id=etp.id, patch_data=patch_data)

    assert updated_etp.data["new_field"] == "new_value"
    assert updated_etp.data["existing_field"] == "value"

def test_perform_merge_patch_remove_field_with_null(db: Session):
    """
    Tests that a null value in the patch removes the corresponding field.
    """
    initial_data = {"field_to_remove": "some_value", "field_to_keep": "another_value"}
    etp = create_test_etp(db, initial_data)

    patch_data = {"field_to_remove": None}

    updated_etp = perform_merge_patch(db=db, etp_id=etp.id, patch_data=patch_data)

    assert "field_to_remove" not in updated_etp.data
    assert updated_etp.data["field_to_keep"] == "another_value"

def test_perform_merge_patch_not_found(db: Session):
    """
    Tests that an HTTPException is raised if the ETP is not found.
    """
    non_existent_id = uuid.uuid4()

    with pytest.raises(HTTPException) as excinfo:
        perform_merge_patch(db=db, etp_id=non_existent_id, patch_data={"a": "b"})

    assert excinfo.value.status_code == 404
    assert "ETP not found" in excinfo.value.detail
