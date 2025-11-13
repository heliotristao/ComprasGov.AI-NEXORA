"""Predictive model orchestration for the Risco.AI module."""

from __future__ import annotations

import math
import pickle
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import _tree

from app.services.risco.dataset_builder import RiskDatasetBuilder


class RiskModel:
    """Wraps the XGBoost classifier used for predictive risk scoring."""

    def __init__(self) -> None:
        self.model = RandomForestClassifier(
            n_estimators=300,
            max_depth=10,
            min_samples_leaf=3,
            class_weight="balanced_subsample",
            random_state=42,
            n_jobs=-1,
        )
        self.encoders: Dict[str, LabelEncoder] = {}
        self.version = "1.0.0"
        self.model_path = Path(__file__).resolve().parents[2] / "ml_models" / "risk_model.pkl"
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        self.feature_count = 0

    # ------------------------------------------------------------------
    # Training helpers
    # ------------------------------------------------------------------
    def prepare_features(self, df: pd.DataFrame, fit_encoders: bool = False) -> np.ndarray:
        df = df.copy()
        df["categoria_objeto"] = df["categoria_objeto"].fillna("desconhecido").astype(str)
        df["modalidade_licitacao"] = df["modalidade_licitacao"].fillna("pregao").astype(str)

        for col in ["categoria_objeto", "modalidade_licitacao"]:
            values = df[col]
            if fit_encoders or col not in self.encoders:
                encoder = LabelEncoder()
                encoder.fit(values)
                self.encoders[col] = encoder
            else:
                encoder = self.encoders[col]
                combined = np.unique(np.concatenate([encoder.classes_, values.unique()]))
                if combined.shape[0] != encoder.classes_.shape[0]:
                    encoder.classes_ = combined

            encoded_column = self.encoders[col].transform(values)
            df[f"{col}_encoded"] = encoded_column

        feature_cols = [
            "valor_estimado_log",
            "prazo_execucao_dias",
            "categoria_objeto_encoded",
            "modalidade_licitacao_encoded",
        ]
        return df[feature_cols].values

    def train(self, df: pd.DataFrame) -> Dict[str, Any]:
        if df.empty:
            raise ValueError("Training dataset is empty")

        X = self.prepare_features(df, fit_encoders=True)
        y = df["risco_alto"].values

        self.model.fit(X, y)
        self.feature_count = X.shape[1]

        auc_mean = 1.0
        if len(np.unique(y)) > 1 and len(df) > 1:
            cv_splits = min(5, len(df))
            if cv_splits >= 2:
                cv = StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=42)
                scores = cross_val_score(self.model, X, y, cv=cv, scoring="roc_auc")
                auc_mean = float(scores.mean())

        payload = {
            "model": self.model,
            "encoders": self.encoders,
            "version": self.version,
            "feature_count": self.feature_count,
        }
        with self.model_path.open("wb") as handler:
            pickle.dump(payload, handler)

        return {"auc": auc_mean, "version": self.version}

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def analyze(self, etp_data: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_model_loaded()

        df = pd.DataFrame([etp_data])
        X = self.prepare_features(df)

        proba = float(self.model.predict_proba(X)[0][1])
        score_global = proba * 100

        categoria, probabilidade, impacto = self._categorize(score_global)

        shap_values = self._compute_shap(X)
        fatores = self._format_top_factors(shap_values, etp_data, X)
        recomendacoes = self._generate_recommendations(categoria, fatores)

        return {
            "score_global": score_global,
            "categoria_risco": categoria,
            "probabilidade": probabilidade,
            "impacto": impacto,
            "fatores_principais": fatores,
            "recomendacoes": recomendacoes,
            "model_version": self.version,
            "confidence_score": max(proba, 1 - proba),
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------
    def _ensure_model_loaded(self) -> None:
        if self.model_path.exists():
            with self.model_path.open("rb") as handler:
                payload = pickle.load(handler)
                self.model = payload["model"]
                self.encoders = payload["encoders"]
                self.version = payload.get("version", self.version)
                self.feature_count = payload.get("feature_count", self.feature_count)
                return

        builder = RiskDatasetBuilder()
        dataset = builder.generate_synthetic_data(600)
        self.train(dataset)

    def _categorize(self, score: float) -> tuple[str, int, int]:
        if score < 25:
            return "baixo", 1, 2
        if score < 50:
            return "medio", 2, 3
        if score < 75:
            return "alto", 4, 4
        return "critico", 5, 5

    def _compute_shap(self, X: np.ndarray) -> np.ndarray:
        contributions = np.zeros((X.shape[0], self.feature_count or X.shape[1]))
        for row_idx, row in enumerate(X):
            contrib = np.zeros(self.feature_count or X.shape[1])
            for estimator in self.model.estimators_:
                _, tree_contrib = self._tree_contribution(estimator.tree_, row)
                contrib += tree_contrib
            contributions[row_idx] = contrib / len(self.model.estimators_)
        return contributions

    def _format_top_factors(
        self, shap_values: np.ndarray, etp_data: Dict[str, Any], X: np.ndarray
    ) -> List[Dict[str, Any]]:
        feature_names = [
            "valor_estimado_log",
            "prazo_execucao_dias",
            "categoria_objeto_encoded",
            "modalidade_licitacao_encoded",
        ]
        shap_row = shap_values[0]
        top_idx = np.argsort(np.abs(shap_row))[-5:][::-1]

        human_values = {
            "valor_estimado_log": math.expm1(float(etp_data.get("valor_estimado_log", 0.0))),
            "prazo_execucao_dias": float(etp_data.get("prazo_execucao_dias", 0.0)),
            "categoria_objeto_encoded": etp_data.get("categoria_objeto", "desconhecido"),
            "modalidade_licitacao_encoded": etp_data.get("modalidade_licitacao", "pregao"),
        }

        human_names = {
            "valor_estimado_log": "valor_estimado",
            "prazo_execucao_dias": "prazo_execucao",
            "categoria_objeto_encoded": "categoria_objeto",
            "modalidade_licitacao_encoded": "modalidade_licitacao",
        }

        fatores: List[Dict[str, Any]] = []
        for idx in top_idx:
            name = feature_names[idx]
            raw_value = human_values[name]
            if isinstance(raw_value, (int, float)):
                display_value: float | str = float(raw_value)
            else:
                display_value = raw_value
            fatores.append(
                {
                    "fator": human_names[name],
                    "impacto": float(shap_row[idx]),
                    "valor": display_value,
                }
            )
        return fatores

    def _tree_contribution(self, tree: _tree.Tree, row: np.ndarray) -> tuple[float, np.ndarray]:
        contributions = np.zeros(self.feature_count or row.shape[0])
        node = 0
        bias = self._node_probability(tree, node)

        while tree.feature[node] != _tree.TREE_UNDEFINED:
            feature_idx = tree.feature[node]
            threshold = tree.threshold[node]
            child = tree.children_left[node] if row[feature_idx] <= threshold else tree.children_right[node]
            parent_value = self._node_probability(tree, node)
            child_value = self._node_probability(tree, child)
            contributions[feature_idx] += child_value - parent_value
            node = child

        return bias, contributions

    def _node_probability(self, tree: _tree.Tree, node_index: int) -> float:
        value = tree.value[node_index][0]
        total = value.sum()
        if total == 0:
            return 0.0
        return float(value[-1] / total)

    def _generate_recommendations(
        self, categoria: str, fatores: List[Dict[str, Any]]
    ) -> List[Dict[str, str]]:
        recomendacoes: List[Dict[str, str]] = []

        if categoria in {"alto", "critico"}:
            recomendacoes.append(
                {
                    "tipo": "mitigacao",
                    "descricao": "Realizar análise de viabilidade técnica e financeira detalhada",
                    "prioridade": "alta",
                }
            )
            recomendacoes.append(
                {
                    "tipo": "monitoramento",
                    "descricao": "Definir marcos de acompanhamento quinzenais",
                    "prioridade": "alta",
                }
            )

        for fator in fatores[:3]:
            if fator["fator"] == "valor_estimado" and fator["impacto"] > 0:
                recomendacoes.append(
                    {
                        "tipo": "planejamento",
                        "descricao": "Avaliar parcelamento do objeto para reduzir risco financeiro",
                        "prioridade": "media",
                    }
                )
            if fator["fator"] == "prazo_execucao" and fator["impacto"] > 0:
                recomendacoes.append(
                    {
                        "tipo": "cronograma",
                        "descricao": "Adicionar margem de segurança de 15% ao cronograma",
                        "prioridade": "media",
                    }
                )

        if not recomendacoes:
            recomendacoes.append(
                {
                    "tipo": "monitoramento",
                    "descricao": "Manter acompanhamento mensal do fornecedor",
                    "prioridade": "baixa",
                }
            )
        return recomendacoes


__all__ = ["RiskModel"]
