from fastapi import APIRouter
from app.schemas.risk import RiskGenerationRequest, RiskMatrix
from app.core.risk_analysis import generate_risk_matrix

router = APIRouter()

@router.post("/generate", response_model=RiskMatrix)
async def generate_risk_matrix_endpoint(
    request: RiskGenerationRequest,
):
    """
    Receives a description of a procurement object and returns a generated risk matrix.
    """
    return await generate_risk_matrix(request.description)
