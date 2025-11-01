from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from app.api.v1.endpoints import notifications

app = FastAPI(title="Notification Service")

app.include_router(notifications.router, prefix="/api/v1", tags=["notifications"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
