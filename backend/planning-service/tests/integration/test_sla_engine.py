from datetime import datetime, timedelta, timezone

from app.core.sla.engine import evaluate_sla_for_open_processes
from app.db.models.sla import SLASetting, SLAState, SLAStatus


def test_evaluate_sla_transitions(db, monkeypatch):
    now = datetime.now(timezone.utc)

    setting = SLASetting(
        process_type="etp",
        stage="analise",
        target_hours=48,
        warn_threshold_hours=24,
        breach_threshold_hours=48,
        escalation_role="Coordenador",
    )
    db.add(setting)
    db.commit()

    statuses = [
        SLAStatus(
            process_id="proc-1",
            process_type="etp",
            stage="analise",
            state=SLAState.ok,
            started_at=now - timedelta(hours=5),
        ),
        SLAStatus(
            process_id="proc-2",
            process_type="etp",
            stage="analise",
            state=SLAState.ok,
            started_at=now - timedelta(hours=30),
        ),
        SLAStatus(
            process_id="proc-3",
            process_type="etp",
            stage="analise",
            state=SLAState.warn,
            started_at=now - timedelta(hours=60),
        ),
    ]

    for status in statuses:
        db.add(status)
    db.commit()

    notifications = []

    def fake_notify(status, _setting):
        notifications.append((status.process_id, status.state.value))
        return True

    monkeypatch.setattr(
        "app.core.sla.engine.send_state_change_notification",
        fake_notify,
    )

    evaluate_sla_for_open_processes(db)
    db.flush()

    db.refresh(statuses[0])
    db.refresh(statuses[1])
    db.refresh(statuses[2])

    assert statuses[0].state == SLAState.ok
    assert statuses[0].due_at is not None

    assert statuses[1].state == SLAState.warn
    assert statuses[1].last_transition_at is not None

    assert statuses[2].state == SLAState.breach
    assert statuses[2].last_transition_at is not None

    assert notifications == [
        ("proc-2", "warn"),
        ("proc-3", "breach"),
    ]
