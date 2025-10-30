import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class DocType(enum.Enum):
    ETP = "ETP"
    TR = "TR"
    LOG = "LOG"
    DRAFT = "DRAFT"


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(String, nullable=False)
    doc_type = Column(Enum(DocType), nullable=False)
    org_id = Column(String, nullable=False)
    author_id = Column(String, nullable=False)
    version = Column(Integer, nullable=False)
    filename = Column(String, nullable=False)
    s3_key = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
