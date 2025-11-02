import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models.etp import ETP
from app.schemas.etp import ETPCreate, ETPStatus

def create_test_etp(db: Session) -> ETP:
    etp_in = ETPCreate(title="Test ETP for Patching")
    user_id = uuid.uuid4()
    etp = ETP(**etp_in.dict(), created_by_id=user_id)
    etp.version = 1
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp

def test_patch_etp_success(client: TestClient, db: Session) -> None:
    etp = create_test_etp(db)

    patch_data = {"title": "Updated Title", "data": {"key": "value"}}
    headers = {"If-Match": str(etp.version)}

    response = client.patch(f"/api/v1/etp/{etp.id}", json=patch_data, headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["data"]["key"] == "value"
    assert data["version"] == etp.version + 1

def test_patch_etp_version_conflict(client: TestClient, db: Session) -> None:
    etp = create_test_etp(db)

    patch_data = {"title": "Another Update"}
    headers = {"If-Match": str(etp.version + 1)}  # Incorrect version

    response = client.patch(f"/api/v1/etp/{etp.id}", json=patch_data, headers=headers)

    assert response.status_code == 409
    assert "Conflict" in response.json()["detail"]

def test_patch_etp_not_found(client: TestClient, db: Session) -> None:
    non_existent_id = uuid.uuid4()
    patch_data = {"title": "Update on Non-existent"}
    headers = {"If-Match": "1"}

    response = client.patch(f"/api/v1/etp/{non_existent_id}", json=patch_data, headers=headers)

    assert response.status_code == 404


def test_validate_etp_valid(client: TestClient, db: Session) -> None:
    etp_data = {
        "title": "Valid ETP",
        "data": {
            "justificativa_necessidade_contratacao": "Required justification",
            "estimativa_valor": 1000,
            "descricao_solucao": "Required solution description",
            "justificativa_parcelamento": "Some justification",
            "responsavel_id": str(uuid.uuid4())
        }
    }
    etp_in = ETPCreate(**etp_data)
    user_id = uuid.uuid4()
    etp = ETP(**etp_in.dict(), created_by_id=user_id)
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.get(f"/api/v1/etp/{etp.id}/validar")

    assert response.status_code == 200
    results = response.json()
    assert all(item["status"] == "pass" for item in results)


def test_validate_etp_with_warnings(client: TestClient, db: Session) -> None:
    etp_data = {
        "title": "ETP with Warnings",
        "data": {
            "justificativa_necessidade_contratacao": "Required justification",
            "estimativa_valor": 1000,
            "descricao_solucao": "Required solution description",
        }
    }
    etp_in = ETPCreate(**etp_data)
    user_id = uuid.uuid4()
    etp = ETP(**etp_in.dict(), created_by_id=user_id)
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.get(f"/api/v1/etp/{etp.id}/validar")
    assert response.status_code == 200
    results = response.json()

    warnings = [item for item in results if item["level"] == "warning" and item["status"] == "fail"]
    blockers = [item for item in results if item["level"] == "blocker" and item["status"] == "fail"]

    assert len(warnings) > 0
    assert len(blockers) == 0


def test_validate_etp_with_blockers(client: TestClient, db: Session) -> None:
    etp_data = {
        "title": "ETP with Blockers",
        "data": {
            "estimativa_valor": 0
        }
    }
    etp_in = ETPCreate(**etp_data)
    user_id = uuid.uuid4()
    etp = ETP(**etp_in.dict(), created_by_id=user_id)
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.get(f"/api/v1/etp/{etp.id}/validar")
    assert response.status_code == 200
    results = response.json()

    blockers = [item for item in results if item["level"] == "blocker" and item["status"] == "fail"]
    assert len(blockers) > 0
