from pydantic import BaseModel
from typing import Optional, Dict, Any

class NotificationLogBase(BaseModel):
    user_id: str
    template_id: str
    channel: str
    status: str
    provider_response: Optional[Dict[str, Any]] = None

class NotificationLogCreate(NotificationLogBase):
    pass

class NotificationLogSchema(NotificationLogBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True
