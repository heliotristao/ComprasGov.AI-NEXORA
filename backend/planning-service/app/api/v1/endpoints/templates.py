"""
Endpoints para gestão de templates (Modelos Superiores e Institucionais)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.schemas.etp_schemas import (
    ModeloSuperiorCreate,
    ModeloSuperiorUpdate,
    ModeloSuperiorResponse,
    ModeloInstitucionalCreate,
    ModeloInstitucionalUpdate,
    ModeloInstitucionalResponse,
    PaginationParams
)
from app.db.models.templates_gestao import ModeloSuperior, ModeloInstitucional

router = APIRouter()


# ============================================================================
# ENDPOINTS DE MODELOS SUPERIORES (TCU, TCE, PGE)
# ============================================================================

@router.get("/modelos-superiores", response_model=List[ModeloSuperiorResponse])
async def listar_modelos_superiores(
    tipo_documento: Optional[str] = Query(None, description="Filtrar por tipo (ETP ou TR)"),
    tipo_contratacao: Optional[str] = Query(None, description="Filtrar por tipo de contratação"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    db: Session = Depends(get_db)
):
    """
    Lista todos os modelos superiores disponíveis (TCU, TCE, PGE)

    **Filtros disponíveis:**
    - tipo_documento: ETP ou TR
    - tipo_contratacao: obras, servicos, ti, bens
    - ativo: true ou false
    """
    query = db.query(ModeloSuperior)

    if tipo_documento:
        query = query.filter(ModeloSuperior.tipo_documento == tipo_documento)

    if tipo_contratacao:
        query = query.filter(ModeloSuperior.tipo_contratacao == tipo_contratacao)

    if ativo is not None:
        query = query.filter(ModeloSuperior.ativo == ativo)

    modelos = query.order_by(ModeloSuperior.codigo, ModeloSuperior.versao.desc()).all()
    return modelos


@router.get("/modelos-superiores/{modelo_id}", response_model=ModeloSuperiorResponse)
async def obter_modelo_superior(
    modelo_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém detalhes completos de um modelo superior específico
    """
    modelo = db.query(ModeloSuperior).filter(ModeloSuperior.id == modelo_id).first()

    if not modelo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo superior não encontrado"
        )

    return modelo


@router.post("/modelos-superiores", response_model=ModeloSuperiorResponse, status_code=status.HTTP_201_CREATED)
async def criar_modelo_superior(
    modelo: ModeloSuperiorCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_admin_user)  # Apenas admins do sistema
):
    """
    Cria um novo modelo superior (TCU, TCE, PGE)

    **Requer permissões de administrador do sistema**
    """
    # Verificar se já existe modelo com mesmo código e versão
    existe = db.query(ModeloSuperior).filter(
        ModeloSuperior.codigo == modelo.codigo,
        ModeloSuperior.versao == modelo.versao
    ).first()

    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um modelo {modelo.codigo} versão {modelo.versao}"
        )

    # Criar modelo
    db_modelo = ModeloSuperior(
        nome=modelo.nome,
        codigo=modelo.codigo,
        tipo_documento=modelo.tipo_documento.value,
        tipo_contratacao=modelo.tipo_contratacao,
        versao=modelo.versao,
        descricao=modelo.descricao,
        estrutura=modelo.estrutura.model_dump(),
        mapeamento_lei={k: v.model_dump() for k, v in modelo.mapeamento_lei.items()},
        configuracao_documento=modelo.configuracao_documento.model_dump(),
        changelog=modelo.changelog,
        created_by=1  # TODO: current_user.id
    )

    db.add(db_modelo)
    db.commit()
    db.refresh(db_modelo)

    return db_modelo


@router.put("/modelos-superiores/{modelo_id}", response_model=ModeloSuperiorResponse)
async def atualizar_modelo_superior(
    modelo_id: int,
    modelo: ModeloSuperiorUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_admin_user)
):
    """
    Atualiza um modelo superior existente

    **Requer permissões de administrador do sistema**
    """
    db_modelo = db.query(ModeloSuperior).filter(ModeloSuperior.id == modelo_id).first()

    if not db_modelo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo superior não encontrado"
        )

    # Atualizar campos
    update_data = modelo.model_dump(exclude_unset=True)

    if "estrutura" in update_data:
        update_data["estrutura"] = update_data["estrutura"].model_dump()

    if "mapeamento_lei" in update_data:
        update_data["mapeamento_lei"] = {k: v.model_dump() for k, v in update_data["mapeamento_lei"].items()}

    if "configuracao_documento" in update_data:
        update_data["configuracao_documento"] = update_data["configuracao_documento"].model_dump()

    for key, value in update_data.items():
        setattr(db_modelo, key, value)

    db.commit()
    db.refresh(db_modelo)

    return db_modelo


# ============================================================================
# ENDPOINTS DE MODELOS INSTITUCIONAIS (Por Cliente)
# ============================================================================

