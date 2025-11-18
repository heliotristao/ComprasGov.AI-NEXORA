from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.crud.base import CRUDBase
from app.db.models.etp import ETP, ETPStatus
from app.schemas.etp import ETPCreate, ETPUpdate, ETPPatch


class CRUDETP(CRUDBase[ETP, ETPCreate, ETPUpdate]):
    def create(self, db: Session, *, obj_in: ETPCreate, created_by: UUID | str | None = None) -> ETP:
        created_by_id = None
        if created_by is not None:
            created_by_id = created_by if isinstance(created_by, UUID) else UUID(str(created_by))
        elif hasattr(obj_in, "created_by_id"):
            created_by_id = getattr(obj_in, "created_by_id")

        if created_by_id is None:
            return super().create(db=db, obj_in=obj_in)

        db_obj = self.model(**obj_in.dict(), created_by_id=created_by_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def create_with_owner(self, db: Session, *, obj_in: ETPCreate, created_by_id: UUID) -> ETP:
        db_obj = self.model(**obj_in.dict(), created_by_id=created_by_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, id: UUID) -> Optional[ETP]:
        return db.query(self.model).filter(self.model.id == id, self.model.deleted_at.is_(None)).first()

    def get_etp(self, db: Session, etp_id: UUID) -> Optional[ETP]:
        return self.get(db=db, id=etp_id)

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ETP]:
        return db.query(self.model).filter(self.model.deleted_at.is_(None)).offset(skip).limit(limit).all()

    def update(self, db: Session, *, db_obj: ETP, obj_in: ETPUpdate) -> ETP:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        for field, value in update_data.items():
            if field == "data" and db_obj.data:
                db_obj.data.update(value)
                flag_modified(db_obj, "data")
            else:
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def patch(self, db: Session, *, db_obj: ETP, obj_in: ETPPatch, version: int) -> ETP:
        """
        Patch an ETP with optimistic concurrency control.
        """
        original_version = db_obj.version
        if db_obj.version != version:
            raise HTTPException(
                status_code=409,
                detail="Conflict: The document has been modified by another process. Please refresh and try again.",
            )

        update_data = obj_in.dict(exclude_unset=True)

        for field, value in update_data.items():
            if field == "data" and db_obj.data and isinstance(value, dict):
                db_obj.data.update(value)
                flag_modified(db_obj, "data")
            else:
                setattr(db_obj, field, value)

        db_obj.version += 1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        return db_obj

    def remove(self, db: Session, *, id: UUID) -> ETP:
        db_obj = db.query(self.model).get(id)
        db_obj.deleted_at = datetime.now(timezone.utc)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_status(self, db: Session, *, etp_id: UUID, new_status: ETPStatus, comments: str | None = None) -> ETP:
        etp_obj = self.get(db=db, id=etp_id)
        if not etp_obj:
            raise HTTPException(status_code=404, detail="ETP not found")

        etp_obj.status = new_status
        if comments:
            etp_obj.updated_by = comments

        db.add(etp_obj)
        db.commit()
        db.refresh(etp_obj)
        return etp_obj

    def increment_version(self, db: Session, *, etp_id: UUID) -> ETP:
        etp_obj = self.get(db=db, id=etp_id)
        if not etp_obj:
            raise HTTPException(status_code=404, detail="ETP not found")

        etp_obj.version += 1
        db.add(etp_obj)
        db.commit()
        db.refresh(etp_obj)
        return etp_obj

etp = CRUDETP(ETP)

def get_etp(db: Session, id: UUID) -> Optional[ETP]:
    return etp.get(db, id=id)

# Compatibility wrappers so consumers can access CRUD operations via the module alias
def create(db: Session, *, obj_in: ETPCreate, created_by: UUID | str | None = None) -> ETP:
    return etp.create(db=db, obj_in=obj_in, created_by=created_by)


def create_with_owner(db: Session, *, obj_in: ETPCreate, created_by_id: UUID) -> ETP:
    return etp.create_with_owner(db=db, obj_in=obj_in, created_by_id=created_by_id)


def get(db: Session, id: UUID) -> Optional[ETP]:
    return etp.get(db=db, id=id)


def get_multi(db: Session, *, skip: int = 0, limit: int = 100) -> List[ETP]:
    return etp.get_multi(db=db, skip=skip, limit=limit)


def patch(db: Session, *, db_obj: ETP, obj_in: ETPPatch, version: int) -> ETP:
    return etp.patch(db=db, db_obj=db_obj, obj_in=obj_in, version=version)


def update(db: Session, *, db_obj: ETP, obj_in: ETPUpdate) -> ETP:
    return etp.update(db=db, db_obj=db_obj, obj_in=obj_in)


def remove(db: Session, *, id: UUID) -> ETP:
    return etp.remove(db=db, id=id)


def increment_version(db: Session, *, etp_id: UUID) -> ETP:
    return etp.increment_version(db=db, etp_id=etp_id)


def update_status(db: Session, *, etp_id: UUID, new_status: ETPStatus, comments: str | None = None) -> ETP:
    return etp.update_status(db=db, etp_id=etp_id, new_status=new_status, comments=comments)
