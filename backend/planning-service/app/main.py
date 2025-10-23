from fastapi import FastAPI
from app.api.v1.endpoints import health, planning, market_ai, etp_ai, tr_ai

app = FastAPI(title="NEXORA Planning Service")

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(planning.router, prefix="/api/v1", tags=["plannings"])
app.include_router(market_ai.router, prefix="/api/v1", tags=["market_ai"])
app.include_router(etp_ai.router, prefix="/api/v1", tags=["etp_ai"])
app.include_router(tr_ai.router, prefix="/api/v1", tags=["tr_ai"])
