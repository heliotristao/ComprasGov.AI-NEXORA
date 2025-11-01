from fastapi import APIRouter
from pydantic import BaseModel
from app.core.notifications import notification_service

router = APIRouter()

class NotificationRequest(BaseModel):
    user_id: str
    template_id: str
    context: dict

@router.post("/notify")
async def send_notification(request: NotificationRequest):
    notification_service.send_notification(
        user_id=request.user_id,
        template_id=request.template_id,
        context=request.context
    )
    return {"status": "notifications sent"}
