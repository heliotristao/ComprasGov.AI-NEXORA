from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.crud.base import CRUDBase
from app.db.models.etp import ETP
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

etp = CRUDETP(ETP)

def get_etp(db: Session, id: UUID) -> Optional[ETP]:
    return etp.get(db, id=id)
