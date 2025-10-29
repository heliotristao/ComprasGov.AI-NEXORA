from app.utils.checklist_loader import get_checklist


def run_etp_validation(etp_data: dict) -> list[dict]:
    """
    Executes the validation checklist against the ETP data.
    """
    checklist = get_checklist()
    results = []

    for rule in checklist:
        rule_code = rule["rule_code"]
        passed = True
        suggestion = None

        if rule_code == "REQUIRED_FIELD_DESCRICAO_NECESSIDADE":
            if not etp_data.get("descricao_necessidade"):
                passed = False
                suggestion = "O campo 'Descrição da Necessidade' deve ser preenchido."

        elif rule_code == "MIN_LENGTH_DESCRICAO_NECESSIDADE":
            if len(etp_data.get("descricao_necessidade", "")) < 50:
                passed = False
                suggestion = "Forneça mais detalhes na descrição da necessidade para garantir a clareza."

        elif rule_code == "REQUIRED_FIELD_DESCRICAO_SOLUCAO":
            if not etp_data.get("descricao_solucao"):
                passed = False
                suggestion = "O campo 'Descrição da Solução' é obrigatório e deve detalhar a solução proposta."

        elif rule_code == "MIN_LENGTH_DESCRICAO_SOLUCAO":
            if len(etp_data.get("descricao_solucao", "")) < 100:
                passed = False
                suggestion = "A descrição da solução deve ser mais detalhada, com pelo menos 100 caracteres."

        elif rule_code == "INFO_PRAZO_ENTREGA":
            # This is an informational check, so it always passes but provides a suggestion.
            passed = True
            suggestion = "Considere o cronograma de entrega e verifique se ele é compatível com as necessidades do projeto."


        results.append(
            {
                "rule_code": rule["rule_code"],
                "description": rule["description"],
                "severity": rule["severity"],
                "passed": passed,
                "suggestion": suggestion,
            }
        )

    return results
