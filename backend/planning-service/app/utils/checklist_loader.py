CHECKLIST = [
    {
        "rule_code": "REQUIRED_FIELD_DESCRICAO_NECESSIDADE",
        "description": "O campo 'Descrição da Necessidade' é obrigatório.",
        "severity": "error",
    },
    {
        "rule_code": "MIN_LENGTH_DESCRICAO_NECESSIDADE",
        "description": "O campo 'Descrição da Necessidade' deve ter no mínimo 50 caracteres.",
        "severity": "warning",
    },
    {
        "rule_code": "REQUIRED_FIELD_DESCRICAO_SOLUCAO",
        "description": "O campo 'Descrição da Solução' é obrigatório.",
        "severity": "error",
    },
    {
        "rule_code": "MIN_LENGTH_DESCRICAO_SOLUCAO",
        "description": "O campo 'Descrição da Solução' deve ter no mínimo 100 caracteres.",
        "severity": "warning",
    },
    {
        "rule_code": "INFO_PRAZO_ENTREGA",
        "description": "Verificar se o prazo de entrega é realista.",
        "severity": "info",
    },
]


def get_checklist():
    return CHECKLIST
