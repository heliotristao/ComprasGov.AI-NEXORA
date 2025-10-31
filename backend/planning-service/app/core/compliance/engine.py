from decimal import Decimal
from typing import Dict, Any
from app.db.models.etp import ETP
from app.schemas.compliance import ComplianceReport, ComplianceItem

class ComplianceEngine:
    def validate_etp(self, etp: ETP) -> ComplianceReport:
        report = ComplianceReport()
        etp_data = etp.data or {}

        # Rule 1: Conditional Requirement
        if etp_data.get("tipo_contratacao") == "TIC" and not etp_data.get(
            "vinculacao_plano_tic"
        ):
            report.errors.append(
                ComplianceItem(
                    field="vinculacao_plano_tic",
                    message="O campo 'Vínculação ao Plano de TIC' é obrigatório para contratações de TIC.",
                )
            )

        # Rule 2: Cross-Validation
        valor_total_estimado_str = etp_data.get("valor_total_estimado")
        if valor_total_estimado_str:
            try:
                valor_total_estimado = Decimal(valor_total_estimado_str)
                soma_itens = sum(
                    Decimal(item.get("valor_unitario", 0))
                    * Decimal(item.get("quantidade", 0))
                    for item in etp_data.get("itens", [])
                )
                if valor_total_estimado != soma_itens:
                    report.errors.append(
                        ComplianceItem(
                            field="valor_total_estimado",
                            message=f"O valor total estimado (R$ {valor_total_estimado}) não corresponde à soma dos valores dos itens (R$ {soma_itens}).",
                        )
                    )
            except (ValueError, TypeError):
                report.errors.append(
                    ComplianceItem(
                        field="valor_total_estimado",
                        message="O valor total estimado não é um número válido.",
                    )
                )

        # Rule 3: Quality Suggestion
        justificativa = etp_data.get("justificativa_contratacao", "")
        if len(justificativa) < 200:
            report.warnings.append(
                ComplianceItem(
                    field="justificativa_contratacao",
                    message="A justificativa da contratação tem menos de 200 caracteres. Considere fornecer uma descrição mais detalhada.",
                )
            )

        return report

compliance_engine = ComplianceEngine()
