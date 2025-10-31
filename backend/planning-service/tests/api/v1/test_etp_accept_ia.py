import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch

from app.core import config
from tests.utils.user import create_test_token
from tests.utils.etp import create_random_etp
from app.models.etp_ai_trace import ETPAITrace
from app.models.etp import ETP


@pytest.fixture
def auth_headers():
    return {"Authorization": f"Bearer {create_test_token()}"}


@pytest.fixture
def etp(db: Session) -> ETP:
    return create_random_etp(db)


@pytest.fixture
def trace(db: Session, etp: ETP) -> ETPAITrace:
    trace = ETPAITrace(
        etp_id=etp.id,
        section="test_section",
        prompt="test_prompt",
        llm_response="test_response",
        user_id="test_user",
    )
    db.add(trace)
    db.commit()
    db.refresh(trace)
    return trace


def test_accept_ia_success(
    client: TestClient, db: Session, auth_headers: dict, etp: ETP, trace: ETPAITrace
):
    etp_version = etp.version_id
    response = client.post(
        f"/api/v1/etp/{etp.id}/accept-ia/{trace.section}",
        headers={**auth_headers, "If-Match": str(etp_version)},
        json={"trace_id": str(trace.id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"][trace.section] == trace.llm_response
    assert data["version_id"] == etp_version + 1


def test_accept_ia_unauthorized(client: TestClient, etp: ETP, trace: ETPAITrace):
    response = client.post(
        f"/api/v1/etp/{etp.id}/accept-ia/{trace.section}",
        headers={"If-Match": str(etp.version_id)},
        json={"trace_id": str(trace.id)},
    )
    assert response.status_code == 401


def test_accept_ia_etp_not_found(client: TestClient, auth_headers: dict, trace: ETPAITrace):
    response = client.post(
        f"/api/v1/etp/{uuid.uuid4()}/accept-ia/{trace.section}",
        headers={**auth_headers, "If-Match": "1"},
        json={"trace_id": str(trace.id)},
    )
    assert response.status_code == 404


def test_accept_ia_trace_not_found(
    client: TestClient, auth_headers: dict, etp: ETP, trace: ETPAITrace
):
    response = client.post(
        f"/api/v1/etp/{etp.id}/accept-ia/{trace.section}",
        headers={**auth_headers, "If-Match": str(etp.version_id)},
        json={"trace_id": str(uuid.uuid4())},
    )
    assert response.status_code == 404


def test_accept_ia_version_conflict(
    client: TestClient, auth_headers: dict, etp: ETP, trace: ETPAITrace
):
    response = client.post(
        f"/api/v1/etp/{etp.id}/accept-ia/{trace.section}",
        headers={**auth_headers, "If-Match": "0"},
        json={"trace_id": str(trace.id)},
    )
    assert response.status_code == 409


def test_list_accepts_success(
    client: TestClient, db: Session, auth_headers: dict, etp: ETP, trace: ETPAITrace
):
    # Accept a suggestion to create a log entry
    client.post(
        f"/api/v1/etp/{etp.id}/accept-ia/{trace.section}",
        headers={**auth_headers, "If-Match": str(etp.version_id)},
        json={"trace_id": str(trace.id)},
    )

    response = client.get(
        f"/api/v1/etp/{etp.id}/sections/{trace.section}/accepts",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["trace_id"] == str(trace.id)


def test_accept_ia_forbidden(client: TestClient, etp: ETP, trace: ETPAITrace):
    token = create_test_token(scopes=["etp:read"])
    response = client.post(
        f"/api/v1/etp/{etp.id}/accept-ia/{trace.section}",
        headers={"Authorization": f"Bearer {token}", "If-Match": str(etp.version_id)},
        json={"trace_id": str(trace.id)},
    )
    assert response.status_code == 403


def test_accept_ia_legacy_endpoint(
    client: TestClient, db: Session, auth_headers: dict, etp: ETP, trace: ETPAITrace
):
    etp_version = etp.version_id
    response = client.post(
        f"/api/v1/etp/{etp.id}/aceitar-ia/{trace.section}",
        headers={**auth_headers, "If-Match": str(etp_version)},
        json={"trace_id": str(trace.id)},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"][trace.section] == trace.llm_response
    assert data["version_id"] == etp_version + 1
