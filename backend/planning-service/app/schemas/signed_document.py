import uuid
import enum
from datetime import datetime
from pydantic import BaseModel

class DocumentType(str, enum.Enum):
    etp = "etp"
    tr = "tr"

class SignedDocumentBase(BaseModel):
    document_id: uuid.UUID
    document_type: DocumentType
    artifact_id: uuid.UUID

class SignedDocumentCreate(SignedDocumentBase):
    signed_by_id: str

class SignedDocumentSchema(SignedDocumentBase):
    id: uuid.UUID
    signed_by_id: str
    signed_at: datetime

    class Config:
        from_attributes = True
