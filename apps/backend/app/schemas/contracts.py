from __future__ import annotations

from pydantic import BaseModel, Field


class ContractClauseBase(BaseModel):
    tipo: str = Field(..., description="Tipo classificado da cláusula")
    descricao: str = Field(..., description="Descrição completa da cláusula extraída do contrato")


class ContractClauseCreate(ContractClauseBase):
    """Schema utilizado para criação de cláusulas."""


class ContractClauseRead(ContractClauseBase):
    id: int = Field(..., description="Identificador da cláusula no banco de dados")

    model_config = {
        "from_attributes": True,
    }