@router.get("/modelos-institucionais", response_model=List[ModeloInstitucionalResponse])
async def listar_modelos_institucionais(
    instituicao_id: Optional[int] = Query(None, description="Filtrar por instituição"),
    tipo_documento: Optional[str] = Query(None, description="Filtrar por tipo (ETP ou TR)"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Lista modelos institucionais

    **Filtros:**
    - instituicao_id: ID da instituição
    - tipo_documento: ETP ou TR
    - status: ativo, inativo, em_revisao
    """
    query = db.query(ModeloInstitucional)

    # TODO: Filtrar por instituição do usuário se não for admin
    if instituicao_id:
        query = query.filter(ModeloInstitucional.instituicao_id == instituicao_id)

    if tipo_documento:
        query = query.filter(ModeloInstitucional.tipo_documento == tipo_documento)

    if status:
        query = query.filter(ModeloInstitucional.status == status)

    modelos = query.order_by(ModeloInstitucional.updated_at.desc()).all()
    return modelos


@router.get("/modelos-institucionais/{modelo_id}", response_model=ModeloInstitucionalResponse)
async def obter_modelo_institucional(
    modelo_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Obtém detalhes de um modelo institucional específico
    """
    modelo = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == modelo_id).first()

    if not modelo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo institucional não encontrado"
        )

    # TODO: Verificar se usuário tem acesso a esta instituição

    return modelo


@router.post("/modelos-institucionais", response_model=ModeloInstitucionalResponse, status_code=status.HTTP_201_CREATED)
async def criar_modelo_institucional(
    modelo: ModeloInstitucionalCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Cria um novo modelo institucional customizado

    Pode ser baseado em um modelo superior (TCU, TCE, PGE) ou criado do zero
    """
    # TODO: Verificar se usuário tem permissão para criar templates nesta instituição

    # Criar modelo
    db_modelo = ModeloInstitucional(
        instituicao_id=modelo.instituicao_id,
        modelo_superior_id=modelo.modelo_superior_id,
        nome=modelo.nome,
        descricao=modelo.descricao,
        tipo_documento=modelo.tipo_documento.value,
        tipo_contratacao=modelo.tipo_contratacao,
        versao=modelo.versao,
        estrutura=modelo.estrutura.model_dump(),
        mapeamento_lei={k: v.model_dump() for k, v in modelo.mapeamento_lei.items()},
        configuracao_documento=modelo.configuracao_documento.model_dump(),
        prompts_ia=modelo.prompts_ia,
        created_by=1  # TODO: current_user.id
    )

    db.add(db_modelo)
    db.commit()
    db.refresh(db_modelo)

    return db_modelo


@router.put("/modelos-institucionais/{modelo_id}", response_model=ModeloInstitucionalResponse)
async def atualizar_modelo_institucional(
    modelo_id: int,
    modelo: ModeloInstitucionalUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Atualiza um modelo institucional existente
    """
    db_modelo = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == modelo_id).first()

    if not db_modelo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo institucional não encontrado"
        )

    # TODO: Verificar permissões

    # Atualizar campos
    update_data = modelo.model_dump(exclude_unset=True)

    if "estrutura" in update_data:
        update_data["estrutura"] = update_data["estrutura"].model_dump()

    if "mapeamento_lei" in update_data:
        update_data["mapeamento_lei"] = {k: v.model_dump() for k, v in update_data["mapeamento_lei"].items()}

    if "configuracao_documento" in update_data:
        update_data["configuracao_documento"] = update_data["configuracao_documento"].model_dump()

    for key, value in update_data.items():
        setattr(db_modelo, key, value)

    db.commit()
    db.refresh(db_modelo)

    return db_modelo


@router.delete("/modelos-institucionais/{modelo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def desativar_modelo_institucional(
    modelo_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Desativa um modelo institucional (não exclui, apenas marca como inativo)
    """
    db_modelo = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == modelo_id).first()

    if not db_modelo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo institucional não encontrado"
        )

    # TODO: Verificar permissões

    db_modelo.status = "inativo"
    db.commit()

    return None


# ============================================================================
# ENDPOINT AUXILIAR: DUPLICAR MODELO
# ============================================================================

@router.post("/modelos-institucionais/{modelo_id}/duplicar", response_model=ModeloInstitucionalResponse)
async def duplicar_modelo_institucional(
    modelo_id: int,
    novo_nome: str = Query(..., description="Nome para o novo modelo"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Duplica um modelo institucional existente

    Útil para criar variações de um modelo base
    """
    modelo_original = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == modelo_id).first()

    if not modelo_original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo institucional não encontrado"
        )

    # Criar cópia
    novo_modelo = ModeloInstitucional(
        instituicao_id=modelo_original.instituicao_id,
        modelo_superior_id=modelo_original.modelo_superior_id,
        nome=novo_nome,
        descricao=f"Cópia de: {modelo_original.nome}",
        tipo_documento=modelo_original.tipo_documento,
        tipo_contratacao=modelo_original.tipo_contratacao,
        versao="1.0",
        estrutura=modelo_original.estrutura,
        mapeamento_lei=modelo_original.mapeamento_lei,
        configuracao_documento=modelo_original.configuracao_documento,
        prompts_ia=modelo_original.prompts_ia,
        created_by=1  # TODO: current_user.id
    )

    db.add(novo_modelo)
    db.commit()
    db.refresh(novo_modelo)

    return novo_modelo
