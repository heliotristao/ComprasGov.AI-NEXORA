"""Database models that power the Risco.AI module."""

from __future__ import annotations

import uuid
from sqlalchemy import Column, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class RiskAnalysis(Base):
    """Stores the last predictive risk analysis executed for an ETP."""

    __tablename__ = "risk_analysis"

    id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    etp_id = Column(
        UUID(as_uuid=True), ForeignKey("etps.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    score_global = Column(Float, nullable=False)
    categoria_risco = Column(String(20), nullable=False)
    probabilidade = Column(Integer, nullable=False)
    impacto = Column(Integer, nullable=False)

    fatores_principais = Column(JSONB(astext_type=Text()).with_variant(JSON(), "sqlite"))
    recomendacoes = Column(JSONB(astext_type=Text()).with_variant(JSON(), "sqlite"))

    model_version = Column(String(20), nullable=True)
    confidence_score = Column(Float, nullable=True)

    data_analise = Column(DateTime(timezone=True), server_default=func.now())

    etp = relationship("ETP", back_populates="risk_analysis")

    __table_args__ = (
        Index("idx_risk_etp_id", "etp_id"),
        Index("idx_risk_categoria", "categoria_risco"),
        {"extend_existing": True},
    )


__all__ = ["RiskAnalysis"]
