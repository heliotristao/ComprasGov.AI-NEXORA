import uuid
from sqlalchemy import Column, String, Float, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base

class AIExecution(Base):
    __tablename__ = "ai_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    provider_used = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    cost = Column(Float, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    trace_id = Column(String, nullable=True, index=True)
