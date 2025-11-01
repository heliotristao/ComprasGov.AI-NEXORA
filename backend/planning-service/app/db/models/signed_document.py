import enum
import uuid
from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from app.db.base import Base

class DocumentType(enum.Enum):
    etp = "etp"
    tr = "tr"

class SignedDocument(Base):
    __tablename__ = "signed_documents"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(pgUUID(as_uuid=True), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    signed_by_id = Column(String, nullable=False)
    signed_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    artifact_id = Column(pgUUID(as_uuid=True), nullable=False)

    # In a real microservices world, this would be a replicated table
    # or there would be an event-driven mechanism to ensure integrity.
    # For now, we assume the user ID exists.
    # signed_by = relationship("User")
