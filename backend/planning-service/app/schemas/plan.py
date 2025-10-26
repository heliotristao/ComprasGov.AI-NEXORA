from pydantic import BaseModel

class PlanBase(BaseModel):
    objective: str
    justification: str

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: str
    status: str

    class Config:
        from_attributes = True
