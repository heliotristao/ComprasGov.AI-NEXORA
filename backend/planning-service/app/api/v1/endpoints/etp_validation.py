from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.core.validators import etp_validator
from app.schemas.etp_validation import ETPValidationResponse
from app.db.models.user import User

router = APIRouter()


@router.get(
    "/{etp_id}/validate",
    response_model=ETPValidationResponse,
    summary="Validate ETP Compliance",
    description="Runs the compliance validation engine for a given ETP and returns the results.",
)
def validate_etp_compliance(
    etp_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Validates an ETP against a predefined set of compliance rules.
    """
    results = etp_validator.validate_etp(
        db, etp_id=etp_id, user_id=current_user.id
    )

    if results is None:
        raise HTTPException(status_code=404, detail="ETP not found")

    summary = {"errors": 0, "warnings": 0, "infos": 0}
    for result in results:
        if not result["passed"]:
            if result["severity"] == "error":
                summary["errors"] += 1
            elif result["severity"] == "warning":
                summary["warnings"] += 1
            else:
                summary["infos"] += 1

    return {"results": results, **summary}
