from typing import Any, Dict, Optional, Union
import uuid

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.db.models.tr import TR
from app.schemas.tr import TRCreate, TRUpdate


class CRUDTR(CRUDBase[TR, TRCreate, TRUpdate]):
    def create(self, db: Session, *, obj_in: TRCreate, created_by: str) -> TR:
        db_obj = TR(
            etp_id=obj_in.etp_id,
            type=obj_in.type,
            title=obj_in.title,
            data=obj_in.data,
            gaps=obj_in.gaps,
            created_by=created_by,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: TR,
        obj_in: Union[TRUpdate, Dict[str, Any]],
        updated_by: str
    ) -> TR:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        update_data["updated_by"] = updated_by
        return super().update(db, db_obj=db_obj, obj_in=update_data)


tr = CRUDTR(TR)
