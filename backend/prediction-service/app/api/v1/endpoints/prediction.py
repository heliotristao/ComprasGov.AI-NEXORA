import pickle
import os
from fastapi import APIRouter
from app.schemas.prediction import PredictionRequest, PredictionResponse
import pandas as pd

router = APIRouter()

MODEL_VERSION = "0.1.0"
PIPELINE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'models', 'price_pipeline.pkl')

pipeline = None

@router.post("/predict-price", response_model=PredictionResponse)
async def predict_price(request: PredictionRequest):
    global pipeline
    if pipeline is None:
        if os.path.exists(PIPELINE_PATH):
            with open(PIPELINE_PATH, 'rb') as f:
                pipeline = pickle.load(f)
        else:
            print("Pipeline not found. Predictions will not work.")
            return {"predicted_price": 0.0, "model_version": MODEL_VERSION}

    # Create a DataFrame from the request
    data = {
        'item_description': [request.description],
        'quantity': [1],  # Assuming a quantity of 1 for prediction
        'year': [pd.Timestamp.now().year],
        'month': [pd.Timestamp.now().month],
        'day': [pd.Timestamp.now().day],
    }
    input_df = pd.DataFrame(data)

    # Make a prediction using the pipeline
    prediction = pipeline.predict(input_df)[0]

    return {"predicted_price": prediction, "model_version": MODEL_VERSION}
