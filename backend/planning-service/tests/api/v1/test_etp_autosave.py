from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import crud
from app.schemas.etp_schemas import ETPCreate
from app.core import config
from datetime import datetime, timedelta
from jose import jwt

def create_test_token(subject: str) -> str:
    expires_delta = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

def test_autosave_etp_step(client: TestClient, db: Session) -> None:
    etp = crud.etp.create_etp(db, etp_in=ETPCreate(title="test_etp"), created_by="test_user")
    token = create_test_token("test_user")
    response = client.patch(
        f"/api/v1/etp/{etp.id}/autosave",
        headers={"Authorization": f"Bearer {token}"},
        json={"step": 2}
    )
    assert response.status_code == 200
    assert response.json()["step"] == 2

def test_autosave_etp_data_merge(client: TestClient, db: Session) -> None:
    etp = crud.etp.create_etp(db, etp_in=ETPCreate(title="test_etp", data={"field1": "value1"}), created_by="test_user")
    token = create_test_token("test_user")
    response = client.patch(
        f"/api/v1/etp/{etp.id}/autosave",
        headers={"Authorization": f"Bearer {token}"},
        json={"data": {"field2": "value2"}}
    )
    assert response.status_code == 200
    assert response.json()["data"] == {"field1": "value1", "field2": "value2"}

def test_autosave_etp_status_valid(client: TestClient, db: Session) -> None:
    etp = crud.etp.create_etp(db, etp_in=ETPCreate(title="test_etp"), created_by="test_user")
    token = create_test_token("test_user")
    response = client.patch(
        f"/api/v1/etp/{etp.id}/autosave",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "published"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "published"

def test_autosave_etp_status_invalid(client: TestClient, db: Session) -> None:
    etp = crud.etp.create_etp(db, etp_in=ETPCreate(title="test_etp"), created_by="test_user")
    token = create_test_token("test_user")
    response = client.patch(
        f"/api/v1/etp/{etp.id}/autosave",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "invalid_status"}
    )
    assert response.status_code == 422

def test_autosave_etp_not_found(client: TestClient, db: Session) -> None:
    token = create_test_token("test_user")
    response = client.patch(
        f"/api/v1/etp/{uuid4()}/autosave",
        headers={"Authorization": f"Bearer {token}"},
        json={"step": 2}
    )
    assert response.status_code == 404
