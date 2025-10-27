from pydantic import BaseModel
from datetime import datetime

class PlanBase(BaseModel):
    objective: str
    justification: str

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
