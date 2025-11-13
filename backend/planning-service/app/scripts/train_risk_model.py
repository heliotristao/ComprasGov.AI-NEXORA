from __future__ import annotations

from app.db.session import SessionLocal
from app.services.risco.dataset_builder import RiskDatasetBuilder
from app.services.risco.risk_model import RiskModel


def main() -> None:
    session = SessionLocal()
    try:
        builder = RiskDatasetBuilder(session)
        df = builder.build_historical_dataset()
        if df.empty or df.get("risco_alto").nunique() < 2:
            df = builder.generate_synthetic_data(n_samples=800)
        model = RiskModel()
        metrics = model.train(df)
        print("Modelo treinado com sucesso!")
        print(f"AUC média: {metrics['auc']:.3f}")
        print(f"Versão: {metrics['version']}")
    finally:
        session.close()


if __name__ == "__main__":
    main()
