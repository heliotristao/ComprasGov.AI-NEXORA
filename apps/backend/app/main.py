from fastapi import FastAPI

from app.api.routes import api_router
from app.core.config import settings

app = FastAPI(
    title="ComprasGov.AI Backend",
    version="0.1.0",
    contact={
        "name": "NEXORA ComprasGov.AI",
        "url": "https://comprasgov.ai",
    },
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health", tags=["healthcheck"])
def healthcheck() -> dict[str, str]:
    """Simple healthcheck endpoint used by monitoring systems."""
    return {"status": "ok"}
