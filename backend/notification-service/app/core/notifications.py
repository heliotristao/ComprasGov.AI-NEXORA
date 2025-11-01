from jinja2 import Environment, FileSystemLoader
import os

# Placeholder for email/webhook sending logic
def send_email(to: str, subject: str, html_content: str):
    print(f"Sending email to {to} with subject '{subject}'")
    # In a real implementation, this would integrate with a service like Amazon SES or SendGrid.
    pass

def send_webhook(url: str, payload: dict):
    print(f"Sending webhook to {url} with payload: {payload}")
    # In a real implementation, this would use a library like httpx to make a POST request.
    pass

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

    def send_notification(self, user_id: str, template_id: str, context: dict):
        # In a real system, you'd look up the user's notification preferences (email, webhook URL, etc.)
        # For this example, we'll use dummy data.
        user_email = f"{user_id}@example.com"
        user_webhook_url = "https://webhook.site/dummy-url"

from app.db.session import SessionLocal
from app.crud import crud_notification_log
from app.schemas.notification_log import NotificationLogCreate
        db = SessionLocal()
        # 1. Send via Email Channel
        try:
            subject, html_content = self.get_template_content(template_id, context)
            send_email(to=user_email, subject=subject, html_content=html_content)
            log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="email", status="sent")
            crud_notification_log.create_notification_log(db, obj_in=log_entry)
        except Exception as e:
            log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="email", status="failed", provider_response={"error": str(e)})
            crud_notification_log.create_notification_log(db, obj_in=log_entry)
            print(f"Failed to send email notification: {e}")

        # 2. Send via Webhook Channel
        try:
            payload = {
                "event_type": template_id,
                "user_id": user_id,
                "data": context
            }
            if user_webhook_url:
                send_webhook(url=user_webhook_url, payload=payload)
                log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="webhook", status="sent")
                crud_notification_log.create_notification_log(db, obj_in=log_entry)
        except Exception as e:
            log_entry = NotificationLogCreate(user_id=user_id, template_id=template_id, channel="webhook", status="failed", provider_response={"error": str(e)})
            crud_notification_log.create_notification_log(db, obj_in=log_entry)
            print(f"Failed to send webhook notification: {e}")
        finally:
            db.close()

notification_service = NotificationService()
