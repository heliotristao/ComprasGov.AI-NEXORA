import uuid
from datetime import datetime
from fastapi import APIRouter, status, Response, Depends
from sqlalchemy.orm import Session
from app.models.planning import PlanningCreate, Planning
from app.db.models.planning import Planning as PlanningModel
from app.db.session import SessionLocal
from typing import List

router = APIRouter()

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/plannings",
    response_model=Planning,
    status_code=status.HTTP_201_CREATED
)
def create_planning(
    *,
    planning_in: PlanningCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Create new planning.
    """
    db_planning = PlanningModel(**planning_in.dict())
    db.add(db_planning)
    db.commit()
    db.refresh(db_planning)
    response.headers["Location"] = f"/api/v1/plannings/{db_planning.id}"
    return db_planning


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
