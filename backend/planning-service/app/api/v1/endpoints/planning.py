import uuid
from datetime import datetime
from fastapi import APIRouter, status, Response
from app.models.planning import PlanningCreate, Planning
from typing import List

router = APIRouter()


@router.post(
    "/plannings",
    response_model=Planning,
    status_code=status.HTTP_201_CREATED
)
def create_planning(*, planning_in: PlanningCreate, response: Response):
    """
    Create new planning.
    """
    new_id = uuid.uuid4()
    created_at = datetime.utcnow()
    planning = Planning(
        id=new_id,
        created_at=created_at,
        **planning_in.dict()
    )
    response.headers["Location"] = f"/api/v1/plannings/{new_id}"
    return planning


@router.get("/plannings", response_model=List[Planning])
def list_plannings():
    """
    List all plannings.
    """
    # Hardcoded data for now, simulating a database read
    return [
        Planning(
            id=uuid.uuid4(),
            created_at=datetime.utcnow(),
            description="Planejamento estratégico para aquisição de novos "
            "servidores.",
            market_analysis="Análise de mercado indica alta demanda por "
            "processamento em nuvem.",
            risks="Risco de atraso na entrega dos fornecedores.",
        ),
        Planning(
            id=uuid.uuid4(),
            created_at=datetime.utcnow(),
            description="Planejamento de contratação de serviços de "
            "consultoria em segurança.",
            market_analysis="Mercado de cibersegurança em expansão.",
            risks="Escassez de profissionais qualificados.",
        ),
    ]
