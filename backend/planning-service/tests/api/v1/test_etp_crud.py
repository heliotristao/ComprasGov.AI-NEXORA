import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import pytest

from app import crud
from app.core.config import API_V1_STR
from app.db.models.user import User
from app.schemas.etp import ETPCreate, ETPUpdate
from tests.utils.user import create_random_user


def test_create_etp(
    client: TestClient, db: Session, random_user: User, user_authentication_headers: dict
) -> None:
    data = {"title": "Test ETP", "edocs_number": "2025-123456"}
    response = client.post(
        f"{API_V1_STR}/etp/",
        headers=user_authentication_headers,
        json=data,
    )
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert "id" in content
    assert "created_by_id" in content


def test_read_etp(
    client: TestClient, db: Session, random_user: User, user_authentication_headers: dict
) -> None:
    etp = crud.etp.create_with_owner(
        db=db, obj_in=ETPCreate(title="Test ETP", edocs_number="2025-123456"), created_by_id=random_user.id
    )
    response = client.get(
        f"{API_V1_STR}/etp/{etp.id}",
        headers=user_authentication_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == etp.title
    assert content["id"] == str(etp.id)


def test_read_etps(
    client: TestClient, db: Session, random_user: User, user_authentication_headers: dict
) -> None:
    etp1 = crud.etp.create_with_owner(
        db=db, obj_in=ETPCreate(title="Test ETP 1", edocs_number="2025-123457"), created_by_id=random_user.id
    )
    etp2 = crud.etp.create_with_owner(
        db=db, obj_in=ETPCreate(title="Test ETP 2", edocs_number="2025-123458"), created_by_id=random_user.id
    )
    response = client.get(
        f"{API_V1_STR}/etp/",
        headers=user_authentication_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 2


def test_update_etp(
    client: TestClient, db: Session, random_user: User, user_authentication_headers: dict
) -> None:
    etp = crud.etp.create_with_owner(
        db=db, obj_in=ETPCreate(title="Test ETP", edocs_number="2025-123456"), created_by_id=random_user.id
    )
    data = {"title": "Updated Test ETP"}
    response = client.put(
        f"{API_V1_STR}/etp/{etp.id}",
        headers=user_authentication_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["id"] == str(etp.id)


def test_delete_etp(
    client: TestClient, db: Session, random_user: User, user_authentication_headers: dict
) -> None:
    etp = crud.etp.create_with_owner(
        db=db, obj_in=ETPCreate(title="Test ETP", edocs_number="2025-123456"), created_by_id=random_user.id
    )
    response = client.delete(
        f"{API_V1_STR}/etp/{etp.id}",
        headers=user_authentication_headers,
    )
    assert response.status_code == 204
    response = client.get(
        f"{API_V1_STR}/etp/{etp.id}",
        headers=user_authentication_headers,
    )
    assert response.status_code == 404
