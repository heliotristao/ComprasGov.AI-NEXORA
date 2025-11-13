from __future__ import annotations

import uuid
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, func, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.db.base_class import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero = Column(String(50), nullable=True)
    etp_id = Column(PGUUID(as_uuid=True), ForeignKey("etps.id"), nullable=False, unique=True)

    valor_inicial = Column(Float, nullable=False, default=0.0)
    valor_aditivos = Column(Float, nullable=False, default=0.0)

    data_inicio_prevista = Column(DateTime(timezone=True), nullable=True)
    data_fim_prevista = Column(DateTime(timezone=True), nullable=True)
    data_fim_real = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    etp = relationship("ETP", back_populates="contract")

    __table_args__ = (
        Index("idx_contract_etp_id", "etp_id"),
    )
