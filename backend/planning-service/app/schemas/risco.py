from __future__ import annotations

import uuid
from datetime import datetime
from typing import Dict, List

from pydantic import BaseModel, Field


class RiskFactor(BaseModel):
    fator: str
    impacto: float
    valor: float


class RiskRecommendation(BaseModel):
    tipo: str
    descricao: str
    prioridade: str


class RiskAnalysisBase(BaseModel):
    etp_id: uuid.UUID
    score_global: float = Field(..., description="Probabilidade agregada em escala 0-100.")
    categoria_risco: str = Field(..., description="baixo | medio | alto | critico")
    probabilidade: int = Field(..., ge=1, le=5)
    impacto: int = Field(..., ge=1, le=5)
    fatores_principais: List[RiskFactor]
    recomendacoes: List[RiskRecommendation]
    model_version: str
    confidence_score: float


class RiskAnalysisResponse(RiskAnalysisBase):
    id: uuid.UUID
    data_analise: datetime

    class Config:
        from_attributes = True


class RiskAnalysisRequest(BaseModel):
    etp_id: uuid.UUID
    forcar_reprocessamento: bool = Field(
        False, description="Quando verdadeiro, recalcula mesmo se já existir análise."
    )


class RiskMatrixResponse(BaseModel):
    matriz: List[List[int]]
    total_analises: int
    distribuicao: Dict[str, int]
