from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder

try:  # pragma: no cover - optional dependency
    from xgboost import XGBClassifier as _XGBClassifier
    _HAS_XGBOOST = True
except Exception:  # pragma: no cover - optional dependency
    _HAS_XGBOOST = False
    _XGBClassifier = None  # type: ignore

try:  # pragma: no cover - optional dependency
    import shap  # type: ignore
except Exception:  # pragma: no cover - fallback approximation
    class _FallbackTreeExplainer:  # noqa: D401 - mimics SHAP API
        def __init__(self, model):
            self.model = model

        def shap_values(self, X):
            import numpy as _np

            importance = getattr(self.model, "feature_importances_", None)
            if importance is None:
                importance = _np.ones(X.shape[1])
            importance = _np.asarray(importance)
            if importance.ndim == 1:
                importance = importance[: X.shape[1]]
            return X * importance

    class _ShapModule:
        TreeExplainer = _FallbackTreeExplainer

    shap = _ShapModule()  # type: ignore

from app.db.session import SessionLocal
from app.services.risco.dataset_builder import RiskDatasetBuilder


class RiskModel:
    """Encapsula o pipeline de Machine Learning do módulo Risco.AI."""

    def __init__(self, model_path: Path | None = None):
        self.model = self._build_model()
        self.encoders: dict[str, LabelEncoder] = {}
        self.explainer: shap.TreeExplainer | None = None
        self.model_path = model_path or Path("ml_models/risk_model.pkl")
        self.version = "1.0.0"
        self.numeric_features = ["valor_estimado_log", "prazo_execucao_dias"]
        self.categorical_features = ["categoria_objeto", "modalidade_licitacao"]
        self.model_name = "xgboost" if _HAS_XGBOOST else "random_forest"

    def _build_model(self):
        if _HAS_XGBOOST and _XGBClassifier is not None:
            return _XGBClassifier(
                n_estimators=150,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.85,
                colsample_bytree=0.9,
                random_state=42,
                eval_metric="logloss",
            )
        return RandomForestClassifier(
            n_estimators=400,
            max_depth=8,
            random_state=42,
            n_jobs=-1,
        )

    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        for feature in self.numeric_features:
            if feature not in df.columns:
                df[feature] = 0.0
            df[feature] = df[feature].fillna(0).astype(float)

        for col in self.categorical_features:
            if col not in df.columns:
                df[col] = "desconhecido"
            df[col] = df[col].fillna("desconhecido").astype(str)
            encoder = self.encoders.get(col)
            if encoder is None:
                encoder = LabelEncoder()
                encoder.fit(df[col])
                self.encoders[col] = encoder
            else:
                unknown_values = set(df[col]) - set(encoder.classes_)
                if unknown_values:
                    encoder.classes_ = np.concatenate(
                        [encoder.classes_, np.array(sorted(unknown_values))]
                    )
            df[f"{col}_encoded"] = encoder.transform(df[col])

        feature_cols = self.numeric_features + [f"{c}_encoded" for c in self.categorical_features]
        return df[feature_cols].values

    def _load_serialized_model(self) -> bool:
        if not self.model_path.exists():
            return False
        with open(self.model_path, "rb") as handler:
            payload = pickle.load(handler)
            self.model = payload["model"]
            self.encoders = payload["encoders"]
            self.explainer = payload.get("explainer")
            self.version = payload.get("version", self.version)
        return True

    def _bootstrap_model(self) -> None:
        session = SessionLocal()
        try:
            builder = RiskDatasetBuilder(session)
            df = builder.build_historical_dataset()
            if df.empty or df.get("risco_alto").nunique() < 2:
                df = builder.generate_synthetic_data(n_samples=600)
            self.train(df)
        finally:
            session.close()

    def _ensure_model_ready(self) -> None:
        if self._load_serialized_model():
            return
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        self._bootstrap_model()

    def train(self, df: pd.DataFrame) -> dict[str, Any]:
        if "risco_alto" not in df.columns:
            raise ValueError("Dataset deve conter a coluna 'risco_alto'.")
        if df["risco_alto"].nunique() < 2:
            raise ValueError("Dataset precisa ter exemplos das duas classes.")

        X = self.prepare_features(df)
        y = df["risco_alto"].astype(int).values

        n_splits = min(5, len(df))
        if n_splits < 2:
            raise ValueError("Quantidade insuficiente de registros para treino.")

        cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        scores = cross_val_score(self.model, X, y, cv=cv, scoring="roc_auc")
        auc_mean = float(scores.mean())

        if auc_mean < 0.85:
            raise ValueError(
                f"AUC média ({auc_mean:.3f}) abaixo do patamar mínimo de 0.85."
            )

        self.model.fit(X, y)
        self.explainer = shap.TreeExplainer(self.model)

        with open(self.model_path, "wb") as handler:
            pickle.dump(
                {
                    "model": self.model,
                    "encoders": self.encoders,
                    "explainer": self.explainer,
                    "version": self.version,
                },
                handler,
            )

        return {"auc": auc_mean, "version": self.version}

    def analyze(self, etp_features: dict[str, Any]) -> dict[str, Any]:
        self._ensure_model_ready()

        df = pd.DataFrame([etp_features])
        valor_series = df.get("valor_estimado_log", pd.Series([0]))
        prazo_series = df.get("prazo_execucao_dias", pd.Series([0]))
        categoria_series = df.get("categoria_objeto", pd.Series(["desconhecido"]))
        modalidade_series = df.get("modalidade_licitacao", pd.Series(["desconhecido"]))
        feature_values = [
            float(valor_series.iloc[0]),
            float(prazo_series.iloc[0]),
            str(categoria_series.iloc[0]),
            str(modalidade_series.iloc[0]),
        ]
        X = self.prepare_features(df)
        proba = float(self.model.predict_proba(X)[0][1])
        score_global = proba * 100

        categoria, probabilidade, impacto = self._categorizar(score_global)

        if self.explainer is None:
            self.explainer = shap.TreeExplainer(self.model)
        shap_values = self.explainer.shap_values(X)
        if isinstance(shap_values, list):
            shap_sample = shap_values[1][0]
        else:
            shap_sample = shap_values[0]

        feature_names = ["valor_estimado", "prazo_execucao", "categoria", "modalidade"]
        shap_abs = np.abs(shap_sample)
        top_indices = np.argsort(shap_abs)[-5:][::-1]
        fatores_principais = [
            {
                "fator": feature_names[idx],
                "impacto": float(shap_sample[idx]),
                "valor": feature_values[idx],
            }
            for idx in top_indices
        ]

        recomendacoes = self._gerar_recomendacoes(categoria, fatores_principais)

        return {
            "score_global": float(score_global),
            "categoria_risco": categoria,
            "probabilidade": probabilidade,
            "impacto": impacto,
            "fatores_principais": fatores_principais[:5],
            "recomendacoes": recomendacoes,
            "model_version": self.version,
            "confidence_score": float(max(proba, 1 - proba)),
        }

    @staticmethod
    def _categorizar(score_global: float) -> tuple[str, int, int]:
        if score_global < 25:
            return "baixo", 1, 2
        if score_global < 50:
            return "medio", 2, 3
        if score_global < 75:
            return "alto", 4, 4
        return "critico", 5, 5

    def _gerar_recomendacoes(self, categoria: str, fatores: list[dict[str, Any]]) -> list[dict[str, Any]]:
        recomendacoes: list[dict[str, Any]] = []

        if categoria in {"alto", "critico"}:
            recomendacoes.append(
                {
                    "tipo": "mitigacao",
                    "descricao": "Realizar análise detalhada de viabilidade técnica e financeira.",
                    "prioridade": "alta",
                }
            )
            recomendacoes.append(
                {
                    "tipo": "monitoramento",
                    "descricao": "Estabelecer marcos de acompanhamento quinzenais.",
                    "prioridade": "alta",
                }
            )

        for fator in fatores[:3]:
            if fator["fator"] == "valor_estimado" and fator["impacto"] > 0.2:
                recomendacoes.append(
                    {
                        "tipo": "planejamento",
                        "descricao": "Considerar parcelamento do objeto para reduzir risco financeiro.",
                        "prioridade": "media",
                    }
                )
            if fator["fator"] == "prazo_execucao" and fator["impacto"] > 0.2:
                recomendacoes.append(
                    {
                        "tipo": "cronograma",
                        "descricao": "Incluir margem de segurança de 15% no prazo estimado.",
                        "prioridade": "media",
                    }
                )

        return recomendacoes
