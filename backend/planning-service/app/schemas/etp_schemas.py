from pydantic import BaseModel, StringConstraints, field_validator
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


class ETPPartialUpdate(BaseModel):
    data: Optional[Dict[str, Any]] = None
    step: Optional[int] = None
    status: Optional[ETPStatus] = None

    @field_validator('status')
    def validate_status(cls, v):
        if v not in [status for status in ETPStatus]:
            raise ValueError(f"Invalid status: {v}")
        return v


class ETPOut(ETPBase):
    id: UUID
    created_by: str
    updated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
