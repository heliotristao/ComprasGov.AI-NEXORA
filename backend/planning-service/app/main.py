import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import health, planning, market_ai, etp_ai, tr_ai, rag, dashboard, plans, etp

logging.basicConfig(filename='audit.log', level=logging.INFO)

app = FastAPI(title="NEXORA Planning Service")

origins = [
    "https://compras-gov-ai-nexora.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(planning.router, prefix="/api/v1", tags=["plannings"])
app.include_router(market_ai.router, prefix="/api/v1", tags=["market_ai"])
app.include_router(etp_ai.router, prefix="/api/v1", tags=["etp_ai"])
app.include_router(tr_ai.router, prefix="/api/v1", tags=["tr_ai"])
app.include_router(rag.router, prefix="/api/v1", tags=["rag"])
app.include_router(plans.router, prefix="/api/v1", tags=["plans"])
app.include_router(etp.router, prefix="/api/v1", tags=["etp"])
