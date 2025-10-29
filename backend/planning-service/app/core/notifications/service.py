"""Notification orchestration for SLA transitions."""
from __future__ import annotations

from typing import List

from app.core.notifications.email import send_email_notification
from app.core.notifications.webhook import trigger_webhook
from app.db.models.sla import SLASetting, SLAState, SLAStatus


def _resolve_recipients(status: SLAStatus) -> List[str]:
    recipients: List[str] = []
    if status.primary_contact:
        recipients.append(status.primary_contact)
    if status.state == SLAState.breach and status.escalation_contact:
        recipients.append(status.escalation_contact)
    return recipients


def send_state_change_notification(status: SLAStatus, setting: SLASetting) -> bool:
    """Dispatch notifications when the SLA state changes."""
    if status.last_notified_state == status.state:
        return False

    recipients = _resolve_recipients(status)
    if not recipients:
        return False

    subject = (
        f"SLA {status.state.value.upper()} - {status.process_type}:{status.process_id}"
    )
    body = (
        f"O processo {status.process_type}:{status.process_id} na etapa {status.stage} "
        f"encontrou o estado {status.state.value}."
    )

    if setting.notification_channel == "webhook" and setting.webhook_url:
        trigger_webhook(
            setting.webhook_url,
            {
                "process_id": status.process_id,
                "process_type": status.process_type,
                "stage": status.stage,
                "state": status.state.value,
            },
        )
    else:
        send_email_notification(recipients, subject, body)

    status.last_notified_state = status.state
    return True
