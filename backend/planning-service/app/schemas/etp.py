import enum
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel
from typing_extensions import Annotated
from pydantic import StringConstraints


# Replicating Enum from model
class ETPStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


EdocsType = Annotated[str, StringConstraints(pattern=r"^\d{4}-\d{6}$")]

# Schema for creating an ETP
class ETPCreate(BaseModel):
    process_id: Optional[str] = None
    status: Optional[ETPStatus] = ETPStatus.DRAFT
    step: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    edocs: EdocsType
    created_by: Optional[str] = None
    org_id: Optional[str] = None


# Schema for updating an ETP
class ETPUpdate(BaseModel):
    process_id: Optional[str] = None
    status: Optional[ETPStatus] = None
    step: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    edocs: Optional[EdocsType] = None
    updated_by: Optional[str] = None


# The main schema for returning ETP data
class ETPSchema(BaseModel):
    id: uuid.UUID
    process_id: Optional[str]
    status: ETPStatus
    step: Optional[str]
    data: Optional[dict[str, Any]]
    edocs: EdocsType
    created_by: Optional[str]
    updated_by: Optional[str]
    org_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        use_enum_values = True
