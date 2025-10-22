from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime


class PlanningBase(BaseModel):
    description: str
    market_analysis: Optional[str] = None
    risks: Optional[str] = None


class PlanningCreate(PlanningBase):
    pass


class Planning(PlanningBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True
