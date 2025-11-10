from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from app.domain.models import (
    Contract,
    ContractDetails,
    DashboardOverview,
    ETP,
    Risk,
    RiskCategoryBreakdown,
)


class UnifiedDataService:
    """Provides an in-memory dataset that emulates aggregated data from Planeja.AI
    and Fiscalize.AI.

    The service was designed to be easily replaceable by real integrations with the
    microservices responsible for planning (ETP/TR) and fiscalization (risks and
    contracts). For now it keeps curated demo data so the GraphQL gateway can be
    exercised during local development and automated tests without external
    dependencies.
    """

    def __init__(self) -> None:
        self._contracts: List[Contract] = self._build_contracts()
        self._etps: List[ETP] = self._build_etps()
        self._risks: List[Risk] = self._build_risks()

    # ---------------------------------------------------------------------
    # Builders
    # ---------------------------------------------------------------------
    def _build_contracts(self) -> List[Contract]:
        return [
            Contract(
                id=1,
                numero_contrato="2025-001",
                objeto="Implementação da Plataforma Planeja.AI",
                modalidade="Pregão Eletrônico",
                orgao="Ministério da Gestão e Inovação",
                valor_total=1_200_000.0,
                status="em_execucao",
                fornecedor="Nexora Tecnologia",
                data_assinatura=date(2025, 2, 10),
                vigencia_inicio=date(2025, 3, 1),
                vigencia_fim=date(2026, 2, 28),
                fiscal_responsavel="Maria Silva",
            ),
            Contract(
                id=2,
                numero_contrato="2025-014",
                objeto="Serviços de Fiscalização Automatizada",
                modalidade="Concorrência",
                orgao="Controladoria-Geral da União",
                valor_total=950_000.0,
                status="em_alerta",
                fornecedor="VisionGov",
                data_assinatura=date(2025, 1, 18),
                vigencia_inicio=date(2025, 2, 1),
                vigencia_fim=date(2025, 12, 31),
                fiscal_responsavel="João Rocha",
            ),
            Contract(
                id=3,
                numero_contrato="2024-087",
                objeto="Atualização do DataHub ComprasGov",
                modalidade="Dispensa",
                orgao="Secretaria Especial de Compras",
                valor_total=640_500.0,
                status="concluido",
                fornecedor="DataBridge",
                data_assinatura=date(2024, 9, 25),
                vigencia_inicio=date(2024, 10, 1),
                vigencia_fim=date(2025, 3, 30),
                fiscal_responsavel="Ana Monteiro",
            ),
        ]

    def _build_etps(self) -> List[ETP]:
        return [
            ETP(
                id=101,
                contract_id=1,
                titulo="ETP - Plataforma Planeja.AI",
                status="aprovado",
                responsavel="Carlos Alberto",
                fase_atual="implantacao",
                criado_em=datetime(2025, 1, 5, 14, 30),
                atualizado_em=datetime(2025, 2, 12, 16, 45),
            ),
            ETP(
                id=102,
                contract_id=2,
                titulo="ETP - Fiscalização Automatizada",
                status="em_analise",
                responsavel="Fernanda Lopes",
                fase_atual="cotacao",
                criado_em=datetime(2025, 1, 22, 10, 15),
                atualizado_em=datetime(2025, 2, 20, 9, 0),
            ),
            ETP(
                id=103,
                contract_id=2,
                titulo="ETP - Dashboard Unificado",
                status="rascunho",
                responsavel="Pedro Ramos",
                fase_atual="planejamento",
                criado_em=datetime(2025, 3, 2, 11, 20),
                atualizado_em=datetime(2025, 3, 12, 8, 55),
            ),
        ]

    def _build_risks(self) -> List[Risk]:
        return [
            Risk(
                id=1001,
                contract_id=1,
                categoria="Cronograma",
                descricao="Entrega do módulo de IA pode atrasar devido à dependência de integrações externas.",
                probabilidade="média",
                impacto="alto",
                severidade="alto",
                mitigacao="Reforçar squad de integração e estabelecer checkpoints quinzenais.",
                responsavel="Maria Silva",
            ),
            Risk(
                id=1002,
                contract_id=2,
                categoria="Financeiro",
                descricao="Oscilação cambial pode elevar custos do serviço de reconhecimento de imagem.",
                probabilidade="alta",
                impacto="alto",
                severidade="crítico",
                mitigacao="Negociar cláusula de reajuste e provisionar 10% do orçamento.",
                responsavel="João Rocha",
            ),
            Risk(
                id=1003,
                contract_id=2,
                categoria="Conformidade",
                descricao="Atualização da LGPD exige ajustes imediatos nos fluxos de tratamento de dados.",
                probabilidade="alta",
                impacto="médio",
                severidade="moderado",
                mitigacao="Implementar revisão jurídica mensal e reforçar logs de auditoria.",
                responsavel="Equipe de Compliance",
            ),
            Risk(
                id=1004,
                contract_id=3,
                categoria="Operacional",
                descricao="Equipe reduzida durante migração do DataHub pode causar indisponibilidade.",
                probabilidade="baixa",
                impacto="alto",
                severidade="moderado",
                mitigacao="Planejar janela de migração assistida e plano de rollback.",
                responsavel="Ana Monteiro",
            ),
        ]

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------
    def list_contracts(self, skip: int = 0, limit: int = 10) -> List[Contract]:
        return self._contracts[skip : skip + limit]

    def get_contract(self, contract_id: int) -> Optional[Contract]:
        return next((c for c in self._contracts if c.id == contract_id), None)

    def list_etps(self, skip: int = 0, limit: int = 10) -> List[ETP]:
        return self._etps[skip : skip + limit]

    def get_etp(self, etp_id: int) -> Optional[ETP]:
        return next((etp for etp in self._etps if etp.id == etp_id), None)

    def list_risks(self, skip: int = 0, limit: int = 10) -> List[Risk]:
        return self._risks[skip : skip + limit]

    def get_risk(self, risk_id: int) -> Optional[Risk]:
        return next((risk for risk in self._risks if risk.id == risk_id), None)

    def get_contract_details(self, contract_id: int) -> Optional[ContractDetails]:
        contract = self.get_contract(contract_id)
        if contract is None:
            return None

        etps = [etp for etp in self._etps if etp.contract_id == contract_id]
        risks = [risk for risk in self._risks if risk.contract_id == contract_id]
        return ContractDetails(contract=contract, etps=etps, risks=risks)

    def dashboard_overview(self) -> DashboardOverview:
        contracts_em_alerta = sum(1 for c in self._contracts if c.status in {"em_alerta", "atrasado"})
        risks_criticos = sum(1 for r in self._risks if r.severidade.lower() == "crítico")

        risks_by_category: List[RiskCategoryBreakdown] = []
        category_counter: dict[str, int] = {}
        for risk in self._risks:
            category_counter[risk.categoria] = category_counter.get(risk.categoria, 0) + 1

        for categoria, quantidade in category_counter.items():
            risks_by_category.append(RiskCategoryBreakdown(categoria=categoria, quantidade=quantidade))

        return DashboardOverview(
            total_contracts=len(self._contracts),
            total_etps=len(self._etps),
            total_risks=len(self._risks),
            contracts_em_alerta=contracts_em_alerta,
            risks_criticos=risks_criticos,
            risks_by_category=risks_by_category,
        )


service = UnifiedDataService()
