from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.etp import ETP
from app.schemas.etp_schemas import ETPCreate, ETPUpdate


def create_etp(db: Session, *, etp_in: ETPCreate, created_by: str) -> ETP:
    """
    Create a new ETP.
    """
    db_obj = ETP(**etp_in.dict(exclude_unset=True), created_by=created_by)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_etp(db: Session, *, etp_id: UUID) -> Optional[ETP]:
    """
    Get an ETP by ID, excluding soft-deleted records.
    """
    return db.query(ETP).filter(ETP.id == etp_id, ETP.deleted_at.is_(None)).first()


def update_etp(db: Session, *, db_obj: ETP, obj_in: ETPUpdate) -> ETP:
    """
    Update an ETP.
    """
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def soft_delete_etp(db: Session, *, db_obj: ETP) -> ETP:
    """
    Soft delete an ETP by setting the deleted_at timestamp.
    """
    db_obj.deleted_at = datetime.now(timezone.utc)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
