"""Utilities to assemble datasets for the predictive Risco.AI model."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from app.db.models.etp import ETP


class RiskDatasetBuilder:
    """Builds historical and synthetic datasets for the risk model."""

    def __init__(self, db: Optional[Session] = None) -> None:
        self.db = db

    # ---------------------------------------------------------------------
    # Dataset construction helpers
    # ---------------------------------------------------------------------
    def build_historical_dataset(self) -> pd.DataFrame:
        """Constructs a dataset from persisted ETPs (if any)."""

        if self.db is None:
            return pd.DataFrame()

        etps: List[ETP] = self.db.query(ETP).all()
        rows: List[Dict[str, Any]] = []

        for etp in etps:
            record = self._build_record_from_etp(etp)
            if record:
                rows.append(record)

        return pd.DataFrame(rows)

    def build_training_dataset(self, synthetic_samples: int = 400) -> pd.DataFrame:
        """Combines historical and synthetic data for robust training."""

        historical = self.build_historical_dataset()
        synthetic = self.generate_synthetic_data(synthetic_samples)

        if historical.empty:
            return synthetic
        if synthetic.empty:
            return historical

        return pd.concat([historical, synthetic], ignore_index=True)

    # ------------------------------------------------------------------
    # Synthetic data
    # ------------------------------------------------------------------
    def generate_synthetic_data(self, n_samples: int = 500) -> pd.DataFrame:
        """Generates a balanced synthetic dataset for model bootstrapping."""

        rng = np.random.default_rng(seed=42)
        categories = np.array(["obra", "servico", "compra"])
        modalities = np.array(["pregao", "concorrencia", "dispensa"])

        data: List[Dict[str, Any]] = []
        for _ in range(n_samples):
            valor_estimado = float(rng.lognormal(mean=13, sigma=1.1))
            prazo = int(rng.integers(30, 900))
            categoria = rng.choice(categories)
            modalidade = rng.choice(modalities)

            score = 0
            score += 0.00002 * valor_estimado
            if prazo > 360:
                score += 15
            if categoria == "obra":
                score += 20
            if modalidade == "concorrencia":
                score += 10
            score += rng.normal(0, 5)

            risco_alto = 1 if score >= 55 else 0

            data.append(
                {
                    "valor_estimado_log": np.log1p(valor_estimado),
                    "prazo_execucao_dias": prazo,
                    "categoria_objeto": categoria,
                    "modalidade_licitacao": modalidade,
                    "risco_alto": risco_alto,
                }
            )

        return pd.DataFrame(data)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------
    def _build_record_from_etp(self, etp: ETP) -> Optional[Dict[str, Any]]:
        data = etp.data or {}

        valor_estimado = self._search_value(data, ["valor_estimado", "valor_estimado_total"])
        prazo_execucao = self._search_value(data, ["prazo_execucao", "prazo_execucao_dias"])
        categoria_objeto = self._search_value(data, ["categoria_objeto", "categoria"])
        modalidade = self._search_value(data, ["modalidade_licitacao", "modalidade"])

        valor_estimado_float = self._to_float(valor_estimado, default=0.0)
        prazo_execucao_int = self._to_int(prazo_execucao, default=0)

        categoria_objeto = (categoria_objeto or "servico").lower()
        modalidade = (modalidade or "pregao").lower()

        risco_score = 0.0
        risco_score += 0.00002 * valor_estimado_float
        risco_score += prazo_execucao_int / 30
        if categoria_objeto == "obra":
            risco_score += 20
        if modalidade == "concorrencia":
            risco_score += 8

        risco_alto = 1 if risco_score >= 60 else 0

        return {
            "valor_estimado_log": np.log1p(valor_estimado_float),
            "prazo_execucao_dias": prazo_execucao_int,
            "categoria_objeto": categoria_objeto,
            "modalidade_licitacao": modalidade,
            "risco_alto": risco_alto,
        }

    def _search_value(self, data: Any, keys: List[str]) -> Optional[Any]:
        if not data:
            return None

        for key in keys:
            value = self._recursive_search(data, key)
            if value not in (None, ""):
                return value
        return None

    def _recursive_search(self, node: Any, key: str) -> Optional[Any]:
        if isinstance(node, dict):
            if key in node:
                return node[key]
            for value in node.values():
                found = self._recursive_search(value, key)
                if found not in (None, ""):
                    return found
        elif isinstance(node, list):
            for value in node:
                found = self._recursive_search(value, key)
                if found not in (None, ""):
                    return found
        return None

    def _to_float(self, value: Any, default: float = 0.0) -> float:
        if value is None:
            return default
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            value = value.replace(".", "").replace(",", ".")
            digits = "".join(ch for ch in value if ch.isdigit() or ch == ".")
            if digits:
                try:
                    return float(digits)
                except ValueError:
                    return default
        return default

    def _to_int(self, value: Any, default: int = 0) -> int:
        if value is None:
            return default
        if isinstance(value, (int, float)):
            return int(value)
        if isinstance(value, str):
            digits = "".join(ch for ch in value if ch.isdigit())
            if digits:
                return int(digits)
        return default
