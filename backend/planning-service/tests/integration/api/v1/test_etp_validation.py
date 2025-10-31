from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app.core import config
from tests.utils.etp import create_random_etp


def test_validate_etp_fully_valid(
    client: TestClient, db: Session, normal_user_token_headers: dict
) -> None:
    etp = create_random_etp(db, created_by=str(uuid4()))
    etp.data = {
        "descricao_necessidade": "a" * 100,
        "descricao_solucao": "b" * 200,
    }
    db.add(etp)
    db.commit()

    response = client.get(
        f"{config.API_V1_STR}/etp/{etp.id}/validate",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["errors"] == 0
    assert content["warnings"] == 0
    assert len(content["results"]) > 0


def test_validate_etp_missing_fields(
    client: TestClient, db: Session, normal_user_token_headers: dict
) -> None:
    etp = create_random_etp(db, created_by=str(uuid4()))
    etp.data = {}  # Missing all required fields
    db.add(etp)
    db.commit()

    response = client.get(
        f"{config.API_V1_STR}/etp/{etp.id}/validate",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["errors"] > 0


def test_validate_etp_insufficient_content(
    client: TestClient, db: Session, normal_user_token_headers: dict
) -> None:
    etp = create_random_etp(db, created_by=str(uuid4()))
    etp.data = {
        "descricao_necessidade": "short",
        "descricao_solucao": "too short",
    }
    db.add(etp)
    db.commit()

    response = client.get(
        f"{config.API_V1_STR}/etp/{etp.id}/validate",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["warnings"] > 0


def test_validate_etp_overwrite_results(
    client: TestClient, db: Session, normal_user_token_headers: dict
) -> None:
    etp = create_random_etp(db, created_by=str(uuid4()))
    etp.data = {}
    db.add(etp)
    db.commit()

    # First run: should have errors
    response1 = client.get(
        f"{config.API_V1_STR}/etp/{etp.id}/validate",
        headers=normal_user_token_headers,
    )
    assert response1.status_code == 200
    assert response1.json()["errors"] > 0

    # Update data to be valid
    etp.data = {
        "descricao_necessidade": "a" * 100,
        "descricao_solucao": "b" * 200,
    }
    db.add(etp)
    db.commit()

    # Second run: should have no errors
    response2 = client.get(
        f"{config.API_V1_STR}/etp/{etp.id}/validate",
        headers=normal_user_token_headers,
    )
    assert response2.status_code == 200
    assert response2.json()["errors"] == 0
