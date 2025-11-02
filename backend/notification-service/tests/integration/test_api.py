import pytest
from fastapi.testclient import TestClient
from moto import mock_aws
import boto3
from app.main import app

# --- Fixtures ---
@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    import os
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["SES_SENDER_EMAIL"] = "test@example.com"

@pytest.fixture
def ses_client(aws_credentials):
    with mock_aws():
        ses = boto3.client("ses", region_name="us-east-1")
        ses.verify_domain_identity(Domain="example.com")
        ses.verify_email_identity(EmailAddress="test@example.com")
        yield ses
# --- Tests ---
def test_send_notification_endpoint_ses_success(client, ses_client, httpx_mock):
    # Arrange
    httpx_mock.add_response(url="https://webhook.site/dummy-url", status_code=200)
    request_payload = {
        "user_id": "test_user",
        "template_id": "etp_approved",
        "context": {"etp_name": "My Test ETP"}
    }
    # Act
    response = client.post("/api/v1/notify", json=request_payload)
    # Assert
    assert response.status_code == 200
    assert response.json() == {"status": "notifications sent"}
    sent_emails = ses_client.get_send_statistics()["SendDataPoints"]
    # Moto doesn't easily expose sent email content, so we check if a send was attempted.
    assert len(sent_emails) > 0

def test_send_notification_endpoint_webhook_success(client, ses_client, httpx_mock):
    # Arrange
    webhook_url = "https://webhook.site/dummy-url"
    httpx_mock.add_response(url=webhook_url, status_code=200, json={"status": "received"})
    request_payload = {
        "user_id": "test_user",
        "template_id": "new_comment",
        "context": {"etp_name": "Another ETP"}
    }
    # Act
    response = client.post("/api/v1/notify", json=request_payload)
    # Assert
    assert response.status_code == 200
    requests = httpx_mock.get_requests()
    assert len(requests) == 1
    assert requests[0].url == webhook_url
    assert requests[0].json()["event_type"] == "new_comment"
