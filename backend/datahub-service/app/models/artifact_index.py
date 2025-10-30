from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import VECTOR

from app.db.base import Base
from app.models.artifact import DocType


class ArtifactIndex(Base):
    __tablename__ = "artifact_index"

    id = Column(Integer, primary_key=True, index=True)
    artifact_id = Column(UUID(as_uuid=True), ForeignKey("artifacts.id"), nullable=False)
    doc_type = Column(String, nullable=False)
    org_id = Column(String, nullable=False)
    embedding = Column(VECTOR(1536))
    summary = Column(Text)

    artifact = relationship("Artifact")
