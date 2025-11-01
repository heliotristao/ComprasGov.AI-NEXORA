import uuid
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud
from app.schemas.etp_step_schemas import step_validation_schemas
from app.services import etp_service


def validate_step_data(step_name: str, data: Dict[str, Any]) -> None:
    """
    Validates data against the Pydantic schema for a given step.
    Raises HTTPException 422 if validation fails.
    """
    if step_name not in step_validation_schemas:
        return  # No validation schema for this step

    schema = step_validation_schemas[step_name]
    try:
        schema.parse_obj(data)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.errors(),
        )


def check_version_conflict(
    db: Session, *, etp_id: uuid.UUID, if_match: Optional[str]
) -> None:
    """
    Checks for version conflicts using the If-Match header.
    Raises HTTPException 409 if the version does not match.
    """
    if not if_match:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="If-Match header is required for this operation.",
        )

    etp = crud.etp.get_etp(db=db, etp_id=etp_id)
    if not etp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ETP not found")

    if str(etp.version) != if_match:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"ETP version mismatch. Current version is {etp.version}.",
        )


from app.db.models.etp import ETPStatus

def orchestrate_etp_auto_save(
    db: Session,
    *,
    etp_id: uuid.UUID,
    patch_data: Dict[str, Any],
    if_match: Optional[str],
    validate_step: Optional[str] = None,
):
    """
    Orchestrates the ETP auto-save process.
    1. Checks for version conflicts.
    2. Validates step data if a step name is provided.
    3. Performs a merge patch to update the ETP data.
    4. Increments the ETP version.
    """
    etp = crud.etp.get(db=db, id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    if etp.status in [ETPStatus.approved, ETPStatus.rejected]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ETPs that have been approved or rejected cannot be edited.",
        )
    # 1. Check for version conflicts
    check_version_conflict(db=db, etp_id=etp_id, if_match=if_match)

    # 2. Validate step data if requested
    if validate_step:
        validate_step_data(step_name=validate_step, data=patch_data)

    # 3. Perform the merge patch
    etp_service.perform_merge_patch(db=db, etp_id=etp_id, patch_data=patch_data)

    # 4. Increment the version
    updated_etp = crud.etp.increment_version(db=db, etp_id=etp_id)

    return updated_etp
