from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ml.trainer import train_model
from app.ml.predictor import predict_price

router = APIRouter()

class TrainResponse(BaseModel):
    message: str

class PredictRequest(BaseModel):
    item_description: str

class PredictResponse(BaseModel):
    predicted_price: float

@router.post("/market/train", response_model=TrainResponse)
def trigger_training():
    """
    Trigger the model training process.
    """
    try:
        train_model()
        return {"message": "Model training started successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/market/predict", response_model=PredictResponse)
def get_prediction(request: PredictRequest):
    """
    Predict the price of an item.
    """
    price = predict_price(request.item_description)
    if price is None:
        raise HTTPException(status_code=404, detail="Model not found. Please train the model first.")
    return {"predicted_price": price}
