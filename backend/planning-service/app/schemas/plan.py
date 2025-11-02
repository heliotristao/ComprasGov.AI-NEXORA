from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PlanningBase(BaseModel):
    description: Optional[str] = None
    market_analysis: Optional[str] = None
    risks: Optional[str] = None
    necessity: Optional[str] = None
    solution_comparison: Optional[str] = None
    contract_quantities: Optional[str] = None
    technical_viability: Optional[str] = None
    expected_results: Optional[str] = None


class PlanningCreate(PlanningBase):
    pass


class PlanningUpdate(PlanningBase):
    pass


class Planning(PlanningBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
