from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from app.api.deps import get_db
from app.schemas.plan import (
    PlanCreate,
    PlanUpdate,
    PlanResponse,
    PlanListResponse,
)
from app.models.plan import Plan, PlanStatus
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_data: PlanCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Criar um novo plano de contratação
    """
    # Verificar se já existe um plano com o mesmo identifier
    existing_plan = db.query(Plan).filter(Plan.identifier == plan_data.identifier).first()
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um plano com o identificador '{plan_data.identifier}'"
        )
    
    # Criar o plano
    db_plan = Plan(
        **plan_data.model_dump(),
        created_by=current_user["id"]
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    return db_plan


@router.get("/", response_model=PlanListResponse)
def list_plans(
    search: Optional[str] = Query(None, description="Buscar por identificador ou objeto"),
    status_filter: Optional[PlanStatus] = Query(None, alias="status", description="Filtrar por status"),
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(25, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Listar planos de contratação com filtros e paginação
    """
    # Query base
    query = db.query(Plan)
    
    # Filtro de busca
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Plan.identifier.ilike(search_pattern),
                Plan.object.ilike(search_pattern)
            )
        )
    
    # Filtro de status
    if status_filter:
        query = query.filter(Plan.status == status_filter)
    
    # Contar total
    total = query.count()
    
    # Paginação
    offset = (page - 1) * limit
    plans = query.order_by(Plan.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": limit,
        "plans": plans
    }


@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Obter detalhes de um plano específico
    """
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plano com ID {plan_id} não encontrado"
        )
    
    return plan


@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: int,
    plan_data: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Atualizar um plano existente
    """
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plano com ID {plan_id} não encontrado"
        )
    
    # Atualizar apenas os campos fornecidos
    update_data = plan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Excluir um plano
    """
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plano com ID {plan_id} não encontrado"
        )
    
    db.delete(plan)
    db.commit()
    
    return None

