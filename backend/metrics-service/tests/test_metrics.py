from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

# Mock the cache decorator so it doesn't interfere with tests
def mock_cache_decorator(ttl):
    def decorator(func):
        return func
    return decorator

patch('app.core.cache.redis_cache', mock_cache_decorator).start()


@patch('httpx.get')
def test_get_process_status_metrics(mock_get):
    """
    Test the /process-status endpoint.
    """
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "draft": 10,
        "in_review": 5,
        "approved": 20,
    }
    mock_get.return_value = mock_response

    response = client.get("/api/v1/metrics/process-status")

    assert response.status_code == 200
    data = response.json()
    assert data["draft"] == 10
    assert data["in_review"] == 5
    assert data["approved"] == 20


@patch('httpx.get')
def test_get_trend_metrics(mock_get):
    """
    Test the /trend endpoint.
    """
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "labels": ["Jan", "Feb"],
        "values": [10, 20],
    }
    mock_get.return_value = mock_response

    response = client.get("/api/v1/metrics/trend")

    assert response.status_code == 200
    data = response.json()
    assert data["labels"] == ["Jan", "Feb"]
    assert data["values"] == [10, 20]


@patch('httpx.get')
def test_get_savings_metrics(mock_get):
    """
    Test the /savings endpoint.
    """
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "estimated_savings": 50000.0,
    }
    mock_get.return_value = mock_response

    response = client.get("/api/v1/metrics/savings")

    assert response.status_code == 200
    data = response.json()
    assert data["estimated_savings"] == 50000.0
    assert data["currency"] == "BRL"
