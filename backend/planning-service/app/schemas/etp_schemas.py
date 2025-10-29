from pydantic import BaseModel, StringConstraints
from typing import Optional, Dict, Any, Annotated
from uuid import UUID
from datetime import datetime
from app.db.models.etp import ETPStatus


class ETPBase(BaseModel):
    title: Optional[str] = None
    edocs_number: Optional[Annotated[str, StringConstraints(pattern=r"^\d{4}-[A-Z0-9]{6}$")]] = None
    status: Optional[ETPStatus] = None
    step: Optional[int] = None
    data: Optional[Dict[str, Any]] = None


class ETPCreate(ETPBase):
    title: str


class ETPUpdate(ETPBase):
    pass


class ETPOut(ETPBase):
    id: UUID
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
