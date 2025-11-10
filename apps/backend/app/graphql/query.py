from __future__ import annotations

from typing import List, Optional

import strawberry

from app.domain.models import Contract, ContractDetails, DashboardOverview, ETP, Risk
from app.graphql.types import (
    ContractDetailsType,
    ContractType,
    DashboardOverviewType,
    ETPType,
    RiskCategoryBreakdownType,
    RiskType,
)
from app.services.unified_data import service


def _to_contract_type(contract: Contract) -> ContractType:
    return ContractType(
        id=contract.id,
        numero_contrato=contract.numero_contrato,
        objeto=contract.objeto,
        modalidade=contract.modalidade,
        orgao=contract.orgao,
        valor_total=contract.valor_total,
        status=contract.status,
        fornecedor=contract.fornecedor,
        data_assinatura=contract.data_assinatura,
        vigencia_inicio=contract.vigencia_inicio,
        vigencia_fim=contract.vigencia_fim,
        fiscal_responsavel=contract.fiscal_responsavel,
    )


def _to_etp_type(etp: ETP) -> ETPType:
    return ETPType(
        id=etp.id,
        contract_id=etp.contract_id,
        titulo=etp.titulo,
        status=etp.status,
        responsavel=etp.responsavel,
        fase_atual=etp.fase_atual,
        criado_em=etp.criado_em,
        atualizado_em=etp.atualizado_em,
    )


def _to_risk_type(risk: Risk) -> RiskType:
    return RiskType(
        id=risk.id,
        contract_id=risk.contract_id,
        categoria=risk.categoria,
        descricao=risk.descricao,
        probabilidade=risk.probabilidade,
        impacto=risk.impacto,
        severidade=risk.severidade,
        mitigacao=risk.mitigacao,
        responsavel=risk.responsavel,
    )


def _to_contract_details_type(details: ContractDetails) -> ContractDetailsType:
    return ContractDetailsType(
        contract=_to_contract_type(details.contract),
        etps=[_to_etp_type(etp) for etp in details.etps],
        risks=[_to_risk_type(risk) for risk in details.risks],
    )


def _to_dashboard_overview_type(overview: DashboardOverview) -> DashboardOverviewType:
    return DashboardOverviewType(
        total_contracts=overview.total_contracts,
        total_etps=overview.total_etps,
        total_risks=overview.total_risks,
        contracts_em_alerta=overview.contracts_em_alerta,
        risks_criticos=overview.risks_criticos,
        risks_by_category=[
            RiskCategoryBreakdownType(
                categoria=item.categoria,
                quantidade=item.quantidade,
            )
            for item in overview.risks_by_category
        ],
    )


@strawberry.type
class Query:
    @strawberry.field
    def contracts(self, skip: int = 0, limit: int = 10) -> List[ContractType]:
        contracts = service.list_contracts(skip=skip, limit=limit)
        return [_to_contract_type(contract) for contract in contracts]

    @strawberry.field
    def contract(self, id: int) -> Optional[ContractType]:
        contract = service.get_contract(contract_id=id)
        if contract is None:
            return None
        return _to_contract_type(contract)

    @strawberry.field
    def etps(self, skip: int = 0, limit: int = 10) -> List[ETPType]:
        etps = service.list_etps(skip=skip, limit=limit)
        return [_to_etp_type(etp) for etp in etps]

    @strawberry.field
    def etp(self, id: int) -> Optional[ETPType]:
        etp = service.get_etp(etp_id=id)
        if etp is None:
            return None
        return _to_etp_type(etp)

    @strawberry.field
    def risks(self, skip: int = 0, limit: int = 10) -> List[RiskType]:
        risks = service.list_risks(skip=skip, limit=limit)
        return [_to_risk_type(risk) for risk in risks]

    @strawberry.field
    def risk(self, id: int) -> Optional[RiskType]:
        risk = service.get_risk(risk_id=id)
        if risk is None:
            return None
        return _to_risk_type(risk)

    @strawberry.field
    def contract_details(self, id: int) -> Optional[ContractDetailsType]:
        details = service.get_contract_details(contract_id=id)
        if details is None:
            return None
        return _to_contract_details_type(details)

    @strawberry.field
    def dashboard_overview(self) -> DashboardOverviewType:
        overview = service.dashboard_overview()
        return _to_dashboard_overview_type(overview)
