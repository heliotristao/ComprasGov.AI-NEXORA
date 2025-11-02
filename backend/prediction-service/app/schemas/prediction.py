from pydantic import BaseModel

class PredictionRequest(BaseModel):
    description: str
    category: str
    region: str

class PredictionResponse(BaseModel):
    predicted_price: float
    model_version: str
