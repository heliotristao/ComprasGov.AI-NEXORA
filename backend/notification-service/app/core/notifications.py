from jinja2 import Environment, FileSystemLoader
import os
import boto3
from botocore.exceptions import ClientError
import httpx
import asyncio
import backoff

# --- Configuration ---
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
SES_SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL")

# --- Clients ---
ses_client = boto3.client("ses", region_name=AWS_REGION) if SES_SENDER_EMAIL else None

# --- Email Provider ---
def send_email(to: str, subject: str, html_content: str):
    """Sends an email using Amazon SES, raising an exception on failure."""
    if not ses_client:
        print("Warning: SES_SENDER_EMAIL not configured. Email will not be sent.")
        return # Or raise a configuration error

    try:
        response = ses_client.send_email(
            Source=SES_SENDER_EMAIL,
            Destination={'ToAddresses': [to]},
            Message={
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {'Html': {'Data': html_content, 'Charset': 'UTF-8'}}
            }
        )
        print(f"Email sent to {to}. Message ID: {response['MessageId']}")
    except ClientError as e:
        print(f"Error sending email via SES: {e.response['Error']['Message']}")
        # Re-raise to be caught by the notification service and logged
        raise

# --- Webhook Provider ---
@backoff.on_exception(backoff.expo,
                      (httpx.RequestError, httpx.HTTPStatusError),
                      max_tries=3,
                      jitter=backoff.full_jitter)
async def send_webhook(url: str, payload: dict):
    """Sends a webhook using httpx with retry on failure."""
    headers = {
        "Content-Type": "application/json",
        # "X-NEXORA-SIGNATURE": "..." # Example for verification
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=10.0)
        response.raise_for_status() # Raises for 4xx/5xx responses
        print(f"Webhook sent to {url}. Status: {response.status_code}")

from app.db.session import SessionLocal
from app.crud import crud_notification_log
from app.schemas.notification_log import NotificationLogCreate

class NotificationService:
    def __init__(self):
        # Assuming templates are in a 'templates' directory at the service root
        template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))

    def get_template_content(self, template_id: str, context: dict) -> tuple[str, str]:
        """Renders the subject and body for a given template."""
        # A simple mapping of template_id to file and subject
        template_map = {
            "etp_approved": ("etp_approved.html", "Seu ETP '{etp_name}' foi aprovado."),
            "etp_rejected": ("etp_rejected.html", "Seu ETP '{etp_name}' foi rejeitado."),
            "new_comment": ("new_comment.html", "Novo comentário no ETP '{etp_name}'."),
        }

        if template_id not in template_map:
            raise ValueError(f"Invalid template_id: {template_id}")

        template_filename, subject_template = template_map[template_id]

        subject = subject_template.format(**context)
        template = self.jinja_env.get_template(template_filename)
        html_content = template.render(**context)

        return subject, html_content

    async def send_notification(self, user_id: str, template_id: str, context: dict):
        # In a real system, you'd look up the user's notification preferences (email, webhook URL, etc.)
        # For this example, we'll use dummy data.
        user_email = f"{user_id}@example.com"
        user_webhook_url = "https://webhook.site/dummy-url"

        db = SessionLocal()
        try:
            # 1. Send via Email Channel (Synchronous)
            try:
                subject, html_content = self.get_template_content(template_id, context)
                send_email(to=user_email, subject=subject, html_content=html_content)
                log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="email", status="sent")
                crud_notification_log.create_notification_log(db, obj_in=log_entry)
            except Exception as e:
                log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="email", status="failed", provider_response={"error": str(e)})
                crud_notification_log.create_notification_log(db, obj_in=log_entry)
                print(f"Failed to send email notification: {e}")

            # 2. Send via Webhook Channel (Asynchronous)
            try:
                payload = {
                    "event_type": template_id,
                    "user_id": user_id,
                    "data": context
                }
                if user_webhook_url:
                    await send_webhook(url=user_webhook_url, payload=payload)
                    log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="webhook", status="sent")
                    crud_notification_log.create_notification_log(db, obj_in=log_entry)
            except Exception as e:
                log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="webhook", status="failed", provider_response={"error": str(e)})
                crud_notification_log.create_notification_log(db, obj_in=log_entry)
                print(f"Failed to send webhook notification: {e}")
        finally:
            db.close()

notification_service = NotificationService()
