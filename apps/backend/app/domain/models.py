from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import List


@dataclass(slots=True)
class Contract:
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


@dataclass(slots=True)
class ETP:
    id: int
    contract_id: int
    titulo: str
    status: str
    responsavel: str
    fase_atual: str
    criado_em: datetime
    atualizado_em: datetime


@dataclass(slots=True)
class Risk:
    id: int
    contract_id: int
    categoria: str
    descricao: str
    probabilidade: str
    impacto: str
    severidade: str
    mitigacao: str
    responsavel: str


@dataclass(slots=True)
class RiskCategoryBreakdown:
    categoria: str
    quantidade: int


@dataclass(slots=True)
class DashboardOverview:
    total_contracts: int
    total_etps: int
    total_risks: int
    contracts_em_alerta: int
    risks_criticos: int
    risks_by_category: List[RiskCategoryBreakdown]


@dataclass(slots=True)
class ContractDetails:
    contract: Contract
    etps: List[ETP]
    risks: List[Risk]
