import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud
from app.api.deps import get_db
from app.db.models.etp import ETPStatus
from app.schemas.etp import ETPSchema
from app.schemas.etp_workflow import ETPStatusUpdate, ETPRejection
from nexora_auth.decorators import require_scope
from nexora_auth.audit import audited

router = APIRouter()

NOTIFICATION_SERVICE_URL = "http://notification-service:8000/api/v1/notify"

def call_notification_service(user_id: str, template_id: str, context: dict):
    """Placeholder to call the notification service."""
    try:
        with httpx.Client() as client:
            response = client.post(
                NOTIFICATION_SERVICE_URL,
                json={"user_id": user_id, "template_id": template_id, "context": context},
            )
            response.raise_for_status()
    except httpx.RequestError as e:
        # Log the error, but don't block the main workflow
        print(f"Failed to call notification service: {e}")

@router.post(
    "/{etp_id}/submit",
    response_model=ETPSchema,
    status_code=status.HTTP_200_OK,
)
@audited(action="ETP_SUBMIT")
@require_scope("etp:submit")
def submit_etp(etp_id: uuid.UUID, db: Session = Depends(get_db)):
    etp = crud.etp.update_status(db, etp_id=etp_id, new_status=ETPStatus.submitted)
    # No notification on submit, only on final approval/rejection
    return etp

@router.post(
    "/{etp_id}/approve",
    response_model=ETPSchema,
    status_code=status.HTTP_200_OK,
)
@audited(action="ETP_APPROVE")
@require_scope("etp:approve")
def approve_etp(etp_id: uuid.UUID, db: Session = Depends(get_db)):
    etp = crud.etp.update_status(db, etp_id=etp_id, new_status=ETPStatus.approved)

    # Send notification
    call_notification_service(
        user_id=etp.created_by,
        template_id="etp_approved",
        context={"etp_name": etp.data.get("identificacao", {}).get("nome", "N/A")}
    )
    return etp

@router.post(
    "/{etp_id}/reject",
    response_model=ETPSchema,
    status_code=status.HTTP_200_OK,
)
@audited(action="ETP_REJECT")
@require_scope("etp:reject")
def reject_etp(etp_id: uuid.UUID, rejection: ETPRejection, db: Session = Depends(get_db)):
    etp = crud.etp.update_status(db, etp_id=etp_id, new_status=ETPStatus.rejected, comments=rejection.comments)

    # Send notification
    call_notification_service(
        user_id=etp.created_by,
        template_id="etp_rejected",
        context={
            "etp_name": etp.data.get("identificacao", {}).get("nome", "N/A"),
            "comments": rejection.comments
        }
    )
    return etp
