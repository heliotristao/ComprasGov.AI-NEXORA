from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.db.models.etp import ETP
from app.schemas.etp_schemas import ETPCreate, ETPUpdate, ETPPartialUpdate


def create_etp(db: Session, *, etp_in: ETPCreate, created_by: str) -> ETP:
    """
    Create a new ETP.
    """
    db_obj = ETP(**etp_in.dict(exclude_unset=True), created_by=created_by)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def increment_version(db: Session, *, etp_id: UUID) -> ETP:
    """
    Atomically increments the version of an ETP document.
    """
    etp = db.query(ETP).filter(ETP.id == etp_id).with_for_update().first()
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    etp.version += 1
    db.commit()
    db.refresh(etp)
    return etp


def patch_etp(db: Session, *, etp_id: UUID, patch: ETPPartialUpdate, user_id: str) -> Optional[ETP]:
    """
    Partially update an ETP.
    """
    db_obj = get_etp(db=db, etp_id=etp_id)
    if not db_obj:
        return None

    patch_data = patch.dict(exclude_unset=True)
    for field, value in patch_data.items():
        if field == "data":
            if db_obj.data is None:
                db_obj.data = {}
            db_obj.data.update(value)
            flag_modified(db_obj, "data")
        else:
            setattr(db_obj, field, value)

    db_obj.updated_by = user_id
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
