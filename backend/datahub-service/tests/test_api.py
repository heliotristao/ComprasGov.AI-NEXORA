import uuid
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import crud
from app.schemas import ArtifactCreate

def test_create_artifact(client: TestClient, db: Session):
    with patch("app.api.v1.endpoints.artifacts.process_artifact.delay") as mock_task:
        artifact_in = {
            "process_id": "test_process",
            "doc_type": "ETP",
            "created_by": "test_user",
        }
        file_content = b"This is a test file."
        files = {"file": ("test.txt", file_content, "text/plain")}

        response = client.post("/api/v1/artifacts/", data=artifact_in, files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["process_id"] == "test_process"
        assert len(data["versions"]) == 1
        assert data["versions"][0]["version"] == 1
        mock_task.assert_called_once()

def test_get_artifact(client: TestClient, db: Session):
    artifact_in = ArtifactCreate(process_id="test_get", doc_type="TR", created_by="test_user")
    artifact = crud.create_artifact(db, artifact_in)

    response = client.get(f"/api/v1/artifacts/{artifact.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(artifact.id)
    assert data["process_id"] == "test_get"
