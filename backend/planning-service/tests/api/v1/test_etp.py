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
