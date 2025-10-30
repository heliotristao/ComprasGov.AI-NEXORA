from fastapi import APIRouter
from app.api.v1.endpoints import artifacts

api_router = APIRouter()
api_router.include_router(
    artifacts.router, prefix="/artifacts", tags=["artifacts"]
)
