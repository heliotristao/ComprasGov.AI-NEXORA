"""CLI helper to train and persist the Risco.AI model."""

from __future__ import annotations

from app.db.session import SessionLocal
from app.services.risco import RiskDatasetBuilder, RiskModel


def main() -> None:
    db = SessionLocal()
    try:
        builder = RiskDatasetBuilder(db)
        dataset = builder.build_training_dataset(synthetic_samples=500)

        model = RiskModel()
        metrics = model.train(dataset)

        print("Modelo de risco treinado com sucesso!")
        print(f"AUC média (cv): {metrics['auc']:.3f}")
        print(f"Versão: {metrics['version']}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
