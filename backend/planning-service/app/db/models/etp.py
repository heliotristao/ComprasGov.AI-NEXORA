import enum
from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
    Index,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base


class ETPStatus(enum.Enum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"
    published = "published"
    archived = "archived"
    signed = "signed"


class ETP(Base):
    __tablename__ = "etps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    edocs_number = Column(String, unique=True, nullable=True)
    title = Column(String, nullable=False)
    status = Column(Enum(ETPStatus), default=ETPStatus.draft, nullable=False)
    current_step = Column(Integer, default=1, nullable=False)
    data = Column(JSON, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    updated_by = Column(String, nullable=True)
    current_approver_id = Column(String, nullable=True)
    version = Column(Integer, default=1, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    created_by = relationship("User", back_populates="etps")

    validations = relationship(
        "ETPValidation", back_populates="etp", cascade="all, delete-orphan"
    )
    consolidation_jobs = relationship("ETPConsolidationJob", back_populates="etp")

    __table_args__ = (
        Index("ix_etps_edocs_number", "edocs_number", unique=True),
        Index("ix_etps_status", "status"),
        Index("ix_etps_created_by_id", "created_by_id"),
        {'extend_existing': True}
    )
