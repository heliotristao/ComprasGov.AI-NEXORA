from unittest.mock import MagicMock, ANY, patch
from fastapi.testclient import TestClient
from httpx import Response
from pytest_httpx import HTTPXMock
from app.main import app
from app.api.v1.endpoints.etp_consolidation import get_etp_crud
from app.api import deps
from nexora_auth.decorators import require_scope

def test_consolidate_etp_propagates_trace_id(
    client: TestClient, httpx_mock: HTTPXMock
):
    # Arrange
    httpx_mock.add_response(
        url__regex=r"http://.*/api/v1/artifacts",
        method="POST",
        json={"id": "artifact-id"},
        status_code=200,
    )
    trace_id = "test-trace-id"
    headers = {"X-Trace-ID": trace_id}

    mock_etp_crud = MagicMock()
    fake_etp = MagicMock()
    fake_etp.id = 123
    fake_etp.version = 1
    mock_etp_crud.get.return_value = fake_etp

    def override_get_etp_crud():
        return mock_etp_crud

    def override_get_current_user():
        user = MagicMock()
        user.id = "test-user"
        return user

    def override_require_scope(scope: str):
        return lambda: True

    app.dependency_overrides[get_etp_crud] = override_get_etp_crud
    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    app.dependency_overrides[require_scope] = override_require_scope

    # Act
    response = client.post("/api/v1/etp/123/consolidate", headers=headers)

    # Assert
    assert response.status_code == 202
    mock_etp_crud.get.assert_called_once()

    app.dependency_overrides.clear()
