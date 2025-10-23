import pandas as pd
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from app.db.session import SessionLocal
from app.db.models.market_price import MarketPrice
import joblib
import os

MODEL_DIR = "app/ml/models"
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.joblib")

def train_model():
    """
    Trains a machine learning model to predict unit_value from item_description.
    """
    db: Session = SessionLocal()
    try:
        # Load data from the database
        query = db.query(MarketPrice.item_description, MarketPrice.unit_value).all()
        df = pd.DataFrame(query, columns=['item_description', 'unit_value'])

        if df.empty:
            raise ValueError("No data available to train the model.")

        # Define the model pipeline
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])

        # Train the model
        pipeline.fit(df['item_description'], df['unit_value'])

        # Save the trained model
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(pipeline, MODEL_PATH)

    finally:
        db.close()

if __name__ == "__main__":
    train_model()
