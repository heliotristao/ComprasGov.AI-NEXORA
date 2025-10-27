"""
Schemas Pydantic para ETP/TR
Validação de dados e serialização
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class TipoDocumento(str, Enum):
    ETP = "ETP"
    TR = "TR"


class StatusDocumento(str, Enum):
    RASCUNHO = "rascunho"
    EM_REVISAO = "em_revisao"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"
    PUBLICADO = "publicado"


class TipoTemplate(str, Enum):
    SUPERIOR = "superior"
    INSTITUCIONAL = "institucional"


# ============================================================================
# SCHEMAS DE CAMPOS E SEÇÕES
# ============================================================================

class CampoFormulario(BaseModel):
    """Schema para definição de um campo de formulário"""
    id: str
    label: str
    tipo: str  # text, textarea, select, radio, date, currency, table, repeater, file_upload
    obrigatorio: bool = False
    placeholder: Optional[str] = None
    ajuda: Optional[str] = None
    opcoes: Optional[List[str]] = None
    valor_padrao: Optional[Any] = None
    condicao: Optional[str] = None  # Expressão JS para exibição condicional
    justificativa_obrigatoria: bool = False
    validacao: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "problema",
                "label": "Qual o problema?",
                "tipo": "textarea",
                "obrigatorio": True,
                "placeholder": "Descreva o problema..."
            }
        }


class SecaoTemplate(BaseModel):
    """Schema para definição de uma seção do template"""
    id: str
    codigo_lei: Optional[str] = None  # Ex: "ETP-I", "TR-1"
    titulo: str
    ordem: int
    obrigatoria: bool = False
    descricao: Optional[str] = None
    nota_explicativa: Optional[str] = None
    campos: List[CampoFormulario]
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "descricao_necessidade",
                "codigo_lei": "ETP-I",
                "titulo": "DESCRIÇÃO DA NECESSIDADE",
                "ordem": 1,
                "obrigatoria": True,
                "campos": []
            }
        }


class EstruturaTemplate(BaseModel):
    """Schema para estrutura completa de um template"""
    secoes: List[SecaoTemplate]
    
    @validator('secoes')
    def validar_ordem_secoes(cls, v):
        ordens = [s.ordem for s in v]
        if len(ordens) != len(set(ordens)):
            raise ValueError("Ordens das seções devem ser únicas")
        return sorted(v, key=lambda x: x.ordem)


class MapeamentoCampoLei(BaseModel):
    """Schema para mapeamento entre campo da lei e template"""
    secao_id: str
    campos: List[str]
    prompt_transformacao: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "secao_id": "descricao_necessidade",
                "campos": ["problema", "publico_impactado"],
                "prompt_transformacao": "Compile os campos em um texto formal..."
            }
        }


class ConfiguracaoDocumento(BaseModel):
    """Schema para configuração de formatação do documento"""
    formatacao: Dict[str, Any]
    cabecalho: Optional[Dict[str, Any]] = None
    rodape: Optional[Dict[str, Any]] = None
    numeracao_pagina: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "formatacao": {
                    "fonte": "Arial",
                    "tamanho": 12,
                    "espacamento": 1.5
                },
                "numeracao_pagina": True
            }
        }


# ============================================================================
# SCHEMAS DE MODELOS SUPERIORES
# ============================================================================

class ModeloSuperiorCreate(BaseModel):
    """Schema para criação de modelo superior"""
    nome: str = Field(..., min_length=1, max_length=255)
    codigo: str = Field(..., min_length=1, max_length=50)
    tipo_documento: TipoDocumento
    tipo_contratacao: Optional[str] = None
    versao: str = Field(..., min_length=1, max_length=50)
    descricao: Optional[str] = None
    estrutura: EstruturaTemplate
    mapeamento_lei: Dict[str, MapeamentoCampoLei]
    configuracao_documento: ConfiguracaoDocumento
    changelog: Optional[str] = None


class ModeloSuperiorUpdate(BaseModel):
    """Schema para atualização de modelo superior"""
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    descricao: Optional[str] = None
    estrutura: Optional[EstruturaTemplate] = None
    mapeamento_lei: Optional[Dict[str, MapeamentoCampoLei]] = None
    configuracao_documento: Optional[ConfiguracaoDocumento] = None
    ativo: Optional[bool] = None
    changelog: Optional[str] = None


class ModeloSuperiorResponse(BaseModel):
    """Schema de resposta de modelo superior"""
    id: int
    nome: str
    codigo: str
    tipo_documento: str
    tipo_contratacao: Optional[str]
    versao: str
    descricao: Optional[str]
    ativo: bool
    estrutura: Dict[str, Any]
    mapeamento_lei: Dict[str, Any]
    configuracao_documento: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE MODELOS INSTITUCIONAIS
# ============================================================================

class ModeloInstitucionalCreate(BaseModel):
    """Schema para criação de modelo institucional"""
    instituicao_id: int
    modelo_superior_id: Optional[int] = None
    nome: str = Field(..., min_length=1, max_length=255)
    descricao: Optional[str] = None
    tipo_documento: TipoDocumento
    tipo_contratacao: Optional[str] = None
    versao: str = Field(..., min_length=1, max_length=50)
    estrutura: EstruturaTemplate
    mapeamento_lei: Dict[str, MapeamentoCampoLei]
    configuracao_documento: ConfiguracaoDocumento
    prompts_ia: Optional[Dict[str, str]] = None


class ModeloInstitucionalUpdate(BaseModel):
    """Schema para atualização de modelo institucional"""
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    descricao: Optional[str] = None
    estrutura: Optional[EstruturaTemplate] = None
    mapeamento_lei: Optional[Dict[str, MapeamentoCampoLei]] = None
    configuracao_documento: Optional[ConfiguracaoDocumento] = None
    prompts_ia: Optional[Dict[str, str]] = None
    status: Optional[str] = None


class ModeloInstitucionalResponse(BaseModel):
    """Schema de resposta de modelo institucional"""
    id: int
    instituicao_id: int
    modelo_superior_id: Optional[int]
    nome: str
    descricao: Optional[str]
    tipo_documento: str
    tipo_contratacao: Optional[str]
    versao: str
    status: str
    estrutura: Dict[str, Any]
    mapeamento_lei: Dict[str, Any]
    configuracao_documento: Dict[str, Any]
    prompts_ia: Optional[Dict[str, str]]
    total_documentos_gerados: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE DOCUMENTOS ETP
# ============================================================================

class DocumentoETPCreate(BaseModel):
    """Schema para criação de documento ETP"""
    plan_id: int
    template_id: int
    dados: Optional[Dict[str, Any]] = Field(default_factory=dict)


class DocumentoETPUpdate(BaseModel):
    """Schema para atualização de documento ETP"""
    dados: Dict[str, Any]
    status: Optional[StatusDocumento] = None


class DocumentoETPResponse(BaseModel):
    """Schema de resposta de documento ETP"""
    id: int
    plan_id: int
    template_id: int
    dados: Dict[str, Any]
    campos_obrigatorios_preenchidos: Dict[str, bool]
    progresso_percentual: int
    status: str
    campos_gerados_ia: List[str]
    scores_confianca_ia: Dict[str, float]
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE DOCUMENTOS TR
# ============================================================================

class DocumentoTRCreate(BaseModel):
    """Schema para criação de documento TR"""
    etp_id: int
    plan_id: int
    template_id: int
    dados: Optional[Dict[str, Any]] = Field(default_factory=dict)


class DocumentoTRUpdate(BaseModel):
    """Schema para atualização de documento TR"""
    dados: Dict[str, Any]
    status: Optional[StatusDocumento] = None


class DocumentoTRResponse(BaseModel):
    """Schema de resposta de documento TR"""
    id: int
    etp_id: int
    plan_id: int
    template_id: int
    versao: int
    dados: Dict[str, Any]
    campos_obrigatorios_preenchidos: Dict[str, bool]
    progresso_percentual: int
    status: str
    campos_gerados_ia: List[str]
    scores_confianca_ia: Dict[str, float]
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE VALIDAÇÃO
# ============================================================================

class ValidacaoConformidade(BaseModel):
    """Schema de resposta de validação de conformidade"""
    valido: bool
    campos_obrigatorios_faltantes: List[str]
    avisos: List[str]
    progresso_percentual: int
    detalhes: Dict[str, Any]


# ============================================================================
# SCHEMAS DE GERAÇÃO DE IA
# ============================================================================

class GeracaoIARequest(BaseModel):
    """Schema para requisição de geração de IA"""
    secao_id: str
    campo_id: str
    contexto: Dict[str, Any]
    prompt_customizado: Optional[str] = None


class GeracaoIAResponse(BaseModel):
    """Schema de resposta de geração de IA"""
    campo_id: str
    conteudo_gerado: str
    score_confianca: float
    tokens_utilizados: int
    tempo_geracao: float


# ============================================================================
# SCHEMAS DE CONSOLIDAÇÃO
# ============================================================================

class ConsolidacaoRequest(BaseModel):
    """Schema para requisição de consolidação"""
    documento_id: int
    tipo_documento: TipoDocumento
    modo: str  # "automatico" ou "manual"
    template_id: Optional[int] = None


class ConsolidacaoResponse(BaseModel):
    """Schema de resposta de consolidação"""
    sucesso: bool
    documento_url: Optional[str]
    formato: str  # "docx", "pdf"
    tamanho_bytes: int
    tempo_geracao: float
    melhorias_aplicadas: List[str]


# ============================================================================
# SCHEMAS DE LISTAGEM
# ============================================================================

class PaginationParams(BaseModel):
    """Parâmetros de paginação"""
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """Resposta paginada genérica"""
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int

