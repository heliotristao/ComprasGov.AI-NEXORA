import uuid

from app.db.models.etp import ETP, ETPStatus
from app.db.models.user import User
from app.db.models.risco import RiskAnalysis


def _create_etp(db, *, valor=1_500_000, prazo="420 dias"):
    user = User(email=f"user-{uuid.uuid4()}@example.com", hashed_password="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)

    etp = ETP(
        title="ETP Risco",
        status=ETPStatus.draft,
        current_step=1,
        data={
            "valor_estimado": str(valor),
            "prazo_execucao": prazo,
            "categoria_objeto": "obra",
            "modalidade_licitacao": "concorrencia",
            "orgao_id": "org-123",
        },
        created_by_id=user.id,
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp


def test_analisar_risco_cria_registro(client, db):
    etp = _create_etp(db)

    response = client.post(
        "/api/v1/risco/analisar",
        json={"etp_id": str(etp.id)},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["etp_id"] == str(etp.id)
    assert payload["score_global"] >= 0
    assert len(payload["fatores_principais"]) > 0

    stored = db.query(RiskAnalysis).filter_by(etp_id=etp.id).one()
    assert stored.categoria_risco in {"baixo", "medio", "alto", "critico"}


def test_analisar_risco_reutiliza_resultado(client, db):
    etp = _create_etp(db)

    first = client.post("/api/v1/risco/analisar", json={"etp_id": str(etp.id)}).json()
    second = client.post("/api/v1/risco/analisar", json={"etp_id": str(etp.id)}).json()

    assert first["id"] == second["id"]

    refreshed = client.post(
        "/api/v1/risco/analisar",
        json={"etp_id": str(etp.id), "force_refresh": True},
    ).json()

    assert refreshed["id"] == first["id"]


def test_matriz_de_risco(client, db):
    etp = _create_etp(db)
    client.post("/api/v1/risco/analisar", json={"etp_id": str(etp.id)})

    response = client.get("/api/v1/risco/matriz", params={"orgao_id": "org-123"})
    assert response.status_code == 200

    payload = response.json()
    assert payload["total_analises"] == 1
    assert sum(sum(row) for row in payload["matriz"]) == 1
    assert payload["distribuicao"]["alto"] + payload["distribuicao"]["medio"] + payload["distribuicao"]["baixo"] + payload["distribuicao"]["critico"] == 1
