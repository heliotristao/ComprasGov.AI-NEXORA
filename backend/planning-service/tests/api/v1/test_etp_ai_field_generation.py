import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch
from app.db.models.etp_modular import DocumentoETP
from tests.utils.user import create_test_token


@pytest.fixture
def test_etp(db: Session) -> DocumentoETP:
    etp = DocumentoETP(
        plan_id=1,
        template_id=1,
        dados={"key": "value"},
        created_by=1,
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp


@patch("app.services.etp_ai_service.get_ai_provider")
def test_generate_etp_field_success(mock_get_ai_provider, client: TestClient, db: Session, test_etp: DocumentoETP):
    # Mock the AI provider and its response
    class MockProvider:
        def get_client(self):
            class MockClient:
                def invoke(self, *args, **kwargs):
                    return '{"response": "Generated content", "confidence": 0.9}'
            return MockClient()

    mock_get_ai_provider.return_value = MockProvider()
    token = create_test_token("test@example.com")

    response = client.post(
        f"/api/v1/etp/{test_etp.id}/generate/justificativa",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["generated_content"] == "Generated content"
    assert data["confidence"] == 0.9

    # Check if the trace was saved in the database
    trace = db.execute("SELECT * FROM etp_ai_traces").fetchone()
    assert trace is not None
    assert trace.etp_id == test_etp.id
    assert trace.field == "justificativa"
    assert trace.response == "Generated content"


def test_generate_etp_field_not_found(client: TestClient, db: Session):
    token = create_test_token("test@example.com")
    response = client.post(
        "/api/v1/etp/999/generate/justificativa",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
