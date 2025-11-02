import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base_class import Base

class ETPWorkflowHistory(Base):
    __tablename__ = "etp_workflow_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(UUID(as_uuid=True), ForeignKey("etps.id"), nullable=False)
    status = Column(String, nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
