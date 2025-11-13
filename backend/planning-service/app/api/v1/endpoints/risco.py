from __future__ import annotations

import uuid
from typing import Any

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models.etp import ETP
from app.db.models.risco import RiskAnalysis
from app.schemas.risco import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    RiskMatrixResponse,
)
from app.services.messaging.kafka import publish_event
from app.services.risco.risk_model import RiskModel

router = APIRouter()


@router.post("/analisar", response_model=RiskAnalysisResponse)
async def analisar_risco(
    payload: RiskAnalysisRequest,
    _current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RiskAnalysisResponse:
    etp: ETP | None = db.query(ETP).filter(ETP.id == payload.etp_id).first()
    if etp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ETP não encontrado")

    existing: RiskAnalysis | None = (
        db.query(RiskAnalysis).filter(RiskAnalysis.etp_id == payload.etp_id).first()
    )
    if existing and not payload.forcar_reprocessamento:
        return existing

    features = _build_etp_features(etp)
    model = RiskModel()
    resultado = model.analyze(features)

    if existing:
        for campo, valor in resultado.items():
            setattr(existing, campo, valor)
        analysis = existing
    else:
        analysis = RiskAnalysis(id=uuid.uuid4(), etp_id=payload.etp_id, **resultado)

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    await publish_event(
        "planejamento.risco.calculado",
        {
            "risk_id": str(analysis.id),
            "etp_id": str(payload.etp_id),
            "score_global": analysis.score_global,
            "categoria_risco": analysis.categoria_risco,
        },
    )

    return analysis


@router.get("/matriz", response_model=RiskMatrixResponse)
def matriz_risco(
    orgao_id: str | None = None,
    _current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RiskMatrixResponse:
    analyses = db.query(RiskAnalysis).all()
    if orgao_id:
        analyses = [
            analysis
            for analysis in analyses
            if str((analysis.etp.data or {}).get("orgao_id")) == orgao_id
        ]

    matriz = [[0 for _ in range(5)] for _ in range(5)]
    for analysis in analyses:
        prob_idx = max(0, min(4, (analysis.probabilidade or 1) - 1))
        impact_idx = max(0, min(4, (analysis.impacto or 1) - 1))
        matriz[prob_idx][impact_idx] += 1

    distribuicao = {
        "baixo": sum(1 for a in analyses if a.categoria_risco == "baixo"),
        "medio": sum(1 for a in analyses if a.categoria_risco == "medio"),
        "alto": sum(1 for a in analyses if a.categoria_risco == "alto"),
        "critico": sum(1 for a in analyses if a.categoria_risco == "critico"),
    }

    return RiskMatrixResponse(
        matriz=matriz,
        total_analises=len(analyses),
        distribuicao=distribuicao,
    )


@router.get("/{etp_id}", response_model=RiskAnalysisResponse)
def recuperar_analise(
    etp_id: uuid.UUID,
    _current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RiskAnalysisResponse:
    analysis = db.query(RiskAnalysis).filter(RiskAnalysis.etp_id == etp_id).first()
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Análise não encontrada")
    return analysis


def _build_etp_features(etp: ETP) -> dict[str, Any]:
    data = etp.data or {}

    valor_estimado = _extract_float(
        data,
        ["valor_estimado", "valor_estimado_total", "estimativa_valor"],
        default=0.0,
    )
    prazo_execucao = _extract_int(
        data,
        ["prazo_execucao_dias", "prazo_execucao", "prazo", "prazo_contrato"],
        default=0,
    )
    categoria_objeto = (
        data.get("categoria_objeto")
        or data.get("categoria")
        or data.get("tipo_objeto")
        or "servico"
    )
    modalidade_licitacao = data.get("modalidade_licitacao") or data.get("modalidade") or "pregao"

    return {
        "valor_estimado_log": float(np.log1p(max(valor_estimado, 0.0))),
        "prazo_execucao_dias": int(max(prazo_execucao, 0)),
        "categoria_objeto": str(categoria_objeto),
        "modalidade_licitacao": str(modalidade_licitacao),
    }


def _extract_float(data: dict[str, Any], keys: list[str], default: float) -> float:
    for key in keys:
        value = data.get(key)
        if isinstance(value, dict):
            value = value.get("valor") or value.get("total")
        if value is None:
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            continue
    return default


def _extract_int(data: dict[str, Any], keys: list[str], default: int) -> int:
    for key in keys:
        value = data.get(key)
        if isinstance(value, dict):
            value = value.get("dias") or value.get("valor")
        if value is None:
            continue
        try:
            return int(value)
        except (TypeError, ValueError):
            continue
    return default
