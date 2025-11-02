from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from app.api.v1.endpoints import notifications
from nexora_auth.middlewares import TraceMiddleware, TrustedHeaderMiddleware
from app.core.logging_config import setup_logging

# Setup structured logging
setup_logging()

app = FastAPI(title="Notification Service")

# --- Middlewares ---
app.add_middleware(TraceMiddleware)
app.add_middleware(TrustedHeaderMiddleware)

app.include_router(notifications.router, prefix="/api/v1", tags=["notifications"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
