import enum
import uuid

from sqlalchemy import (Column, DateTime, Enum, Index, String, text, Integer, JSON)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from sqlalchemy.sql import func


class ETPStatus(enum.Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ETP(Base):
    __tablename__ = 'etp'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(String, index=True)
    status = Column(Enum(ETPStatus), default=ETPStatus.DRAFT, index=True)
    step = Column(String)
    data = Column(JSON)
    edocs = Column(String, unique=True)
    created_by = Column(String)
    updated_by = Column(String)
    org_id = Column(String, index=True)
    version = Column(Integer, nullable=False, default=1, server_default='1')

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True))

    consolidation_jobs = relationship("app.models.etp_consolidation_job.ETPConsolidationJob", back_populates="etp", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_etp_status', 'status'),
        Index('ix_etp_created_at', 'created_at'),
        Index('ix_etp_org_id', 'org_id'),
    )
