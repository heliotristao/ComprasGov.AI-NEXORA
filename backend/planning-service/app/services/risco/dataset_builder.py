from __future__ import annotations

from typing import List

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from app.db.models.etp import ETP
from app.db.models.contracts import Contract


class RiskDatasetBuilder:
    """Responsável por construir datasets históricos para o modelo de risco."""

    def __init__(self, db: Session):
        self.db = db

    def build_historical_dataset(self) -> pd.DataFrame:
        """Constrói um dataset baseado nos dados reais cadastrados no sistema."""
        etps: List[ETP] = self.db.query(ETP).all()
        rows: list[dict] = []

        for etp in etps:
            contract: Contract | None = getattr(etp, "contract", None)
            if contract is None:
                contract = (
                    self.db.query(Contract)
                    .filter(Contract.etp_id == etp.id)
                    .first()
                )
            if contract is None:
                continue

            valor_estimado = self._extract_valor_estimado(etp)
            prazo_execucao = self._extract_prazo_execucao(etp)
            categoria_objeto = self._extract_categoria_objeto(etp)
            modalidade_licitacao = self._extract_modalidade(etp)

            if valor_estimado is None or prazo_execucao is None:
                continue

            rows.append(
                {
                    "valor_estimado_log": np.log1p(valor_estimado),
                    "prazo_execucao_dias": prazo_execucao,
                    "categoria_objeto": categoria_objeto,
                    "modalidade_licitacao": modalidade_licitacao,
                    "houve_atraso": int(
                        self._bool_from_dates(
                            contract.data_fim_real, contract.data_fim_prevista
                        )
                    ),
                    "houve_aditivo": 1 if (contract.valor_aditivos or 0) > 0 else 0,
                    "percentual_aditivo": self._percentual_aditivo(contract),
                    "risco_alto": int(
                        self._is_high_risk_contract(contract)
                    ),
                }
            )

        if not rows:
            return pd.DataFrame(
                columns=[
                    "valor_estimado_log",
                    "prazo_execucao_dias",
                    "categoria_objeto",
                    "modalidade_licitacao",
                    "risco_alto",
                ]
            )

        return pd.DataFrame(rows)

    def generate_synthetic_data(self, n_samples: int = 500) -> pd.DataFrame:
        """Gera dados sintéticos para bootstrap do modelo."""
        np.random.seed(42)
        data: list[dict] = []

        categorias = ["obra", "servico", "compra"]
        modalidades = ["pregao", "concorrencia", "dispensa"]

        for _ in range(n_samples):
            valor = np.random.lognormal(mean=12, sigma=1.5)
            prazo = int(np.random.randint(30, 730))
            categoria = np.random.choice(categorias)
            modalidade = np.random.choice(modalidades)

            risco_score = 0
            if valor > 1_000_000:
                risco_score += 30
            if prazo > 365:
                risco_score += 20
            if categoria == "obra":
                risco_score += 25

            risco_score += int(np.random.randint(-10, 10))
            risco_alto = 1 if risco_score > 50 else 0

            data.append(
                {
                    "valor_estimado_log": np.log1p(valor),
                    "prazo_execucao_dias": prazo,
                    "categoria_objeto": categoria,
                    "modalidade_licitacao": modalidade,
                    "risco_alto": risco_alto,
                }
            )

        return pd.DataFrame(data)

    @staticmethod
    def _extract_valor_estimado(etp: ETP) -> float | None:
        data = etp.data or {}
        candidates = [
            "valor_estimado",
            "valor_estimado_total",
            "estimativa_valor",
            "valorTotal",
        ]
        for key in candidates:
            value = data.get(key)
            if value is not None:
                try:
                    return float(value)
                except (TypeError, ValueError):
                    continue
        return None

    @staticmethod
    def _extract_prazo_execucao(etp: ETP) -> int | None:
        data = etp.data or {}
        candidates = [
            "prazo_execucao_dias",
            "prazo_execucao",
            "prazo_contrato",
            "prazo",
        ]
        for key in candidates:
            value = data.get(key)
            if isinstance(value, dict):
                value = value.get("dias") or value.get("valor")
            if value is not None:
                try:
                    return int(value)
                except (TypeError, ValueError):
                    continue
        return None

    @staticmethod
    def _extract_categoria_objeto(etp: ETP) -> str:
        data = etp.data or {}
        return (
            data.get("categoria_objeto")
            or data.get("categoria")
            or data.get("tipo_objeto")
            or "servico"
        )

    @staticmethod
    def _extract_modalidade(etp: ETP) -> str:
        data = etp.data or {}
        return (
            data.get("modalidade_licitacao")
            or data.get("modalidade")
            or "pregao"
        )

    @staticmethod
    def _bool_from_dates(real, prevista) -> bool:
        if real is None or prevista is None:
            return False
        return real > prevista

    @staticmethod
    def _percentual_aditivo(contract: Contract) -> float:
        valor_inicial = contract.valor_inicial or 0
        valor_aditivos = contract.valor_aditivos or 0
        if valor_inicial <= 0:
            return 0.0
        return float((valor_aditivos / valor_inicial) * 100)

    @staticmethod
    def _is_high_risk_contract(contract: Contract) -> bool:
        atrasado = RiskDatasetBuilder._bool_from_dates(
            contract.data_fim_real, contract.data_fim_prevista
        )
        aditivo_acima = (
            (contract.valor_aditivos or 0) > (contract.valor_inicial or 0) * 0.25
        )
        return atrasado or aditivo_acima
