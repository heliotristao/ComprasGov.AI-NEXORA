from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.v1.endpoints import (
    health, planning, plans, etp, etp_ai, etp_validation,
    tr, tr_ai, tr_transform, templates, dashboard, market_ai, rag, sla,
    tr_consolidation, etp_consolidation, etp_workflow, risk
)
from nexora_auth.middlewares import TraceMiddleware, TrustedHeaderMiddleware
from app.core.logging_config import setup_logging

# Setup structured logging
setup_logging()

# --- OpenAPI Security Scheme Definition ---
security_schemes = {
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Enter JWT Bearer token from the governance-service /token endpoint",
            }
        }
    },
    "security": [{"BearerAuth": []}],
}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="NEXORA Planning Service",
        version="1.0.0",
        description="Manages Plannings, ETPs (Estudo Técnico Preliminar), and TRs (Termo de Referência).",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = security_schemes["components"]["securitySchemes"]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app = FastAPI(title="NEXORA Planning Service")
app.openapi = custom_openapi

# --- Middlewares ---
app.add_middleware(TraceMiddleware)
app.add_middleware(TrustedHeaderMiddleware)

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

# --- API Routers ---
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(planning.router, prefix="/api/v1/planning", tags=["Planning"])
app.include_router(plans.router, prefix="/api/v1/plans", tags=["Plans"])
app.include_router(etp.router, prefix="/api/v1/etp", tags=["ETP"])
app.include_router(etp_ai.router, prefix="/api/v1", tags=["ETP AI"])
app.include_router(etp_validation.router, prefix="/api/v1/etp/validation", tags=["ETP Validation"])
app.include_router(tr.router, prefix="/api/v1/tr", tags=["TR"])
app.include_router(tr_ai.router, prefix="/api/v1/tr/ai", tags=["TR AI"])
app.include_router(tr_transform.router, prefix="/api/v1/tr/transform", tags=["TR Transform"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["Templates"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(market_ai.router, prefix="/api/v1/market-ai", tags=["Market AI"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG"])
app.include_router(sla.router, prefix="/api/v1/sla", tags=["SLA"])
app.include_router(tr_consolidation.router, prefix="/api/v1", tags=["TR Consolidation"])
app.include_router(etp_consolidation.router, prefix="/api/v1", tags=["ETP Consolidation"])
app.include_router(etp_workflow.router, prefix="/api/v1/etp", tags=["ETP Workflow"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["Risk"])
