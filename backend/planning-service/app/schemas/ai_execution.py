import uuid
from typing import Optional
from pydantic import BaseModel

# --- AI Execution Schemas ---

class AIExecutionBase(BaseModel):
    prompt_text: str
    response_text: str
    provider_used: Optional[str] = None
    confidence_score: Optional[float] = None
    cost: Optional[float] = None
    latency_ms: Optional[int] = None
    trace_id: Optional[str] = None

class AIExecutionCreate(AIExecutionBase):
    pass

class AIExecutionUpdate(AIExecutionBase):
    pass

class AIExecutionInDBBase(AIExecutionBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class AIExecution(AIExecutionInDBBase):
    pass

# --- Endpoint Specific Schemas ---

class ETPGenerateSectionIn(BaseModel):
    keywords: str

class ETPGenerateSectionOut(BaseModel):
    generated_text: str
    execution_id: uuid.UUID
