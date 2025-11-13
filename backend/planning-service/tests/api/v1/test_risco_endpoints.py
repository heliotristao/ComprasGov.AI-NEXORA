import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models.etp import ETP, ETPStatus
from app.db.models.risco import RiskAnalysis
from app.db.models.user import User
from app.schemas.etp import ETPCreate
from app.services.risco.risk_model import RiskModel


def create_test_user(db: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="risk-user@example.com",
        hashed_password="secret",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_etp(db: Session, data: dict | None = None) -> ETP:
    if data is None:
        data = {
            "valor_estimado": 1500000,
            "prazo_execucao_dias": 180,
            "categoria_objeto": "obra",
            "modalidade_licitacao": "concorrencia",
        }
    user = create_test_user(db)
    etp_in = ETPCreate(title="ETP Risco AI", data=data)
    etp = ETP(**etp_in.dict(), created_by=user, status=ETPStatus.published)
    etp.version = 1
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp


def default_model_response() -> dict:
    return {
        "score_global": 72.0,
        "categoria_risco": "alto",
        "probabilidade": 4,
        "impacto": 4,
        "fatores_principais": [
            {"fator": "valor_estimado", "impacto": 0.4, "valor": 1.2},
            {"fator": "prazo_execucao", "impacto": 0.3, "valor": 180},
        ],
        "recomendacoes": [
            {
                "tipo": "mitigacao",
                "descricao": "Reforçar o planejamento.",
                "prioridade": "alta",
            }
        ],
        "model_version": "1.0.0",
        "confidence_score": 0.9,
    }


def test_analisar_risco_cria_registro(client: TestClient, db: Session, monkeypatch) -> None:
    etp = create_test_etp(db)

    def fake_analyze(self, features):  # noqa: ANN001
        return default_model_response()

    monkeypatch.setattr(RiskModel, "analyze", fake_analyze)

    response = client.post(
        "/api/v1/risco/analisar",
        json={"etp_id": str(etp.id)},
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["categoria_risco"] == "alto"
    assert data["probabilidade"] == 4

    db_analysis = db.query(RiskAnalysis).filter(RiskAnalysis.etp_id == etp.id).first()
    assert db_analysis is not None
    assert db_analysis.score_global == 72.0

    # Segunda chamada deve retornar o mesmo registro sem duplicar
    response_repeat = client.post(
        "/api/v1/risco/analisar",
        json={"etp_id": str(etp.id)},
    )
    assert response_repeat.status_code == 200
    assert db.query(RiskAnalysis).count() == 1


def test_matriz_risco_agrupa_resultados(client: TestClient, db: Session) -> None:
    etp = create_test_etp(db)
    analysis = RiskAnalysis(
        id=uuid.uuid4(),
        etp_id=etp.id,
        score_global=90.0,
        categoria_risco="critico",
        probabilidade=5,
        impacto=5,
        fatores_principais=[{"fator": "valor_estimado", "impacto": 0.5, "valor": 1.8}],
        recomendacoes=[{"tipo": "mitigacao", "descricao": "Ação", "prioridade": "alta"}],
        model_version="1.0.0",
        confidence_score=0.95,
    )
    db.add(analysis)
    db.commit()

    response = client.get("/api/v1/risco/matriz")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_analises"] == 1
    assert payload["distribuicao"]["critico"] == 1
    assert payload["matriz"][4][4] == 1
