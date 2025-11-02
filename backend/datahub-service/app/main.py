from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.api.v1.endpoints import artifacts, catalog
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
        title="NEXORA DataHub Service",
        version="1.0.0",
        description="Manages artifact storage, metadata, and semantic cataloging.",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = security_schemes["components"]["securitySchemes"]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app = FastAPI(title="NEXORA DataHub Service")
app.openapi = custom_openapi

# --- Middlewares ---
app.add_middleware(TraceMiddleware)
app.add_middleware(TrustedHeaderMiddleware)

# --- API Routers ---
app.include_router(artifacts.router, prefix="/api/v1/artifacts", tags=["Artifacts"])
app.include_router(catalog.router, prefix="/api/v1/catalog", tags=["Catalog"])
