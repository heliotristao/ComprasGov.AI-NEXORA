import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.etp import ETP, ETPStatus
from app.db.models.tr import TRType
from tests.utils.utils import random_lower_string, create_random_etp


def test_create_tr_from_etp_bem_success(client: TestClient, db: Session, superuser_token_headers):
    etp = create_random_etp(db, status=ETPStatus.published)
    response = client.post(
        f"{settings.API_V1_STR}/tr/from-etp/{etp.id}?tipo=bem",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["etp_id"] == str(etp.id)
    assert data["type"] == "bem"
    assert "gaps" in data
    assert len(data["gaps"]["gaps"]) == 0


def test_create_tr_from_etp_with_gaps(client: TestClient, db: Session, superuser_token_headers):
    etp_data = {
        "necessidade_contratacao": "Test necessity",
        # "descricao_solucao" is missing
    }
    etp = create_random_etp(db, status=ETPStatus.published, data=etp_data)
    response = client.post(
        f"{settings.API_V1_STR}/tr/from-etp/{etp.id}?tipo=bem",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "gaps" in data
    assert len(data["gaps"]["gaps"]) > 0
    gap_report = data["gaps"]["gaps"][0]
    assert gap_report["field"] == "descricao_solucao.descricao_completa"
    assert "descricao_solucao" in gap_report["message"]


def test_create_tr_from_etp_servico_success(client: TestClient, db: Session, superuser_token_headers):
    etp = create_random_etp(db, status=ETPStatus.published)
    response = client.post(
        f"{settings.API_V1_STR}/tr/from-etp/{etp.id}?tipo=servico",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["etp_id"] == str(etp.id)
    assert data["type"] == "servico"
    assert "gaps" in data


def test_create_tr_from_etp_not_found(client: TestClient, superuser_token_headers):
    non_existent_etp_id = uuid.uuid4()
    response = client.post(
        f"{settings.API_V1_STR}/tr/from-etp/{non_existent_etp_id}?tipo=bem",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404


def test_create_tr_from_etp_invalid_status(client: TestClient, db: Session, superuser_token_headers):
    etp = create_random_etp(db, status=ETPStatus.draft)
    response = client.post(
        f"{settings.API_V1_STR}/tr/from-etp/{etp.id}?tipo=bem",
        headers=superuser_token_headers,
    )
    assert response.status_code == 400


def test_create_tr_from_etp_unauthorized(client: TestClient, db: Session):
    etp = create_random_etp(db, status=ETPStatus.published)
    response = client.post(
        f"{settings.API_V1_STR}/tr/from-etp/{etp.id}?tipo=bem"
    )
    assert response.status_code == 401
