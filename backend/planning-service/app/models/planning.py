from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlanningBase(BaseModel):
    description: str
    market_analysis: Optional[str] = None
    risks: Optional[str] = None
    necessity: Optional[str] = None
    solution_comparison: Optional[str] = None
    contract_quantities: Optional[str] = None
    technical_viability: Optional[str] = None
    expected_results: Optional[str] = None


class PlanningCreate(PlanningBase):
    pass


class Planning(PlanningBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
