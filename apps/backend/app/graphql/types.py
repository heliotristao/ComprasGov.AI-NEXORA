from __future__ import annotations

from datetime import date, datetime
from typing import List

import strawberry


@strawberry.type
class ContractType:
    id: int
    numero_contrato: str
    objeto: str
    modalidade: str
    orgao: str
    valor_total: float
    status: str
    fornecedor: str
    data_assinatura: date
    vigencia_inicio: date
    vigencia_fim: date
    fiscal_responsavel: str


@strawberry.type
class ETPType:
    id: int
    contract_id: int
    titulo: str
    status: str
    responsavel: str
    fase_atual: str
    criado_em: datetime
    atualizado_em: datetime


@strawberry.type
class RiskType:
    id: int
    contract_id: int
    categoria: str
    descricao: str
    probabilidade: str
    impacto: str
    severidade: str
    mitigacao: str
    responsavel: str


@strawberry.type
class RiskCategoryBreakdownType:
    categoria: str
    quantidade: int


@strawberry.type
class DashboardOverviewType:
    total_contracts: int
    total_etps: int
    total_risks: int
    contracts_em_alerta: int
    risks_criticos: int
    risks_by_category: List[RiskCategoryBreakdownType]


@strawberry.type
class ContractDetailsType:
    contract: ContractType
    etps: List[ETPType]
    risks: List[RiskType]
