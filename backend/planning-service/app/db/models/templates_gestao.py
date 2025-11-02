"""
Sistema de Gestão de Templates Multi-Tenant
Permite que cada instituição tenha seus próprios modelos baseados em templates superiores
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class TipoTemplate(str, enum.Enum):
    """Tipo de template no sistema"""
    SUPERIOR = "superior"  # TCU, TCE, PGE (gerenciável pelo admin do sistema)
    INSTITUCIONAL = "institucional"  # Customizado por cada cliente


class StatusTemplate(str, enum.Enum):
    """Status do template"""
    ATIVO = "ativo"
    INATIVO = "inativo"
    EM_REVISAO = "em_revisao"
    ARQUIVADO = "arquivado"


# ============================================================================
# TABELA: INSTITUIÇÕES (Multi-Tenant)
# ============================================================================

class Instituicao(Base):
    """
    Representa cada cliente do sistema (multi-tenant)
    """
    __tablename__ = "instituicoes"

    id = Column(Integer, primary_key=True, index=True)

    # Identificação
    nome = Column(String(255), nullable=False)
    sigla = Column(String(50), nullable=True)
    cnpj = Column(String(18), unique=True, nullable=False, index=True)

    # Tipo de instituição
    tipo = Column(String(50), nullable=False)  # "prefeitura", "estado", "autarquia", "empresa_publica"

    # Localização
    uf = Column(String(2), nullable=False)
    municipio = Column(String(100), nullable=True)

    # Configurações
    ativo = Column(Boolean, default=True, nullable=False)
    logo_url = Column(String(500), nullable=True)

    # Órgão de controle que fiscaliza esta instituição
    orgao_controle = Column(String(50), nullable=True)  # "TCU", "TCE-ES", "TCE-RJ"

    # Plano/assinatura
    plano = Column(String(50), default="basico", nullable=False)  # "basico", "profissional", "enterprise"
    data_assinatura = Column(DateTime(timezone=True), nullable=True)
    data_expiracao = Column(DateTime(timezone=True), nullable=True)

    # Metadados
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Instituicao(id={self.id}, nome={self.nome}, cnpj={self.cnpj})>"


# ============================================================================
# TABELA: MODELOS SUPERIORES (TCU, TCE, PGE)
# ============================================================================

class ModeloSuperior(Base):
    """
    Modelos padrão de órgãos de controle (TCU, TCE, PGE)
    Gerenciados pelo admin do sistema ComprasGov.AI
    """
    __tablename__ = "modelos_superiores"

    id = Column(Integer, primary_key=True, index=True)

    # Identificação
    nome = Column(String(255), nullable=False)  # "Modelo TCU", "Modelo TCE-ES"
    codigo = Column(String(50), unique=True, nullable=False, index=True)  # "TCU", "TCE-ES", "PGE-ES"

    # Tipo de documento
    tipo_documento = Column(String(10), nullable=False, index=True)  # "ETP" ou "TR"

    # Tipo de contratação (pode ser NULL para modelo genérico)
    tipo_contratacao = Column(String(100), nullable=True)  # "obras", "servicos", "ti", "bens"

    # Versão
    versao = Column(String(50), nullable=False)
    versao_anterior_id = Column(Integer, ForeignKey("modelos_superiores.id"), nullable=True)

    # Descrição
    descricao = Column(Text, nullable=True)

    # Status
    ativo = Column(Boolean, default=True, nullable=False)

    # Estrutura do template
    estrutura = Column(JSON, nullable=False)
    # Exemplo:
    # {
    #   "secoes": [
    #     {
    #       "id": "identificacao",
    #       "titulo": "IDENTIFICAÇÃO",
    #       "ordem": 1,
    #       "obrigatoria": true,
    #       "campos": [
    #         {
    #           "id": "unidade_gestora",
    #           "label": "Un. Gestora",
    #           "tipo": "text",
    #           "obrigatorio": true,
    #           "placeholder": "Nome da unidade gestora"
    #         }
    #       ]
    #     }
    #   ]
    # }

    # Mapeamento entre campos da lei e campos do template
    mapeamento_lei = Column(JSON, nullable=False)
    # Exemplo:
    # {
    #   "ETP-I": {
    #     "secao_id": "descricao_necessidade",
    #     "campos": ["problema", "publico_impactado", "impacto", "situacao_atual"],
    #     "prompt_transformacao": "Compile os campos {problema}, {publico_impactado}..."
    #   }
    # }

    # Configuração de documento
    configuracao_documento = Column(JSON, nullable=True)
    # Exemplo:
    # {
    #   "formatacao": {
    #     "fonte": "Arial",
    #     "tamanho": 12,
    #     "espacamento": 1.5,
    #     "margens": {"superior": 3, "inferior": 2, "esquerda": 3, "direita": 2}
    #   },
    #   "cabecalho_padrao": "ESTUDO TÉCNICO PRELIMINAR – ETP",
    #   "rodape_padrao": "Documento gerado pelo sistema ComprasGov.AI - NEXORA"
    # }

    # Notas de versão
    changelog = Column(Text, nullable=True)

    # Metadados
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ModeloSuperior(id={self.id}, codigo={self.codigo}, versao={self.versao})>"


# ============================================================================
# TABELA: MODELOS INSTITUCIONAIS (Customizados por Cliente)
# ============================================================================

class ModeloInstitucional(Base):
    """
    Modelos customizados por cada instituição cliente
    Baseados em um modelo superior (TCU, TCE, PGE)
    """
    __tablename__ = "modelos_institucionais"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    instituicao_id = Column(Integer, ForeignKey("instituicoes.id"), nullable=False, index=True)
    modelo_superior_id = Column(Integer, ForeignKey("modelos_superiores.id"), nullable=True)

    # Identificação
    nome = Column(String(255), nullable=False)  # "ETP Obras - Prefeitura XYZ"
    descricao = Column(Text, nullable=True)

    # Tipo de documento
    tipo_documento = Column(String(10), nullable=False, index=True)  # "ETP" ou "TR"

    # Tipo de contratação
    tipo_contratacao = Column(String(100), nullable=True)

    # Versão
    versao = Column(String(50), nullable=False)
    versao_anterior_id = Column(Integer, ForeignKey("modelos_institucionais.id"), nullable=True)

    # Status
    status = Column(String(50), default="ativo", nullable=False, index=True)

    # Estrutura customizada (herda do modelo superior e adiciona customizações)
    estrutura = Column(JSON, nullable=False)
    # Mesma estrutura do ModeloSuperior, mas com customizações da instituição

    # Mapeamento customizado
    mapeamento_lei = Column(JSON, nullable=False)

    # Configuração de documento customizada
    configuracao_documento = Column(JSON, nullable=False)
    # Exemplo:
    # {
    #   "cabecalho": {
    #     "logo_url": "https://instituicao.com/logo.png",
    #     "texto": "PREFEITURA MUNICIPAL DE VITÓRIA\nESTUDO TÉCNICO PRELIMINAR",
    #     "alinhamento": "center"
    #   },
    #   "formatacao": {
    #     "fonte": "Times New Roman",
    #     "tamanho": 11,
    #     "espacamento": 1.5
    #   },
    #   "rodape": {
    #     "texto": "Documento gerado em {data}",
    #     "numeracao_pagina": true
    #   }
    # }

    # Prompts de IA customizados
    prompts_ia = Column(JSON, nullable=True)
    # Exemplo:
    # {
    #   "descricao_necessidade": "Você é um especialista em contratações públicas da área de saúde...",
    #   "levantamento_mercado": "Analise as alternativas considerando especificidades da área médica..."
    # }

    # Estatísticas de uso
    total_documentos_gerados = Column(Integer, default=0, nullable=False)
    ultima_utilizacao = Column(DateTime(timezone=True), nullable=True)

    # Metadados
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ModeloInstitucional(id={self.id}, nome={self.nome}, instituicao_id={self.instituicao_id})>"


# ============================================================================
# TABELA: HISTÓRICO DE VERSÕES DE TEMPLATES
# ============================================================================

class VersaoTemplate(Base):
    """
    Mantém histórico de todas as versões de templates
    """
    __tablename__ = "versoes_templates"

    id = Column(Integer, primary_key=True, index=True)

    # Tipo de template
    tipo_template = Column(String(50), nullable=False)  # "superior" ou "institucional"

    # ID do template
    template_id = Column(Integer, nullable=False, index=True)

    # Versão
    versao = Column(String(50), nullable=False)

    # Snapshot completo do template nesta versão
    snapshot = Column(JSON, nullable=False)

    # Changelog
    changelog = Column(Text, nullable=True)

    # Metadados
    criado_por = Column(Integer, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<VersaoTemplate(id={self.id}, tipo={self.tipo_template}, versao={self.versao})>"


# ============================================================================
# TABELA: PERMISSÕES DE GESTÃO DE TEMPLATES
# ============================================================================

class PermissaoTemplate(Base):
    """
    Define quem pode editar quais templates
    """
    __tablename__ = "permissoes_templates"

    id = Column(Integer, primary_key=True, index=True)

    # Usuário
    user_id = Column(Integer, nullable=False, index=True)

    # Instituição (NULL = admin do sistema, pode editar modelos superiores)
    instituicao_id = Column(Integer, ForeignKey("instituicoes.id"), nullable=True, index=True)

    # Permissões
    pode_criar = Column(Boolean, default=False, nullable=False)
    pode_editar = Column(Boolean, default=False, nullable=False)
    pode_excluir = Column(Boolean, default=False, nullable=False)
    pode_publicar = Column(Boolean, default=False, nullable=False)

    # Escopo (se NULL, vale para todos os templates da instituição)
    template_id = Column(Integer, nullable=True)
    tipo_template = Column(String(50), nullable=True)  # "superior" ou "institucional"

    # Metadados
    concedido_por = Column(Integer, nullable=False)
    concedido_em = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PermissaoTemplate(id={self.id}, user_id={self.user_id}, instituicao_id={self.instituicao_id})>"
