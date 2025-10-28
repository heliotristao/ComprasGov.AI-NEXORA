"""
Modelo de dados para Estudo Técnico Preliminar (ETP)
Conforme Lei 14.133/2021, Art. 18, §1º e orientações do TCU
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class ETPStatus(str, enum.Enum):
    """Status possíveis para um ETP"""
    RASCUNHO = "rascunho"
    EM_REVISAO = "em_revisao"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"


class EstudoTecnicoPreliminar(Base):
    """
    Modelo para Estudo Técnico Preliminar (ETP)
    
    Implementa todos os requisitos obrigatórios e opcionais
    conforme Lei 14.133/2021 e orientações do TCU.
    """
    __tablename__ = "estudos_tecnicos_preliminares"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relacionamento com Plano de Contratação
    plan_id = Column(Integer, nullable=False, index=True)
    
    # ========================================
    # CAMPOS OBRIGATÓRIOS (Lei 14.133/2021)
    # ========================================
    
    # I - Descrição da necessidade da contratação
    # Considerado o problema a ser resolvido sob a perspectiva do interesse público
    descricao_necessidade = Column(JSON, nullable=False)
    # Estrutura: {
    #   "problema": str,
    #   "interesse_publico": str,
    #   "contexto": str
    # }
    
    # IV - Estimativas das quantidades para a contratação
    # Acompanhadas das memórias de cálculo e dos documentos que lhes dão suporte
    estimativas_quantidades = Column(JSON, nullable=False)
    # Estrutura: {
    #   "quantitativos": [
    #     {
    #       "item": str,
    #       "quantidade": float,
    #       "unidade": str,
    #       "justificativa": str
    #     }
    #   ],
    #   "memoria_calculo": str,
    #   "documentos_suporte": [str],  # URLs de arquivos
    #   "interdependencias": str,
    #   "economia_escala": str
    # }
    
    # VI - Estimativa do valor da contratação
    # Acompanhada dos preços unitários referenciais, das memórias de cálculo
    estimativa_valor = Column(JSON, nullable=False)
    # Estrutura: {
    #   "valor_total": float,
    #   "precos_unitarios": [
    #     {
    #       "item": str,
    #       "preco_unitario": float,
    #       "fonte": str
    #     }
    #   ],
    #   "memoria_calculo": str,
    #   "documentos_suporte": [str],
    #   "parametros_obtencao": str,
    #   "sigilo": bool,
    #   "justificativa_sigilo": str (opcional),
    #   "momento_divulgacao": str (opcional)
    # }
    
    # VIII - Justificativas para o parcelamento ou não da contratação
    justificativa_parcelamento = Column(JSON, nullable=False)
    # Estrutura: {
    #   "parcelado": bool,
    #   "justificativa": str
    # }
    
    # XIII - Posicionamento conclusivo sobre a adequação da contratação
    posicionamento_conclusivo = Column(JSON, nullable=False)
    # Estrutura: {
    #   "adequacao": str,  # "adequado" | "inadequado" | "adequado_com_ressalvas"
    #   "justificativa": str,
    #   "recomendacoes": str (opcional)
    # }
    
    # ========================================
    # CAMPOS NÃO-OBRIGATÓRIOS (mas recomendados)
    # ========================================
    
    # II - Demonstração da previsão da contratação no plano de contratações anual
    previsao_plano_anual = Column(JSON, nullable=True)
    # Estrutura: {
    #   "previsto": bool,
    #   "ano": int,
    #   "alinhamento_planejamento": str
    # }
    
    # III - Requisitos da contratação
    requisitos_contratacao = Column(JSON, nullable=True)
    # Estrutura: [
    #   {
    #     "tipo": str,  # "funcional" | "tecnico" | "legal" | "outro"
    #     "descricao": str,
    #     "obrigatorio": bool
    #   }
    # ]
    
    # V - Levantamento de mercado
    levantamento_mercado = Column(JSON, nullable=True)
    # Estrutura: {
    #   "alternativas_analisadas": [
    #     {
    #       "descricao": str,
    #       "vantagens": str,
    #       "desvantagens": str,
    #       "viabilidade_tecnica": str,
    #       "viabilidade_economica": str
    #     }
    #   ],
    #   "alternativa_escolhida": str,
    #   "justificativa_escolha": str
    # }
    
    # VII - Descrição da solução como um todo
    descricao_solucao = Column(JSON, nullable=True)
    # Estrutura: {
    #   "descricao_completa": str,
    #   "manutencao": str,
    #   "assistencia_tecnica": str,
    #   "ciclo_vida": str
    # }
    
    # IX - Demonstrativo dos resultados pretendidos
    resultados_pretendidos = Column(JSON, nullable=True)
    # Estrutura: {
    #   "economicidade": str,
    #   "aproveitamento_recursos": str,
    #   "beneficios_esperados": [str]
    # }
    
    # X - Providências a serem adotadas previamente
    providencias_previas = Column(JSON, nullable=True)
    # Estrutura: {
    #   "capacitacao_servidores": str,
    #   "outras_providencias": [str]
    # }
    
    # XI - Contratações correlatas e/ou interdependentes
    contratacoes_correlatas = Column(JSON, nullable=True)
    # Estrutura: [
    #   {
    #     "descricao": str,
    #     "tipo": str,  # "correlata" | "interdependente"
    #     "impacto": str
    #   }
    # ]
    
    # XII - Descrição de possíveis impactos ambientais
    impactos_ambientais = Column(JSON, nullable=True)
    # Estrutura: {
    #   "descricao_impactos": str,
    #   "medidas_mitigadoras": [str],
    #   "requisitos_sustentabilidade": str,
    #   "logistica_reversa": str
    # }
    
    # Decisões que devem ser motivadas (quando aplicáveis)
    decisoes_motivadas = Column(JSON, nullable=True)
    # Estrutura: {
    #   "criterio_tecnica_preco": {
    #     "aplicavel": bool,
    #     "justificativa": str (opcional)
    #   },
    #   "recursos_locais": {
    #     "aplicavel": bool,
    #     "justificativa": str (opcional)
    #   },
    #   "compra_ou_locacao": {
    #     "opcao": str,  # "compra" | "locacao"
    #     "justificativa": str
    #   },
    #   "manutencao_assistencia": {
    #     "aplicavel": bool,
    #     "justificativa": str (opcional)
    #   },
    #   "dispensa_projetos": {
    #     "aplicavel": bool,
    #     "justificativa": str (opcional)
    #   }
    # }
    
    # ========================================
    # METADADOS E CONTROLE
    # ========================================
    
    status = Column(String(50), nullable=False, default="rascunho", index=True)
    
    # Controle de usuários
    created_by = Column(Integer, nullable=False, index=True)
    approved_by = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # ========================================
    # CONTROLE DE IA
    # ========================================
    
    # Lista de campos que foram gerados ou auxiliados por IA
    ai_assisted_fields = Column(JSON, nullable=True, default=list)
    # Exemplo: ["descricao_necessidade.problema", "levantamento_mercado.alternativas_analisadas"]
    
    # Score de confiança da IA para cada campo gerado
    ai_confidence_scores = Column(JSON, nullable=True, default=dict)
    # Exemplo: {"descricao_necessidade.problema": 0.85, "levantamento_mercado": 0.78}
    
    def __repr__(self):
        return f"<ETP(id={self.id}, plan_id={self.plan_id}, status={self.status})>"

