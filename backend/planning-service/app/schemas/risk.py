from pydantic import BaseModel, Field
from typing import List

class Risk(BaseModel):
    risk_description: str = Field(..., description="Description of the identified risk.")
    probability: str = Field(..., description="Probability of the risk occurring (e.g., Low, Medium, High).")
    impact: str = Field(..., description="Impact of the risk if it occurs (e.g., Low, Medium, High).")
    mitigation_measure: str = Field(..., description="Suggested measure to mitigate the risk.")

class RiskMatrix(BaseModel):
    risks: List[Risk] = Field(..., description="A list of identified risks.")

class RiskGenerationRequest(BaseModel):
    description: str = Field(..., description="Description of the object of the procurement.")
