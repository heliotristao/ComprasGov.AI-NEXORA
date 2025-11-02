import uuid
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session
from app import crud
from app.core.config import API_V1_STR
from tests.utils.etp import create_random_etp

# Basic test structure
def test_create_consolidation_job(client: TestClient, db: Session) -> None:
    """
    Test creating a new ETP consolidation job.
    """
    etp = create_random_etp(db)
    response = client.post(f"{API_V1_STR}/etp/{etp.id}/consolidate")
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"

@patch("app.tasks.consolidation_worker.consolidate_etp_task.delay")
def test_consolidate_etp_task_trigger(
    mock_delay: MagicMock, client: TestClient, db: Session
) -> None:
    """
    Test that the consolidation task is triggered on endpoint call.
    """
    etp = create_random_etp(db)
    client.post(f"{settings.API_V1_STR}/etp/{etp.id}/consolidate")
    mock_delay.assert_called_once()

def test_get_consolidation_status(client: TestClient, db: Session) -> None:
    """
    Test getting the status of an ETP consolidation job.
    """
    etp = create_random_etp(db)
    response = client.post(f"{API_V1_STR}/etp/{etp.id}/consolidate")
    job_id = response.json()["job_id"]

    status_response = client.get(f"{API_V1_STR}/etp/{etp.id}/consolidation-status/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    assert data["job_id"] == job_id
    assert data["status"] == "queued"
