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

from app.db.base import Base


class ETPStatus(enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class ETP(Base):
    __tablename__ = "etps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    edocs_number = Column(String, nullable=True)
    title = Column(String, nullable=False)
    status = Column(Enum(ETPStatus), default=ETPStatus.draft, nullable=False)
    step = Column(Integer, default=1, nullable=False)
    data = Column(JSON, nullable=True)
    created_by = Column(String, nullable=False)
    updated_by = Column(String, nullable=True)

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

    __table_args__ = (
        Index("ix_etps_edocs_number", "edocs_number"),
        Index("ix_etps_status", "status"),
        Index("ix_etps_created_by", "created_by"),
    )
