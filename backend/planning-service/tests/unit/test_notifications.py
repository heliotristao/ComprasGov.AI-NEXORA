from datetime import datetime, timezone

from app.core.notifications import service
from app.db.models.sla import SLASetting, SLAState, SLAStatus


def test_notification_sent_only_on_state_change(monkeypatch):
    sent = []

    def fake_email(recipients, subject, body):
        sent.append(list(recipients))

    monkeypatch.setattr(service, "send_email_notification", fake_email)

    status = SLAStatus(
        process_id="proc-1",
        process_type="etp",
        stage="analise",
        state=SLAState.warn,
        started_at=datetime.now(timezone.utc),
    )
    status.primary_contact = "responsavel@example.com"
    setting = SLASetting(
        process_type="etp",
        stage="analise",
        target_hours=48,
        notification_channel="email",
    )

    assert service.send_state_change_notification(status, setting) is True
    assert sent == [["responsavel@example.com"]]
    assert status.last_notified_state == SLAState.warn

    assert service.send_state_change_notification(status, setting) is False
    assert sent == [["responsavel@example.com"]]


def test_notification_escalates_on_breach(monkeypatch):
    recipients = []

    def fake_email(recipients_arg, subject, body):
        recipients.append(list(recipients_arg))

    monkeypatch.setattr(service, "send_email_notification", fake_email)

    status = SLAStatus(
        process_id="proc-2",
        process_type="etp",
        stage="analise",
        state=SLAState.breach,
        started_at=datetime.now(timezone.utc),
    )
    status.primary_contact = "responsavel@example.com"
    status.escalation_contact = "gestor@example.com"
    setting = SLASetting(
        process_type="etp",
        stage="analise",
        target_hours=48,
        notification_channel="email",
    )

    service.send_state_change_notification(status, setting)

    assert recipients == [["responsavel@example.com", "gestor@example.com"]]
    assert status.last_notified_state == SLAState.breach
