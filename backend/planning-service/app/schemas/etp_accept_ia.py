import uuid
from datetime import datetime

from pydantic import BaseModel


class ETPAcceptanceLogSchema(BaseModel):
    id: int
    etp_id: uuid.UUID
    section: str
    trace_id: uuid.UUID
    accepted_at: datetime
    accepted_by: str

    class Config:
        from_attributes = True
