"""
Modelo de dados MODULAR para Estudo Técnico Preliminar (ETP)
Arquitetura: Lei 14.133/2021 + Templates Institucionais Customizáveis
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class TipoDocumento(str, enum.Enum):
    """Tipo de documento"""
    ETP = "ETP"
    TR = "TR"


class StatusDocumento(str, enum.Enum):
    """Status do documento"""
    RASCUNHO = "rascunho"
    EM_REVISAO = "em_revisao"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"
    PUBLICADO = "publicado"


# ============================================================================
# TABELA 1: CAMPOS OBRIGATÓRIOS DA LEI (Núcleo Imutável)
# ============================================================================

class CampoObrigatorioLei(Base):
    """
    Define os campos mínimos obrigatórios pela Lei 14.133/2021
    Estes campos são imutáveis e servem como base de validação
    """
    __tablename__ = "campos_obrigatorios_lei"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Código único do campo (ex: "ETP-I", "ETP-IV", "TR-1")
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    
    # Nome do campo
    nome = Column(String(255), nullable=False)
    
    # Descrição detalhada do que deve conter
    descricao = Column(Text, nullable=False)
    
    # Tipo de documento (ETP ou TR)
    tipo_documento = Column(String(10), nullable=False, index=True)
    
    # Se é obrigatório ou não
    obrigatorio = Column(Boolean, default=True, nullable=False)
    
    # Artigo da lei que estabelece este campo
    artigo_lei = Column(String(100), nullable=True)
    
    # Ordem de apresentação no documento
    ordem = Column(Integer, nullable=False)
    
    # Metadados
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<CampoObrigatorioLei(codigo={self.codigo}, nome={self.nome})>"


# ============================================================================
# TABELA 2: TEMPLATES INSTITUCIONAIS (Customizáveis)
# ============================================================================

class TemplateInstitucional(Base):
    """
    Templates customizados por instituição
    Permite que cada órgão tenha seu próprio modelo de ETP/TR
    """
    __tablename__ = "templates_institucionais"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Instituição dona do template (pode ser NULL para templates padrão)
    instituicao_id = Column(Integer, nullable=True, index=True)
    
    # Nome do template
    nome = Column(String(255), nullable=False)
    
    # Tipo de documento
    tipo_documento = Column(String(10), nullable=False, index=True)
    
    # Tipo de contratação (obras, serviços, TI, etc.)
    tipo_contratacao = Column(String(100), nullable=True, index=True)
    
    # Versão do template
    versao = Column(String(50), nullable=False)
    
    # Se está ativo
    ativo = Column(Boolean, default=True, nullable=False)
    
    # Estrutura do template (seções customizadas)
    estrutura = Column(JSON, nullable=False)
    # Exemplo:
    # {
    #   "secoes": [
    #     {
    #       "id": "secao-1",
    #       "titulo": "IDENTIFICAÇÃO",
    #       "ordem": 1,
    #       "campos": [
    #         {
    #           "id": "unidade_gestora",
    #           "label": "Un. Gestora",
    #           "tipo": "text",
    #           "obrigatorio": true
    #         }
    #       ]
    #     }
    #   ]
    # }
    
    # Mapeamento entre campos da lei e campos do template
    mapeamento_campos = Column(JSON, nullable=False)
    # Exemplo:
    # {
    #   "ETP-I": {
    #     "campo_lei": "Descrição da necessidade",
    #     "secao_template": "secao-2",
    #     "campos_template": ["problema", "publico_impactado", "impacto"],
    #     "prompt_transformacao": "Baseado nos campos: {problema}, {publico_impactado}..."
    #   }
    # }
    
    # Configuração de formatação do documento final
    configuracao_documento = Column(JSON, nullable=True)
    # Exemplo:
    # {
    #   "cabecalho": {
    #     "logo_url": "https://...",
    #     "texto": "ESTUDO TÉCNICO PRELIMINAR – ETP"
    #   },
    #   "formatacao": {
    #     "fonte": "Arial",
    #     "tamanho": 12,
    #     "espacamento": 1.5
    #   }
    # }
    
    # Metadados
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<TemplateInstitucional(id={self.id}, nome={self.nome}, versao={self.versao})>"


# ============================================================================
# TABELA 3: DOCUMENTOS ETP (Dados do Usuário)
# ============================================================================

class DocumentoETP(Base):
    """
    Armazena os dados preenchidos pelo usuário para um ETP
    Estrutura flexível que se adapta ao template escolhido
    """
    __tablename__ = "documentos_etp"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relacionamentos
    plan_id = Column(Integer, nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("templates_institucionais.id"), nullable=False)
    
    # Dados preenchidos pelo usuário (estrutura flexível)
    dados = Column(JSON, nullable=False, default=dict)
    # Exemplo:
    # {
    #   "secao-1": {
    #     "unidade_gestora": "Diretoria de Saúde da PMES",
    #     "responsaveis": [...]
    #   },
    #   "secao-2": {
    #     "problema": "Falta de equipamentos...",
    #     "publico_impactado": "Servidores e pacientes...",
    #     "impacto": "Interrupção dos serviços..."
    #   }
    # }
    
    # Validação de conformidade com a lei
    campos_obrigatorios_preenchidos = Column(JSON, nullable=False, default=dict)
    # Exemplo:
    # {
    #   "ETP-I": true,
    #   "ETP-IV": true,
    #   "ETP-VI": false  // Ainda não preenchido
    # }
    
    # Progresso de preenchimento (0 a 100)
    progresso_percentual = Column(Integer, default=0, nullable=False)
    
    # Status do documento
    status = Column(String(50), default="rascunho", nullable=False, index=True)
    
    # Controle de IA
    campos_gerados_ia = Column(JSON, nullable=True, default=list)
    # Exemplo: ["secao-2.problema", "secao-5.levantamento_mercado"]
    
    scores_confianca_ia = Column(JSON, nullable=True, default=dict)
    # Exemplo: {"secao-2.problema": 0.85, "secao-5.levantamento_mercado": 0.78}
    
    # Metadados
    created_by = Column(Integer, nullable=False, index=True)
    approved_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<DocumentoETP(id={self.id}, plan_id={self.plan_id}, status={self.status})>"


# ============================================================================
# TABELA 4: DOCUMENTOS TR (Dados do Usuário)
# ============================================================================

class DocumentoTR(Base):
    """
    Armazena os dados preenchidos pelo usuário para um TR
    Similar ao ETP, mas com campos específicos de TR
    """
    __tablename__ = "documentos_tr"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relacionamentos
    etp_id = Column(Integer, ForeignKey("documentos_etp.id"), nullable=False, index=True)
    plan_id = Column(Integer, nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("templates_institucionais.id"), nullable=False)
    
    # Versão do TR (pode ter múltiplas versões)
    versao = Column(Integer, default=1, nullable=False)
    
    # Dados preenchidos pelo usuário
    dados = Column(JSON, nullable=False, default=dict)
    
    # Validação de conformidade
    campos_obrigatorios_preenchidos = Column(JSON, nullable=False, default=dict)
    
    # Progresso de preenchimento
    progresso_percentual = Column(Integer, default=0, nullable=False)
    
    # Status do documento
    status = Column(String(50), default="rascunho", nullable=False, index=True)
    
    # Controle de IA
    campos_gerados_ia = Column(JSON, nullable=True, default=list)
    scores_confianca_ia = Column(JSON, nullable=True, default=dict)
    
    # Metadados
    created_by = Column(Integer, nullable=False, index=True)
    approved_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<DocumentoTR(id={self.id}, etp_id={self.etp_id}, versao={self.versao}, status={self.status})>"


# ============================================================================
# TABELA 5: HISTÓRICO DE ALTERAÇÕES (Auditoria)
# ============================================================================

class HistoricoAlteracao(Base):
    """
    Registra todas as alterações feitas nos documentos
    """
    __tablename__ = "historico_alteracoes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tipo de documento alterado
    tipo_documento = Column(String(10), nullable=False, index=True)
    
    # ID do documento alterado
    documento_id = Column(Integer, nullable=False, index=True)
    
    # Campo alterado (caminho JSON)
    campo_alterado = Column(String(255), nullable=False)
    
    # Valores
    valor_anterior = Column(JSON, nullable=True)
    valor_novo = Column(JSON, nullable=True)
    
    # Tipo de alteração
    tipo_alteracao = Column(String(50), nullable=False)  # "criacao", "edicao", "ia_geracao"
    
    # Comentário/justificativa
    comentario = Column(Text, nullable=True)
    
    # Metadados
    alterado_por = Column(Integer, nullable=False, index=True)
    alterado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<HistoricoAlteracao(id={self.id}, tipo={self.tipo_documento}, documento_id={self.documento_id})>"


# ============================================================================
# TABELA 6: DOCUMENTOS GERADOS (Arquivos Finais)
# ============================================================================

class DocumentoGerado(Base):
    """
    Armazena referências aos documentos finais gerados
    """
    __tablename__ = "documentos_gerados"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tipo de documento
    tipo_documento = Column(String(10), nullable=False, index=True)
    
    # ID do documento origem
    documento_id = Column(Integer, nullable=False, index=True)
    
    # Formato do arquivo gerado
    formato = Column(String(10), nullable=False)  # "docx", "pdf", "odt"
    
    # URL do arquivo gerado
    arquivo_url = Column(String(500), nullable=False)
    
    # Nome do arquivo
    nome_arquivo = Column(String(255), nullable=False)
    
    # Tamanho do arquivo (bytes)
    tamanho_bytes = Column(Integer, nullable=True)
    
    # Hash do arquivo (para verificação de integridade)
    hash_sha256 = Column(String(64), nullable=True)
    
    # Metadados
    gerado_por = Column(Integer, nullable=False)
    gerado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<DocumentoGerado(id={self.id}, tipo={self.tipo_documento}, formato={self.formato})>"

