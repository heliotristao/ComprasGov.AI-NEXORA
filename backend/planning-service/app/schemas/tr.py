from pydantic import BaseModel
import uuid
from typing import Optional, Dict, Any

from app.db.models.tr import TRType


class TRBase(BaseModel):
    title: Optional[str] = None
    type: Optional[TRType] = None
    data: Optional[Dict[str, Any]] = None
    gaps: Optional[Dict[str, Any]] = None


class TRCreate(TRBase):
    etp_id: uuid.UUID
    title: str
    type: TRType
    data: Dict[str, Any]
    gaps: Dict[str, Any]


class TRUpdate(TRBase):
    pass


class TRInDBBase(TRBase):
    id: uuid.UUID
    etp_id: uuid.UUID
    created_by: str

    class Config:
        from_attributes = True


class TR(TRInDBBase):
    pass
