import enum
import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    JSON,
    func,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class TRType(str, enum.Enum):
    BEM = "bem"
    SERVICO = "servico"


class TRStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class TR(Base):
    __tablename__ = "trs"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(pgUUID(as_uuid=True), ForeignKey("etps.id"), nullable=False, index=True)

    type = Column(Enum(TRType), nullable=False)
    edocs_number = Column(String, nullable=True)
    title = Column(String, nullable=False)
    status = Column(Enum(TRStatus), default=TRStatus.DRAFT, nullable=False)
    step = Column(Integer, default=1, nullable=False)

    data = Column(JSON, nullable=False, default={})
    gaps = Column(JSON, nullable=False, default={})

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

    etp = relationship("ETP", backref="trs")
    versions = relationship("TRVersion", back_populates="tr")

    __table_args__ = (
        Index("ix_trs_edocs_number", "edocs_number"),
        Index("ix_trs_status", "status"),
        Index("ix_trs_created_by", "created_by"),
    )

    def __repr__(self):
        return f"<TR(id={self.id}, etp_id={self.etp_id}, title='{self.title}', status='{self.status}')>"
