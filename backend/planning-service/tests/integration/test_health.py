import pytest
from fastapi.testclient import TestClient

@pytest.mark.integration
def test_health_check(client: TestClient):
    """
    Tests the health check endpoint.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "OK"}
