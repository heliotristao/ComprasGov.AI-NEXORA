import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.etp import ETP, ETPStatus
from app.db.models.user import User
from app.schemas.etp import ETPCreate

def create_test_user(db: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password="testpassword",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_etp(db: Session, status: ETPStatus = ETPStatus.draft, data: dict = None) -> ETP:
    if data is None:
        data = {
            "objeto": "Test Object",
            "justificativa": "Test Justification",
            "valor_estimado": 123.45,
        }
    etp_in = ETPCreate(title="Test ETP", data=data)
    user = create_test_user(db)
    etp = ETP(**etp_in.dict(), created_by=user, status=status)
    etp.version = 1
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp

def test_create_tr_from_etp_success(client: TestClient, db: Session) -> None:
    etp = create_test_etp(db, status=ETPStatus.published)
    response = client.post(f"/api/v1/tr/criar-de-etp/{etp.id}")
    assert response.status_code == 201, response.text
    data = response.json()
    assert "id" in data

def test_create_tr_from_etp_not_found(client: TestClient, db: Session) -> None:
    non_existent_id = uuid.uuid4()
    response = client.post(f"/api/v1/tr/criar-de-etp/{non_existent_id}")
    assert response.status_code == 404

def test_create_tr_from_etp_not_published(client: TestClient, db: Session) -> None:
    etp = create_test_etp(db, status=ETPStatus.draft)
    response = client.post(f"/api/v1/tr/criar-de-etp/{etp.id}")
    assert response.status_code == 400
    assert "ETP must be published" in response.json()["detail"]
