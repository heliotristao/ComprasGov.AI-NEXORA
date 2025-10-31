from pydantic import BaseModel, StringConstraints, field_validator
from typing import Optional, Dict, Any, Annotated, List
from uuid import UUID
from datetime import datetime
from app.db.models.etp import ETPStatus


class ETPBase(BaseModel):
    title: Optional[str] = None
    edocs_number: Optional[Annotated[str, StringConstraints(pattern=r"^\d{4}-[A-Z0-9]{6}$")]] = None
    status: Optional[ETPStatus] = None
    step: Optional[int] = None
    data: Optional[Dict[str, Any]] = None


class ETPCreate(ETPBase):
    title: str


class ETPUpdate(ETPBase):
    pass


class ETPPartialUpdate(BaseModel):
    data: Optional[Dict[str, Any]] = None
    step: Optional[int] = None
    status: Optional[ETPStatus] = None

    @field_validator('status')
    def validate_status(cls, v):
        if v not in [status for status in ETPStatus]:
            raise ValueError(f"Invalid status: {v}")
        return v


class ETPOut(ETPBase):
    id: UUID
    created_by: str
    updated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ModeloInstitucionalBase(BaseModel):
    instituicao_id: int
    modelo_superior_id: Optional[int] = None
    nome: str
    descricao: Optional[str] = None
    tipo_documento: str
    tipo_contratacao: str
    versao: str
    estrutura: Dict[str, Any]
    mapeamento_lei: Dict[str, Any]
    configuracao_documento: Dict[str, Any]
    prompts_ia: Optional[Dict[str, Any]] = None


class ModeloInstitucionalCreate(ModeloInstitucionalBase):
    pass


class ModeloInstitucionalUpdate(ModeloInstitucionalBase):
    pass


class ModeloInstitucionalResponse(ModeloInstitucionalBase):
    id: int
    status: str

    class Config:
        from_attributes = True


class GeracaoIARequest(BaseModel):
    secao_id: str
    campo_id: str
    contexto: Dict[str, Any]
    prompt_customizado: Optional[str] = None


class GeracaoIAResponse(BaseModel):
    campo_id: str
    conteudo_gerado: str
    score_confianca: float
    tokens_utilizados: int
    tempo_geracao: float


class ConsolidacaoRequest(BaseModel):
    modo: str  # "automatico" ou "manual"


class ConsolidacaoResponse(BaseModel):
    sucesso: bool
    documento_url: str
    formato: str
    tamanho_bytes: int
    tempo_geracao: float
    melhorias_aplicadas: List[str]


class ValidacaoResponse(BaseModel):
    conforme: bool
    campos_obrigatorios_faltantes: List[str]
    total_campos_obrigatorios: int
    campos_preenchidos: int
    percentual_conclusao: float


class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 10


class ModeloSuperiorBase(BaseModel):
    nome: str
    codigo: str
    tipo_documento: str
    tipo_contratacao: str
    versao: str
    descricao: Optional[str] = None
    estrutura: Dict[str, Any]
    mapeamento_lei: Dict[str, Any]
    configuracao_documento: Dict[str, Any]
    changelog: Optional[str] = None


class ModeloSuperiorCreate(ModeloSuperiorBase):
    pass


class ModeloSuperiorUpdate(ModeloSuperiorBase):
    pass


class ModeloSuperiorResponse(ModeloSuperiorBase):
    id: int

    class Config:
        from_attributes = True
