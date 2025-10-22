from fastapi import FastAPI
from app.api.v1.endpoints import health

app = FastAPI(title="NEXORA Governance Service")

app.include_router(health.router, prefix="/api/v1")
