import pytest
import uuid
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.etp_modular import DocumentoETP
from tests.utils.user import create_test_token
from app import crud

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

@patch("nexora_core.ai_engine.AIEngine.generate")
def test_generate_etp_section_success(mock_ai_generate, client: TestClient, db: Session, test_etp: DocumentoETP):
    # Mock the AIEngine response
    mock_ai_generate.return_value = {
        "response": "Texto gerado pela IA.",
        "provider": "openai",
        "cost": 0.001,
        "trace_id": "test-trace-id",
        "confidence_score": 0.95
    }
    token = create_test_token("test@example.com")

    # Call the endpoint
    response = client.post(
        f"/api/v1/etp/{test_etp.id}/generate-section/necessidade",
        headers={"Authorization": f"Bearer {token}"},
        json={"keywords": "aquisição de notebooks"},
    )

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["generated_text"] == "Texto gerado pela IA."
    assert "execution_id" in data

    # Verify prompt construction
    expected_prompt = "Aja como um especialista em compras públicas. Com base nas palavras-chave 'aquisição de notebooks', escreva um parágrafo para a seção 'necessidade' de um Estudo Técnico Preliminar."
    mock_ai_generate.assert_called_once_with(expected_prompt)

    # Verify database record
    execution_id = uuid.UUID(data["execution_id"])
    execution = crud.ai_execution.get(db, id=execution_id)
    assert execution
    assert execution.prompt_text == expected_prompt
    assert execution.response_text == "Texto gerado pela IA."
    assert execution.provider_used == "openai"
    assert execution.cost == 0.001
    assert execution.trace_id == "test-trace-id"
    assert execution.confidence_score == 0.95

def test_generate_etp_section_not_found(client: TestClient, db: Session):
    token = create_test_token("test@example.com")
    response = client.post(
        "/api/v1/etp/999/generate-section/necessidade",
        headers={"Authorization": f"Bearer {token}"},
        json={"keywords": "test"},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
