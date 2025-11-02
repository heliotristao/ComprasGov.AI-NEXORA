import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.etp import ETP, ETPStatus
from app.db.models.etp_workflow_history import ETPWorkflowHistory
from app.db.models.audit_log import AuditLog

@pytest.fixture(scope="function")
def etp_in_draft(db: Session) -> ETP:
    """Create an ETP in draft status."""
    etp = ETP(
        title="Test ETP for Workflow",
        data={"description": "Test ETP"},
        status=ETPStatus.draft,
        created_by="testuser",
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp

def test_submit_etp_success(client: TestClient, db: Session, etp_in_draft: ETP):
    response = client.post(f"/api/v1/etp/{etp_in_draft.id}/submit")
    assert response.status_code == 200
    db.refresh(etp_in_draft)
    assert etp_in_draft.status == ETPStatus.in_review
    history_log = db.query(ETPWorkflowHistory).filter_by(etp_id=etp_in_draft.id).one()
    assert history_log.to_status == "in_review"
    audit_log = db.query(AuditLog).filter(AuditLog.action == "ETP_SUBMITTED").one()
    assert audit_log is not None

def test_approve_etp_success(client: TestClient, db: Session, etp_in_draft: ETP):
    etp_in_draft.status = ETPStatus.in_review
    db.commit()
    response = client.post(f"/api/v1/etp/{etp_in_draft.id}/approve", json={"comments": "Looks good"})
    assert response.status_code == 200
    db.refresh(etp_in_draft)
    assert etp_in_draft.status == ETPStatus.approved
    history_log = db.query(ETPWorkflowHistory).filter_by(to_status="approved").one()
    assert history_log.comments == "Looks good"
    audit_log = db.query(AuditLog).filter(AuditLog.action == "ETP_APPROVED").one()
    assert audit_log is not None

def test_reject_etp_success(client: TestClient, db: Session, etp_in_draft: ETP):
    etp_in_draft.status = ETPStatus.in_review
    db.commit()
    response = client.post(f"/api/v1/etp/{etp_in_draft.id}/reject", json={"comments": "Needs revision"})
    assert response.status_code == 200
    db.refresh(etp_in_draft)
    assert etp_in_draft.status == ETPStatus.rejected
    history_log = db.query(ETPWorkflowHistory).filter_by(to_status="rejected").one()
    assert history_log.comments == "Needs revision"
    audit_log = db.query(AuditLog).filter(AuditLog.action == "ETP_REJECTED").one()
    assert audit_log is not None

def test_approve_draft_etp_fails(client: TestClient, etp_in_draft: ETP):
    response = client.post(f"/api/v1/etp/{etp_in_draft.id}/approve", json={"comments": "This should fail"})
    assert response.status_code == 403

def test_submit_in_review_etp_fails(client: TestClient, db: Session, etp_in_draft: ETP):
    etp_in_draft.status = ETPStatus.in_review
    db.commit()
    response = client.post(f"/api/v1/etp/{etp_in_draft.id}/submit")
    assert response.status_code == 403

def test_patch_approved_etp_fails(client: TestClient, db: Session, etp_in_draft: ETP):
    etp_in_draft.status = ETPStatus.approved
    db.commit()
    response = client.patch(f"/api/v1/etp/{etp_in_draft.id}", json={"data": {"title": "New Title"}})
    assert response.status_code == 403
