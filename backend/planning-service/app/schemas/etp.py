import enum
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel
from typing_extensions import Annotated
from pydantic import StringConstraints


# Replicating Enum from model
class ETPStatus(str, enum.Enum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"
    published = "published"
    archived = "archived"
    signed = "signed"


EdocsType = Annotated[str, StringConstraints(pattern=r"^\d{4}-\d{6}$")]

# Schema for creating an ETP
class ETPCreate(BaseModel):
    title: str
    data: Optional[dict[str, Any]] = None
    created_by: Optional[str] = None


# Schema for updating an ETP
class ETPUpdate(BaseModel):
    title: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    updated_by: Optional[str] = None


# The main schema for returning ETP data
class ETPSchema(BaseModel):
    id: uuid.UUID
    title: str
    status: ETPStatus
    step: int
    data: Optional[dict[str, Any]]
    created_by: str
    updated_by: Optional[str]
    current_approver_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        use_enum_values = True


# Schema for accepting an AI suggestion
class ETPAcceptIA(BaseModel):
    trace_id: uuid.UUID
