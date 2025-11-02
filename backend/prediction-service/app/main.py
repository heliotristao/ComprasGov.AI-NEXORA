from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.v1.endpoints import prediction
import os
import pickle

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model at startup
    pipeline_path = os.path.join(os.path.dirname(__file__), 'ml', 'models', 'price_pipeline.pkl')

    if os.path.exists(pipeline_path):
        with open(pipeline_path, 'rb') as f:
            prediction.pipeline = pickle.load(f)
    else:
        print("Pipeline not found. Predictions will not work.")

    yield

    # Clean up the model at shutdown
    prediction.pipeline = None

app = FastAPI(lifespan=lifespan)

app.include_router(prediction.router, prefix="/api/v1/market", tags=["prediction"])
