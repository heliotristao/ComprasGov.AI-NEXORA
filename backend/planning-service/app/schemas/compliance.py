from pydantic import BaseModel, Field
from typing import List, Optional

class ComplianceItem(BaseModel):
    field: str
    message: str

class ComplianceReport(BaseModel):
    errors: List[ComplianceItem] = Field(default_factory=list)
    warnings: List[ComplianceItem] = Field(default_factory=list)
    suggestions: List[ComplianceItem] = Field(default_factory=list)
