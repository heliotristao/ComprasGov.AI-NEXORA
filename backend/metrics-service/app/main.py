from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.v1.endpoints import metrics
from nexora_auth.middlewares import TraceMiddleware, TrustedHeaderMiddleware

# --- OpenAPI Security Scheme Definition ---
security_schemes = {
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": (
                    "Enter JWT Bearer token from the "
                    "governance-service /token endpoint"
                ),
            }
        }
    },
    "security": [{"BearerAuth": []}],
}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="NEXORA Metrics Service",
        version="1.0.0",
        description=(
            "Aggregates and exposes operational metrics for the "
            "predictive dashboard."
        ),
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = (
        security_schemes["components"]["securitySchemes"]
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app = FastAPI(title="NEXORA Metrics Service")
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
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["Metrics"])
