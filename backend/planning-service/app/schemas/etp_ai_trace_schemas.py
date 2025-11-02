from pydantic import BaseModel
from typing import Optional


class ETPAITraceCreate(BaseModel):
    etp_id: int
    field: str
    prompt: str
    response: str
    confidence: Optional[float] = None
    provider: str
    model: str


class ETPAITraceUpdate(BaseModel):
    pass


class ETPAITrace(ETPAITraceCreate):
    id: int

    class Config:
        from_attributes = True
