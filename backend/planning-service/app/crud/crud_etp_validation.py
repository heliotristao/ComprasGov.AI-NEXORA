from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import UUID
from app.db.models.etp_validation import ETPValidation
from app.schemas.etp_validation import ETPValidationCreate


def bulk_create_etp_validation_results(
    db: Session, *, results_in: list[ETPValidationCreate]
) -> list[ETPValidation]:
    db_objs = [ETPValidation(**result.dict()) for result in results_in]
    db.bulk_save_objects(db_objs, return_defaults=True)
    db.commit()
    return db_objs


def get_etp_validation_results_by_etp_id(
    db: Session, *, etp_id: UUID
) -> list[ETPValidation]:
    return db.query(ETPValidation).filter(ETPValidation.etp_id == etp_id).all()


def remove_etp_validation_results_by_etp_id(
    db: Session, *, etp_id: UUID
) -> int:
    num_deleted = db.query(ETPValidation).filter(ETPValidation.etp_id == etp_id).delete()
    db.commit()
    return num_deleted
