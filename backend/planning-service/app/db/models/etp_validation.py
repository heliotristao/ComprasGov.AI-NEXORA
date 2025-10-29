import enum
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base


class Severity(enum.Enum):
    error = "error"
    warning = "warning"
    info = "info"


class ETPValidation(Base):
    __tablename__ = "etp_validations"

    id = Column(Integer, primary_key=True, index=True)
    etp_id = Column(UUID(as_uuid=True), ForeignKey("etps.id"), nullable=False)
    rule_code = Column(String, nullable=False)
    description = Column(String, nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    passed = Column(Boolean, nullable=False)
    suggestion = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    etp = relationship("ETP", back_populates="validations")
