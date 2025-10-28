import joblib
import os
from typing import Optional

MODEL_DIR = "app/ml/models"
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.joblib")

def predict_price(item_description: str) -> Optional[float]:
    """
    Predicts the price of an item based on its description.
    """
    if not os.path.exists(MODEL_PATH):
        return None

    pipeline = joblib.load(MODEL_PATH)
    prediction = pipeline.predict([item_description])
    return prediction[0]
