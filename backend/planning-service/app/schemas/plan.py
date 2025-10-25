from pydantic import BaseModel
from datetime import datetime

class Plan(BaseModel):
    id: str
    objective: str
    status: str
    created_at: datetime
