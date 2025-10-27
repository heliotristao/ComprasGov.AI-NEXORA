from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

from app.models.plan import PlanStatus


class PlanBase(BaseModel):
    """Schema base para planos"""
    identifier: str = Field(..., max_length=100, description="Identificador único do plano")
    object: str = Field(..., description="Objeto da contratação")
    justification: Optional[str] = Field(None, description="Justificativa da contratação")
    status: PlanStatus = Field(default=PlanStatus.DRAFT, description="Status do plano")
    estimated_value: Optional[Decimal] = Field(None, description="Valor estimado da contratação")
    responsible_department: Optional[str] = Field(None, max_length=255, description="Departamento responsável")
    ai_generated: bool = Field(default=False, description="Se foi gerado por IA")


class PlanCreate(PlanBase):
    """Schema para criação de plano"""
    pass


class PlanUpdate(BaseModel):
    """Schema para atualização de plano"""
    object: Optional[str] = None
    justification: Optional[str] = None
    status: Optional[PlanStatus] = None
    estimated_value: Optional[Decimal] = None
    responsible_department: Optional[str] = None


class PlanInDB(PlanBase):
    """Schema para plano no banco de dados"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime


class PlanResponse(PlanInDB):
    """Schema para resposta de plano"""
    pass


class PlanListResponse(BaseModel):
    """Schema para lista de planos com paginação"""
    total: int
    page: int
    page_size: int
    plans: list[PlanResponse]


class DashboardSummaryResponse(BaseModel):
    """Schema para resumo do dashboard"""
    plans_in_progress: int = Field(..., description="Planos em elaboração")
    open_tenders: int = Field(default=0, description="Licitações abertas")
    active_contracts: int = Field(default=0, description="Contratos ativos")
    total_estimated_value: Optional[Decimal] = Field(None, description="Valor total estimado")
    economy_generated: Optional[Decimal] = Field(None, description="Economia gerada")

