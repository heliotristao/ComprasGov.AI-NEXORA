import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
import uuid

from app.core import config
from app.db.models.etp import ETP


def create_test_token(user_email: str = "test@example.com") -> str:
    """
    Generates a JWT token for testing purposes.
    """
    expires_delta = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_email, "exp": expire, "scopes": ["etp:read", "etp:write", "etp:delete"]}
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt


@pytest.fixture
def auth_headers():
    token = create_test_token()
    return {"Authorization": f"Bearer {token}"}


def test_create_etp_success(client: TestClient, db: Session, auth_headers: dict):
    """
    Test successful creation of an ETP with valid data.
    """
    etp_data = {"edocs": "2025-123456", "process_id": "proc-001"}
    response = client.post("/api/v1/etp", headers=auth_headers, json=etp_data)

    assert response.status_code == 201
    data = response.json()
    assert data["edocs"] == etp_data["edocs"]
    assert data["process_id"] == etp_data["process_id"]
    assert "id" in data
    assert data["created_by"] == "test@example.com"


def test_create_etp_invalid_edocs(client: TestClient, auth_headers: dict):
    """
    Test ETP creation failure with invalid edocs format.
    """
    etp_data = {"edocs": "2025-12345", "process_id": "proc-002"} # Invalid edocs
    response = client.post("/api/v1/etp", headers=auth_headers, json=etp_data)

    assert response.status_code == 422


def test_read_etp(client: TestClient, db: Session, auth_headers: dict):
    """
    Test retrieving an ETP by its ID.
    """
    etp = ETP(edocs="2025-654321", created_by="test@example.com")
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.get(f"/api/v1/etp/{etp.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["edocs"] == "2025-654321"
    assert data["id"] == str(etp.id)


def test_read_nonexistent_etp(client: TestClient, auth_headers: dict):
    """
    Test retrieving a non-existent ETP.
    """
    random_uuid = uuid.uuid4()
    response = client.get(f"/api/v1/etp/{random_uuid}", headers=auth_headers)

    assert response.status_code == 404


def test_update_etp(client: TestClient, db: Session, auth_headers: dict):
    """
    Test partially updating an ETP.
    """
    etp = ETP(edocs="2025-111222", status="DRAFT", created_by="test@example.com")
    db.add(etp)
    db.commit()
    db.refresh(etp)

    update_data = {"status": "IN_REVIEW"}
    response = client.patch(f"/api/v1/etp/{etp.id}", headers=auth_headers, json=update_data)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "IN_REVIEW"
    assert data["updated_by"] == "test@example.com"


def test_delete_etp(client: TestClient, db: Session, auth_headers: dict):
    """
    Test soft-deleting an ETP.
    """
    etp = ETP(edocs="2025-333444", created_by="test@example.com")
    db.add(etp)
    db.commit()
    db.refresh(etp)

    # Delete the ETP
    delete_response = client.delete(f"/api/v1/etp/{etp.id}", headers=auth_headers)
    assert delete_response.status_code == 204

    # Verify it cannot be read anymore
    read_response = client.get(f"/api/v1/etp/{etp.id}", headers=auth_headers)
    assert read_response.status_code == 404

    # Verify the object in the DB has a deleted_at timestamp
    db.refresh(etp)
    assert etp.deleted_at is not None
