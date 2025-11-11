from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.api.v1.endpoints import artifacts, search
from nexora_auth.middlewares import TraceMiddleware, TrustedHeaderMiddleware
from app.core.logging_config import setup_logging
from app.db.milvus import get_milvus_connection, close_milvus_connection
from app.core.kafka import configure_consumer, get_consumer_manager
from app.consumers.tr_sync_consumer import tr_sync_consumer
from app.schemas.events import PLANEJAMENTO_TR_CRIADO_TOPIC

# Setup structured logging
setup_logging()

configure_consumer(
    topics=[PLANEJAMENTO_TR_CRIADO_TOPIC],
    handler=tr_sync_consumer.handle,
    group_id="datahub-tr-sync",
)

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

# --- Lifespan Events for Milvus Connection ---
@app.on_event("startup")
async def startup_event():
    get_milvus_connection()
    manager = get_consumer_manager()
    if manager:
        await manager.start()


@app.on_event("shutdown")
async def shutdown_event():
    manager = get_consumer_manager()
    if manager:
        await manager.stop()
    close_milvus_connection()

# --- Middlewares ---
app.add_middleware(TraceMiddleware)
app.add_middleware(TrustedHeaderMiddleware)

# --- API Routers ---
app.include_router(artifacts.router, prefix="/api/v1/artifacts", tags=["Artifacts"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
