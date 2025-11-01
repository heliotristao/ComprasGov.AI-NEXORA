from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

@patch('app.core.notifications.send_email')
@patch('app.core.notifications.send_webhook')
def test_send_notification_endpoint(mock_send_webhook, mock_send_email):
    # Arrange
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

    # Verify that the notification functions were called with the correct arguments
    mock_send_email.assert_called_once()
    mock_send_webhook.assert_called_once()

    # Check email call arguments
    email_args, email_kwargs = mock_send_email.call_args
    assert email_kwargs['to'] == 'test_user@example.com'
    assert email_kwargs['subject'] == "Seu ETP 'My Test ETP' foi aprovado."
    assert "My Test ETP" in email_kwargs['html_content']

    # Check webhook call arguments
    webhook_args, webhook_kwargs = mock_send_webhook.call_args
    assert webhook_kwargs['url'] == 'https://webhook.site/dummy-url'
    assert webhook_kwargs['payload']['event_type'] == 'etp_approved'
    assert webhook_kwargs['payload']['data']['etp_name'] == 'My Test ETP'
