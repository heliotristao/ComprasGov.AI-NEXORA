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

# Base Schema
class ETPBase(BaseModel):
    title: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    edocs_number: Optional[EdocsType] = None

# Schema for creating an ETP
class ETPCreate(ETPBase):
    title: str


# Schema for updating an ETP
class ETPUpdate(ETPBase):
    status: Optional[ETPStatus] = None


# Schema for patch updates
class ETPPatch(ETPBase):
    pass


# Schema returned to the client
class ETPSchema(ETPBase):
    id: uuid.UUID
    status: ETPStatus
    version: int
    current_step: int
    created_by_id: uuid.UUID
    updated_by: Optional[str]
    current_approver_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        use_enum_values = True

# Schema for data in DB
class ETPInDB(ETPSchema):
    pass


# Schema for accepting an AI suggestion
class ETPAcceptIA(BaseModel):
    trace_id: uuid.UUID
