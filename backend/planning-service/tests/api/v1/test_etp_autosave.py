import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import crud
from app.schemas.etp import ETPCreate

# Fictional user data for tests
MOCK_USER = {"sub": "test@user.com", "scopes": ["etp:read", "etp:write"]}


def create_test_etp(db: Session) -> uuid.UUID:
    etp_in = ETPCreate(
        process_id="12345",
        edocs="2025-123456",
        data={"initial": "data"},
    )
    etp = crud.etp.create(db=db, obj_in=etp_in, created_by=MOCK_USER["sub"])
    return etp.id


def test_patch_etp_success(client: TestClient, db: Session, monkeypatch):
    monkeypatch.setattr("nexora_auth.decorators.get_current_user", lambda: MOCK_USER)
    etp_id = create_test_etp(db)
    response = client.patch(
        f"/api/v1/etp/{etp_id}",
        json={"new_field": "new_value"},
        headers={"If-Match": "1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == {"initial": "data", "new_field": "new_value"}
    assert data["version"] == 2


def test_patch_etp_version_conflict(client: TestClient, db: Session, monkeypatch):
    monkeypatch.setattr("nexora_auth.decorators.get_current_user", lambda: MOCK_USER)
    etp_id = create_test_etp(db)
    response = client.patch(
        f"/api/v1/etp/{etp_id}",
        json={"field": "value"},
        headers={"If-Match": "0"},  # Wrong version
    )
    assert response.status_code == 409


def test_patch_etp_not_found(client: TestClient, db: Session, monkeypatch):
    monkeypatch.setattr("nexora_auth.decorators.get_current_user", lambda: MOCK_USER)
    random_uuid = uuid.uuid4()
    response = client.patch(
        f"/api/v1/etp/{random_uuid}",
        json={"field": "value"},
        headers={"If-Match": "1"},
    )
    assert response.status_code == 404


def test_patch_etp_access_denied(client: TestClient, db: Session, monkeypatch):
    # User without 'etp:write' scope
    monkeypatch.setattr(
        "nexora_auth.decorators.get_current_user", lambda: {"sub": "viewer", "scopes": ["etp:read"]}
    )
    etp_id = create_test_etp(db)
    response = client.patch(
        f"/api/v1/etp/{etp_id}",
        json={"field": "value"},
        headers={"If-Match": "1"},
    )
    assert response.status_code == 403


def test_patch_etp_validation_error(client: TestClient, db: Session, monkeypatch):
    monkeypatch.setattr("nexora_auth.decorators.get_current_user", lambda: MOCK_USER)
    etp_id = create_test_etp(db)
    # Payload that violates the 'necessity' step schema
    invalid_payload = {"description": "too short", "priority": 99}
    response = client.patch(
        f"/api/v1/etp/{etp_id}?validate_step=necessity",
        json=invalid_payload,
        headers={"If-Match": "1"},
    )
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("ensure this value has at least 50 characters" in e["msg"] for e in errors)
    assert any("ensure this value is less than or equal to 5" in e["msg"] for e in errors)
