from fastapi import FastAPI
from app.api.v1.endpoints import collector

app = FastAPI()

app.include_router(collector.router, prefix="/api/v1")
