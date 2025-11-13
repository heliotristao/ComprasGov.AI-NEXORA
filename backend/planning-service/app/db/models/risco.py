from __future__ import annotations

import uuid
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func, Index, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.db.base_class import Base


_jsonb_type = JSONB().with_variant(JSON(), "sqlite")


class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(PGUUID(as_uuid=True), ForeignKey("etps.id"), nullable=False, unique=True)

    score_global = Column(Float, nullable=False)
    categoria_risco = Column(String(20), nullable=False)

    probabilidade = Column(Integer, nullable=False)
    impacto = Column(Integer, nullable=False)

    fatores_principais = Column(_jsonb_type, nullable=False)
    recomendacoes = Column(_jsonb_type, nullable=False)

    model_version = Column(String(20), nullable=False)
    confidence_score = Column(Float, nullable=False)

    data_analise = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    etp = relationship("ETP", back_populates="risk_analysis")

    __table_args__ = (
        Index("idx_risk_etp_id", "etp_id"),
        Index("idx_risk_categoria", "categoria_risco"),
    )
