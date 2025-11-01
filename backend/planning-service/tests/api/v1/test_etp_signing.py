import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import io

from app.db.models.etp import ETP, ETPStatus
from app.db.models.user import User
from app.schemas.etp import ETPSchema

def create_random_user(db: Session) -> User:
    user = User()
    user.email = f"testuser{uuid.uuid4()}@example.com"
    user.hashed_password = "password"
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_etp_for_signing(db: Session, status: ETPStatus) -> ETPSchema:
    user = create_random_user(db)
    etp = ETP(
        title="Test ETP for Signing",
        status=status,
        created_by=user.email,
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return ETPSchema.from_attributes(etp)

def test_upload_signed_document_success(
    client: TestClient, db: Session
) -> None:
    etp = create_etp_for_signing(db, ETPStatus.approved)

    with patch("app.api.v1.endpoints.etp.uuid.uuid4", return_value=uuid.uuid4()) as mock_uuid:
        response = client.post(
            f"/api/v1/etp/{etp.id}/upload-signed",
            files={"file": ("test.pdf", io.BytesIO(b"dummy pdf content"), "application/pdf")},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["document_id"] == str(etp.id)
    assert data["document_type"] == "etp"
    assert "id" in data
    assert "signed_at" in data

    db.refresh(etp)
    assert etp.status == ETPStatus.signed

def test_upload_signed_document_not_approved(
    client: TestClient, db: Session
) -> None:
    etp = create_etp_for_signing(db, ETPStatus.draft)

    response = client.post(
        f"/api/v1/etp/{etp.id}/upload-signed",
        files={"file": ("test.pdf", io.BytesIO(b"dummy pdf content"), "application/pdf")},
    )

    assert response.status_code == 409
    assert "must be in 'approved' status" in response.json()["detail"]
