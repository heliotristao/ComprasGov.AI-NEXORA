import boto3
import pytest
import importlib
from moto import mock_aws
from starlette.testclient import TestClient

from app.core import storage

# Mock S3 bucket name
S3_BUCKET_NAME = "nexora-artifacts-test"


@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    import os

    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["S3_BUCKET_NAME"] = S3_BUCKET_NAME
    storage.S3_BUCKET_NAME = S3_BUCKET_NAME


@pytest.fixture(scope="function")
def s3_mock(aws_credentials):
    with mock_aws():
        importlib.reload(storage)
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket=S3_BUCKET_NAME)
        yield s3


def test_upload_artifact(client: TestClient, s3_mock):
    """Test artifact upload endpoint."""
    data = {
        "process_id": "process-123",
        "doc_type": "ETP",
        "org_id": "org-abc",
        "author_id": "user-xyz",
    }
    files = {"file": ("test.txt", b"this is a test file", "text/plain")}

    response = client.post("/api/v1/artifacts/", data=data, files=files)

    assert response.status_code == 200
    json_response = response.json()
    assert json_response["process_id"] == data["process_id"]
    assert json_response["doc_type"] == data["doc_type"]
    assert json_response["version"] == 1
    assert json_response["filename"] == "test.txt"

    # Verify file was uploaded to S3
    s3_key = json_response["s3_key"]
    s3_object = s3_mock.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
    assert s3_object["ResponseMetadata"]["HTTPStatusCode"] == 200
    assert s3_object["Body"].read() == b"this is a test file"


def test_get_artifact(client: TestClient, s3_mock):
    """Test retrieving an artifact."""
    # First, upload an artifact to test against
    data = {
        "process_id": "process-456",
        "doc_type": "TR",
        "org_id": "org-def",
        "author_id": "user-uvw",
    }
    files = {"file": ("report.pdf", b"pdf content", "application/pdf")}
    upload_response = client.post("/api/v1/artifacts/", data=data, files=files)
    artifact_id = upload_response.json()["id"]

    # Now, test the get endpoint
    response = client.get(f"/api/v1/artifacts/{artifact_id}")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["id"] == artifact_id
    assert json_response["process_id"] == "process-456"


def test_get_download_url(client: TestClient, s3_mock):
    """Test generating a pre-signed download URL."""
    data = {
        "process_id": "process-789",
        "doc_type": "LOG",
        "org_id": "org-ghi",
        "author_id": "user-rst",
    }
    files = {"file": ("log.csv", b"csv,data", "text/csv")}
    upload_response = client.post("/api/v1/artifacts/", data=data, files=files)
    artifact_id = upload_response.json()["id"]

    response = client.get(f"/api/v1/artifacts/{artifact_id}/download-url")
    assert response.status_code == 200
    assert "url" in response.json()


def test_search_artifacts(client: TestClient, s3_mock):
    """Test searching for artifacts."""
    # Upload a few artifacts to search through
    client.post(
        "/api/v1/artifacts/",
        data={
            "process_id": "search-proc-1",
            "doc_type": "ETP",
            "org_id": "search-org-1",
            "author_id": "user-1",
        },
        files={"file": ("file1.txt", b"...", "text/plain")},
    )
    client.post(
        "/api/v1/artifacts/",
        data={
            "process_id": "search-proc-1",
            "doc_type": "TR",
            "org_id": "search-org-1",
            "author_id": "user-2",
        },
        files={"file": ("file2.txt", b"...", "text/plain")},
    )

    # Search by process_id
    response = client.get("/api/v1/artifacts/search/?process_id=search-proc-1")
    assert response.status_code == 200
    assert len(response.json()) == 2

    # Search by doc_type
    response = client.get("/api/v1/artifacts/search/?doc_type=ETP")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["doc_type"] == "ETP"
