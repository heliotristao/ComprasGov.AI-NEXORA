from sqlalchemy.orm import Session
from uuid import UUID
from app.crud import crud_etp
from app.crud import crud_etp_validation
from app.services import rule_engine
from app.schemas.etp_validation import ETPValidationCreate


def validate_etp(db: Session, *, etp_id: UUID, user_id: str):
    """
    Orchestrates the ETP validation process.
    """
    etp = crud_etp.get_etp(db, id=etp_id)
    if not etp:
        return None

    etp_data = etp.data or {}
    validation_results = rule_engine.run_etp_validation(etp_data)

    crud_etp_validation.remove_etp_validation_results_by_etp_id(db, etp_id=etp_id)

    validations_to_create = [
        ETPValidationCreate(
            etp_id=etp_id,
            rule_code=result["rule_code"],
            description=result["description"],
            severity=result["severity"],
            passed=result["passed"],
            suggestion=result["suggestion"],
        )
        for result in validation_results
    ]

    if not validations_to_create:
        return []

    new_results = crud_etp_validation.bulk_create_etp_validation_results(
        db, results_in=validations_to_create
    )

    return new_results
