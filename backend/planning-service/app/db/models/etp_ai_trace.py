"""
Modelo de Dados para Rastreabilidade de IA do ETP
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func

from app.db.base import Base


class ETPAITrace(Base):
    __tablename__ = "etp_ai_traces"

    id = Column(Integer, primary_key=True, index=True)
    etp_id = Column(Integer, ForeignKey("documentos_etp.id"), nullable=False, index=True)
    field = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)
    provider = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ETPAITrace(id={self.id}, etp_id={self.etp_id}, field='{self.field}')>"
