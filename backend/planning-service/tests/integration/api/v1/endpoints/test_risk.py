from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.risk import RiskMatrix, Risk
import pytest

# A mock risk matrix to be returned by the mocked service
mock_llm_output = {
    "risks": [
        {
            "risk_description": "LLM Test Risk",
            "probability": "High",
            "impact": "High",
            "mitigation_measure": "LLM Test Mitigation",
        }
    ]
}

@pytest.mark.asyncio
@patch("app.core.risk_analysis.get_risk_analysis_chain")
async def test_generate_risk_matrix_endpoint_success(mock_get_risk_analysis_chain):
    """
    Tests the success scenario for the /api/v1/risk/generate endpoint
    with a real LLM integration, mocking the LangChain chain.
    """
    # Configure the mock chain to be an async mock
    mock_chain = AsyncMock()
    mock_chain.ainvoke.return_value = mock_llm_output
    mock_get_risk_analysis_chain.return_value = mock_chain

    # The client needs to be managed within an async context
    from httpx import AsyncClient
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/risk/generate", json={"description": "Test hardware"})

    assert response.status_code == 200
    response_data = response.json()

    # The response should contain both predefined rule risks and LLM risks
    assert len(response_data["risks"]) == 2

    # Verify that the LLM was called correctly
    mock_get_risk_analysis_chain.assert_called_once()
    mock_chain.ainvoke.assert_called_once_with({"description": "Test hardware"})

    # Check for one of the LLM-generated risks in the response
    assert any(risk["risk_description"] == "LLM Test Risk" for risk in response_data["risks"])
    # Check for one of the rule-based risks
    assert any(risk["risk_description"] == "Atraso na entrega" for risk in response_data["risks"])


def test_generate_risk_matrix_endpoint_invalid_payload():
    """
    Tests the endpoint's response to an invalid payload.
    FastAPI should automatically handle this and return a 422 Unprocessable Entity.
    """
    client = TestClient(app)
    response = client.post("/api/v1/risk/generate", json={"invalid_field": "Test"})

    assert response.status_code == 422
