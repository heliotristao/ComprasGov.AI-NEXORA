from pydantic import BaseModel
from typing import Optional


class PlanBase(BaseModel):
    objective: Optional[str] = None
    justification: Optional[str] = None


class PlanCreate(PlanBase):
    objective: str
    justification: str


class PlanUpdate(PlanBase):
    pass


class Plan(PlanBase):
    id: str

    class Config:
        from_attributes = True
