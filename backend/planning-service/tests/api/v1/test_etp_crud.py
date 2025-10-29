from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import SECRET_KEY, ALGORITHM
from app.db.models.etp import ETP


def create_test_token(user_email: str) -> str:
    expires_delta = timedelta(minutes=30)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_email, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def test_create_etp(client: TestClient, db: Session):
    token = create_test_token("test@example.com")
    response = client.post(
        "/api/v1/etp",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Test ETP"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test ETP"
    assert "id" in data


def test_read_etp(client: TestClient, db: Session):
    token = create_test_token("test@example.com")
    etp = ETP(title="Test ETP for Reading", created_by="test@example.com")
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.get(
        f"/api/v1/etp/{etp.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test ETP for Reading"
    assert data["id"] == str(etp.id)


def test_update_etp(client: TestClient, db: Session):
    token = create_test_token("test@example.com")
    etp = ETP(title="ETP to Update", created_by="test@example.com")
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.patch(
        f"/api/v1/etp/{etp.id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Updated ETP"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated ETP"


def test_soft_delete_etp(client: TestClient, db: Session):
    token = create_test_token("test@example.com")
    etp = ETP(title="ETP to Delete", created_by="test@example.com")
    db.add(etp)
    db.commit()
    db.refresh(etp)

    response = client.delete(
        f"/api/v1/etp/{etp.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "deleted_at" in data
    assert data["deleted_at"] is not None

    # Verify it's not returned by get_etp
    response = client.get(
        f"/api/v1/etp/{etp.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
