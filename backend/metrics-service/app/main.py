from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.v1.endpoints import metrics
from nexora_auth.middlewares import TraceMiddleware, TrustedHeaderMiddleware
from prometheus_fastapi_instrumentator import Instrumentator, metrics as prometheus_metrics
from app.services import metrics_calculator
from prometheus_client import Gauge

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

# --- Prometheus Instrumentator ---
instrumentator = Instrumentator().instrument(app)

# --- Custom Metrics ---
STATUS_METRIC = Gauge(
    "process_status", "Number of processes by status", ["status"]
)
TREND_METRIC = Gauge(
    "process_trend", "Trend of processes created over time", ["month"]
)
SAVINGS_METRIC = Gauge("estimated_savings", "Estimated savings")

def prometheus_process_status_instrumentation(info):
    data = metrics_calculator.prometheus_process_status()
    for status, count in data.items():
        STATUS_METRIC.labels(status).set(count)

def prometheus_trend_instrumentation(info):
    data = metrics_calculator.prometheus_trend()
    for i, label in enumerate(data["labels"]):
        TREND_METRIC.labels(label).set(data["values"][i])

def prometheus_savings_instrumentation(info):
    data = metrics_calculator.prometheus_savings()
    SAVINGS_METRIC.set(data["estimated_savings"])

instrumentator.add(prometheus_process_status_instrumentation)
instrumentator.add(prometheus_trend_instrumentation)
instrumentator.add(prometheus_savings_instrumentation)

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

# Expose Prometheus metrics
instrumentator.expose(app, include_in_schema=True, tags=["Monitoring"])

@app.on_event("startup")
async def startup():
    instrumentator.expose(app, include_in_schema=True, tags=["Monitoring"])
