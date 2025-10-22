from fastapi import FastAPI
from app.api.v1.endpoints import health, auth

app = FastAPI(title="NEXORA Governance Service")

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
