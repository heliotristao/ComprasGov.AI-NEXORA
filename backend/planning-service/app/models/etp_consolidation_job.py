import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ETPConsolidationJob(Base):
    __tablename__ = "etp_consolidation_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(UUID(as_uuid=True), ForeignKey("etps.id"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True, default=uuid.uuid4)

    status = Column(String, nullable=False, default="queued")
    artifact_id = Column(UUID(as_uuid=True), nullable=True)
    checksum_sha1 = Column(String, nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    error_log = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    etp = relationship("ETP", back_populates="consolidation_jobs")
