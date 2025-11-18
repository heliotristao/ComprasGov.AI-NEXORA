import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
import diff_match_patch as dmp_module

from datetime import datetime, timezone

from app import crud, schemas
from app.api.deps import get_db
from nexora_auth.audit import audited
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.post(
    "/{id}/accept-section/{section_name}",
    response_model=schemas.IAAcceptanceHistorySchema,
    status_code=status.HTTP_201_CREATED,
)
@audited(action="ETP_IA_ACCEPTED")
def accept_ai_suggestion(
    id: uuid.UUID,
    section_name: str,
    acceptance_in: schemas.IAAcceptanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Accept an AI suggestion for a specific section of an ETP,
    optionally with user edits.
    """
    etp = crud.etp.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    ai_execution = crud.ai_execution.get(db=db, id=acceptance_in.execution_id)
    if not ai_execution:
        raise HTTPException(status_code=404, detail="AI execution record not found")

    # Update the ETP data
    if etp.data is None:
        etp.data = {}
    etp.data[section_name] = acceptance_in.final_text
    flag_modified(etp, "data")

    # Calculate the diff
    dmp = dmp_module.diff_match_patch()
    diff = dmp.diff_main(ai_execution.response_text, acceptance_in.final_text)
    dmp.diff_cleanupSemantic(diff)
    diff_text = str(diff)

    # Create history record
    user_id = uuid.UUID(current_user.get("sub"))
    history_create = schemas.IAAcceptanceHistorySchema(
        etp_id=etp.id,
        section_name=section_name,
        execution_id=acceptance_in.execution_id,
        accepted_by_id=user_id,
        diff=diff_text,
        # Fields below are just for schema creation, they are not used in CRUD
        id=uuid.uuid4(),
        accepted_at=datetime.now(timezone.utc),
    )

    history = crud.ia_acceptance_history.create(db=db, obj_in=history_create)
    db.commit()
    db.refresh(history)

    return history
