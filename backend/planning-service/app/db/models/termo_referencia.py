"""
Modelo de dados para Termo de Referência (TR)
Conforme Lei 14.133/2021, Art. 6º, inciso XXIII e orientações do TCU
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class TRStatus(str, enum.Enum):
    """Status possíveis para um TR"""
    RASCUNHO = "rascunho"
    EM_REVISAO = "em_revisao"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"
    PUBLICADO = "publicado"


class TermoReferencia(Base):
    """
    Modelo para Termo de Referência (TR)
    
    Implementa todos os 10 elementos obrigatórios
    conforme Lei 14.133/2021, Art. 6º, inciso XXIII e orientações do TCU.
    """
    __tablename__ = "termos_referencia"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relacionamentos
    etp_id = Column(Integer, nullable=False, index=True)  # Relacionamento com ETP
    plan_id = Column(Integer, nullable=False, index=True)  # Relacionamento com Plano
    
    # ========================================
    # ELEMENTOS OBRIGATÓRIOS (Lei 14.133/2021, Art. 6º, XXIII)
    # ========================================
    
    # 1. Definição do objeto
    # Incluídos sua natureza, os quantitativos, o prazo do contrato
    definicao_objeto = Column(JSON, nullable=False)
    # Estrutura: {
    #   "natureza": str,
    #   "descricao_detalhada": str,
    #   "quantitativos": [
    #     {
    #       "item": str,
    #       "quantidade": float,
    #       "unidade": str,
    #       "especificacao": str
    #     }
    #   ],
    #   "prazo_contrato": {
    #     "duracao": int,
    #     "unidade": str,  # "dias" | "meses" | "anos"
    #     "data_inicio_prevista": str (opcional),
    #     "data_fim_prevista": str (opcional)
    #   },
    #   "prorrogacao": {
    #     "permitida": bool,
    #     "condicoes": str (opcional),
    #     "prazo_maximo": int (opcional)
    #   }
    # }
    
    # 2. Fundamentação da contratação
    # Referência aos estudos técnicos preliminares correspondentes
    fundamentacao = Column(JSON, nullable=False)
    # Estrutura: {
    #   "referencia_etp": str,  # ID do ETP
    #   "extrato_etp": str,  # Extrato das partes não sigilosas
    #   "informacoes_sigilosas": bool,
    #   "justificativa_sigilo": str (opcional)
    # }
    
    # 3. Descrição da solução como um todo
    # Considerado todo o ciclo de vida do objeto
    descricao_solucao = Column(JSON, nullable=False)
    # Estrutura: {
    #   "descricao_completa": str,
    #   "ciclo_vida": {
    #     "implantacao": str,
    #     "operacao": str,
    #     "manutencao": str,
    #     "descontinuacao": str
    #   },
    #   "integracao_sistemas": str (opcional),
    #   "requisitos_tecnicos": [str]
    # }
    
    # 4. Requisitos da contratação
    requisitos_contratacao = Column(JSON, nullable=False)
    # Estrutura: [
    #   {
    #     "categoria": str,  # "funcional" | "tecnico" | "legal" | "qualidade" | "seguranca" | "outro"
    #     "descricao": str,
    #     "obrigatorio": bool,
    #     "criterio_aceitacao": str
    #   }
    # ]
    
    # 5. Modelo de execução do objeto
    # Definição de como o contrato deverá produzir os resultados pretendidos
    modelo_execucao = Column(JSON, nullable=False)
    # Estrutura: {
    #   "metodologia": str,
    #   "etapas": [
    #     {
    #       "numero": int,
    #       "nome": str,
    #       "descricao": str,
    #       "prazo": int,
    #       "entregaveis": [str],
    #       "criterios_aceitacao": [str]
    #     }
    #   ],
    #   "local_execucao": str,
    #   "horario_execucao": str (opcional),
    #   "recursos_necessarios": [str]
    # }
    
    # 6. Modelo de gestão do contrato
    # Descreve como a execução do objeto será acompanhada e fiscalizada
    modelo_gestao = Column(JSON, nullable=False)
    # Estrutura: {
    #   "equipe_fiscalizacao": [
    #     {
    #       "papel": str,  # "gestor" | "fiscal_tecnico" | "fiscal_administrativo" | "fiscal_requisitante"
    #       "nome": str (opcional),
    #       "matricula": str (opcional),
    #       "responsabilidades": [str]
    #     }
    #   ],
    #   "instrumentos_controle": [str],
    #   "periodicidade_fiscalizacao": str,
    #   "relatorios_exigidos": [
    #     {
    #       "tipo": str,
    #       "periodicidade": str,
    #       "conteudo": str
    #     }
    #   ],
    #   "penalidades": [
    #     {
    #       "tipo": str,
    #       "descricao": str,
    #       "valor_percentual": float (opcional)
    #     }
    #   ]
    # }
    
    # 7. Critérios de medição e de pagamento
    medicao_pagamento = Column(JSON, nullable=False)
    # Estrutura: {
    #   "forma_medicao": str,  # "mensal" | "por_etapa" | "por_entrega" | "outra"
    #   "descricao_medicao": str,
    #   "criterios_medicao": [str],
    #   "forma_pagamento": str,
    #   "prazo_pagamento": int,  # dias após medição
    #   "glosa": {
    #     "aplicavel": bool,
    #     "criterios": [str] (opcional)
    #   },
    #   "retencao": {
    #     "aplicavel": bool,
    #     "percentual": float (opcional),
    #     "motivo": str (opcional)
    #   }
    # }
    
    # 8. Forma e critérios de seleção do fornecedor
    selecao_fornecedor = Column(JSON, nullable=False)
    # Estrutura: {
    #   "modalidade": str,  # "pregao" | "concorrencia" | "concurso" | "leilao" | "dialogo_competitivo" | "dispensa" | "inexigibilidade"
    #   "forma": str,  # "eletronica" | "presencial"
    #   "criterio_julgamento": str,  # "menor_preco" | "maior_desconto" | "tecnica_preco" | "maior_lance" | "maior_retorno_economico"
    #   "justificativa_criterio": str,
    #   "exigencias_habilitacao": {
    #     "juridica": [str],
    #     "fiscal": [str],
    #     "economico_financeira": [str],
    #     "tecnica": [str],
    #     "qualificacao_tecnica": [str]
    #   },
    #   "exigencias_proposta": [str],
    #   "criterios_desempate": [str]
    # }
    
    # 9. Estimativas do valor da contratação
    # Acompanhadas dos preços unitários referenciais
    estimativas_valor = Column(JSON, nullable=False)
    # Estrutura: {
    #   "valor_total_estimado": float,
    #   "valor_anual_estimado": float (opcional),
    #   "itens": [
    #     {
    #       "item": str,
    #       "quantidade": float,
    #       "preco_unitario": float,
    #       "preco_total": float,
    #       "fonte_preco": str
    #     }
    #   ],
    #   "memoria_calculo": str,
    #   "parametros_obtencao": str,
    #   "documentos_suporte": [str],
    #   "sigilo": bool,
    #   "justificativa_sigilo": str (opcional),
    #   "momento_divulgacao": str (opcional)
    # }
    
    # 10. Adequação orçamentária
    adequacao_orcamentaria = Column(JSON, nullable=False)
    # Estrutura: {
    #   "fonte_recursos": str,
    #   "programa_trabalho": str,
    #   "natureza_despesa": str,
    #   "nota_empenho": str (opcional),
    #   "valor_disponivel": float,
    #   "exercicio": int,
    #   "plurianual": bool,
    #   "previsao_exercicios_futuros": [
    #     {
    #       "exercicio": int,
    #       "valor": float
    #     }
    #   ] (opcional)
    # }
    
    # ========================================
    # METADADOS E CONTROLE
    # ========================================
    
    status = Column(String(50), nullable=False, default="rascunho", index=True)
    versao = Column(Integer, nullable=False, default=1)
    
    # Controle de usuários
    created_by = Column(Integer, nullable=False, index=True)
    approved_by = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # ========================================
    # CONTROLE DE IA
    # ========================================
    
    # Lista de campos que foram gerados ou auxiliados por IA
    ai_assisted_fields = Column(JSON, nullable=True, default=list)
    
    # Score de confiança da IA para cada campo gerado
    ai_confidence_scores = Column(JSON, nullable=True, default=dict)
    
    # ========================================
    # TEMPLATE INSTITUCIONAL
    # ========================================
    
    # Template institucional aplicado ao gerar documento
    template_id = Column(Integer, nullable=True)
    template_version = Column(String(50), nullable=True)
    
    def __repr__(self):
        return f"<TR(id={self.id}, etp_id={self.etp_id}, plan_id={self.plan_id}, status={self.status}, versao={self.versao})>"


# Alias para manter consistência com nomenclatura do código
DocumentoTR = TermoReferencia

