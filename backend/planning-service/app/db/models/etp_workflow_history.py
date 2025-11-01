from sqlalchemy import Column, DateTime, ForeignKey, String, func, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base
from app.db.models.etp import ETPStatus


class ETPWorkflowHistory(Base):
    __tablename__ = "etp_workflow_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(UUID(as_uuid=True), ForeignKey("etps.id"), nullable=False)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    actor_id = Column(String, nullable=False)
    comments = Column(Text, nullable=True)
    timestamp = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    etp = relationship("ETP")
