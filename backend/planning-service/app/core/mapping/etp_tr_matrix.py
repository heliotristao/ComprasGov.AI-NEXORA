BEM_ETP_TO_TR_MATRIX = {
    "section_1_objeto": {
        "source": "objeto",
        "target": "objeto",
    },
    "section_2_justificativa": {
        "source": "justificativa",
        "target": "justificativa",
    },
    "section_3_valor_estimado": {
        "source": "valor_estimado",
        "target": "valor_estimado",
    },
    "section_4_necessidade": {
        "source": "necessidade_contratacao",
        "target": "fundamentacao.extrato_etp",
    },
    "section_5_solucao": {
        "source": "descricao_solucao",
        "target": "descricao_solucao.descricao_completa",
    },
    "section_6_requisitos": {
        "source": "requisitos_necessarios",
        "target": "requisitos_contratacao",
    },
    "section_7_modelo_prestacao": {
        "source": "modelo_prestacao_servicos",
        "target": "modelo_execucao.metodologia",
    },
    "section_8_estimativa_valor": {
        "source": "estimativa_valor_contratacao",
        "target": "estimativas_valor",
    },
}

SERVICO_ETP_TO_TR_MATRIX = {
    "section_1_necessidade": {
        "source": "necessidade_contratacao",
        "target": "fundamentacao.extrato_etp",
    },
    "section_2_solucao": {
        "source": "descricao_solucao",
        "target": "descricao_solucao.descricao_completa",
    },
    "section_3_requisitos": {
        "source": "requisitos_necessarios",
        "target": "requisitos_contratacao",
    },
    "section_4_modelo_prestacao": {
        "source": "modelo_prestacao_servicos",
        "target": "modelo_execucao.metodologia",
    },
    "section_5_estimativa_valor": {
        "source": "estimativa_valor_contratacao",
        "target": "estimativas_valor",
    },
    "section_6_forma_pagamento": {
        "source": "forma_pagamento",
        "target": "medicao_pagamento.forma_pagamento",
    },
}
