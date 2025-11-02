import uuid
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class IAAcceptanceHistory(Base):
    __tablename__ = "ia_acceptance_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(UUID(as_uuid=True), ForeignKey("etps.id"), nullable=False, index=True)
    section_name = Column(String, nullable=False)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("ai_executions.id"), nullable=False, index=True)
    accepted_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    accepted_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    diff = Column(Text, nullable=True)

    etp = relationship("ETP")
    ai_execution = relationship("AIExecution")
    accepted_by = relationship("User")
