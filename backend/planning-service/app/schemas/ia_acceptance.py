from pydantic import BaseModel
import uuid
from datetime import datetime


class IAAcceptanceCreate(BaseModel):
    final_text: str
    execution_id: uuid.UUID


class IAAcceptanceHistorySchema(BaseModel):
    id: uuid.UUID
    etp_id: uuid.UUID
    section_name: str
    execution_id: uuid.UUID
    accepted_by_id: uuid.UUID
    accepted_at: datetime | None = None
    diff: str | None

    class Config:
        from_attributes = True
