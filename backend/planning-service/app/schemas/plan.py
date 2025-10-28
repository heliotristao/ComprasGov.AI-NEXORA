from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal

class PlanBase(BaseModel):
    objective: str
    justification: str
    estimated_value: Optional[Decimal] = None
    responsible_department: Optional[str] = None
    priority: Optional[str] = None

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    objective: Optional[str] = None
    justification: Optional[str] = None
    estimated_value: Optional[Decimal] = None
    responsible_department: Optional[str] = None
    priority: Optional[str] = None

class Plan(PlanBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
