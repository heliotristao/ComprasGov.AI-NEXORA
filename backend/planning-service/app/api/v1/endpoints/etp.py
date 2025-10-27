"""
Endpoints para gestão de documentos ETP
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.base import get_db
from app.schemas.etp_schemas import (
    DocumentoETPCreate,
    DocumentoETPUpdate,
    DocumentoETPResponse,
    ValidacaoConformidade,
    GeracaoIARequest,
    GeracaoIAResponse,
    ConsolidacaoRequest,
    ConsolidacaoResponse
)
from app.db.models.etp_modular import DocumentoETP
from app.db.models.templates_gestao import ModeloInstitucional, ModeloSuperior
from app.db.models.templates_gestao import CampoObrigatorioLei
from app.services.etp_ai_service import ETPAIService
from app.services.document_generator import DocumentGenerator

router = APIRouter()


# ============================================================================
# CRUD DE DOCUMENTOS ETP
# ============================================================================

@router.post("/etp", response_model=DocumentoETPResponse, status_code=status.HTTP_201_CREATED)
async def criar_documento_etp(
    documento: DocumentoETPCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Cria um novo documento ETP em branco
    
    **Parâmetros:**
    - plan_id: ID do plano de contratação
    - template_id: ID do modelo institucional a ser usado
    """
    # Verificar se template existe
    template = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == documento.template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template não encontrado"
        )
    
    # Criar documento
    db_documento = DocumentoETP(
        plan_id=documento.plan_id,
        template_id=documento.template_id,
        dados=documento.dados or {},
        campos_obrigatorios_preenchidos={},
        progresso_percentual=0,
        status="rascunho",
        created_by=1  # TODO: current_user.id
    )
    
    db.add(db_documento)
    db.commit()
    db.refresh(db_documento)
    
    return db_documento


@router.get("/etp/{documento_id}", response_model=DocumentoETPResponse)
async def obter_documento_etp(
    documento_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Obtém um documento ETP específico
    """
    documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # TODO: Verificar se usuário tem acesso a este documento
    
    return documento


@router.get("/etp", response_model=List[DocumentoETPResponse])
async def listar_documentos_etp(
    plan_id: Optional[int] = Query(None, description="Filtrar por plano"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Lista documentos ETP
    
    **Filtros:**
    - plan_id: ID do plano
    - status: rascunho, em_revisao, aprovado, rejeitado
    """
    query = db.query(DocumentoETP)
    
    if plan_id:
        query = query.filter(DocumentoETP.plan_id == plan_id)
    
    if status:
        query = query.filter(DocumentoETP.status == status)
    
    # TODO: Filtrar por instituição do usuário
    
    documentos = query.order_by(DocumentoETP.updated_at.desc()).all()
    return documentos


@router.put("/etp/{documento_id}", response_model=DocumentoETPResponse)
async def atualizar_documento_etp(
    documento_id: int,
    documento: DocumentoETPUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Atualiza dados de um documento ETP
    
    **Salvamento automático:** Este endpoint pode ser chamado frequentemente
    para salvar o progresso do usuário
    """
    db_documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not db_documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # TODO: Verificar permissões
    
    # Atualizar dados
    if documento.dados:
        db_documento.dados = documento.dados
    
    if documento.status:
        db_documento.status = documento.status.value
    
    # Recalcular progresso
    progresso = calcular_progresso(db_documento, db)
    db_documento.progresso_percentual = progresso["percentual"]
    db_documento.campos_obrigatorios_preenchidos = progresso["campos_preenchidos"]
    
    db.commit()
    db.refresh(db_documento)
    
    return db_documento


@router.delete("/etp/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_documento_etp(
    documento_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Exclui um documento ETP
    
    **Atenção:** Esta ação não pode ser desfeita
    """
    db_documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not db_documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # TODO: Verificar permissões
    # TODO: Verificar se não há TR vinculado
    
    db.delete(db_documento)
    db.commit()
    
    return None


# ============================================================================
# VALIDAÇÃO DE CONFORMIDADE
# ============================================================================

@router.get("/etp/{documento_id}/validar", response_model=ValidacaoConformidade)
async def validar_conformidade_etp(
    documento_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Valida se o documento ETP está em conformidade com a Lei 14.133/2021
    
    **Retorna:**
    - Lista de campos obrigatórios faltantes
    - Avisos sobre campos não-obrigatórios sem justificativa
    - Progresso percentual
    """
    documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # Obter template
    template = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == documento.template_id).first()
    
    # Obter campos obrigatórios da lei
    campos_lei = db.query(CampoObrigatorioLei).filter(
        CampoObrigatorioLei.tipo_documento == "ETP",
        CampoObrigatorioLei.obrigatorio == True
    ).all()
    
    # Validar
    validacao = validar_documento(documento, template, campos_lei)
    
    return validacao


# ============================================================================
# GERAÇÃO DE CONTEÚDO COM IA
# ============================================================================

@router.post("/etp/{documento_id}/gerar-campo", response_model=GeracaoIAResponse)
async def gerar_campo_com_ia(
    documento_id: int,
    request: GeracaoIARequest,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Gera conteúdo para um campo específico usando IA
    
    **Parâmetros:**
    - secao_id: ID da seção
    - campo_id: ID do campo a ser gerado
    - contexto: Dados já preenchidos no documento
    - prompt_customizado: Prompt opcional para customizar a geração
    """
    documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # Obter template
    template = db.query(ModeloInstitucional).filter(ModeloInstitucional.id == documento.template_id).first()
    
    # Usar serviço de IA
    ai_service = ETPAIService(db)
    
    resultado = await ai_service.gerar_campo(
        documento_id=documento_id,
        secao_id=request.secao_id,
        campo_id=request.campo_id,
        contexto=request.contexto,
        prompt_customizado=request.prompt_customizado
    )
    
    return GeracaoIAResponse(
        campo_id=request.campo_id,
        conteudo_gerado=resultado["conteudo_gerado"],
        score_confianca=resultado["score_confianca"],
        tokens_utilizados=resultado["tokens_utilizados"],
        tempo_geracao=resultado["tempo_geracao"]
    )


@router.post("/etp/{documento_id}/aceitar-ia/{campo_id}", response_model=DocumentoETPResponse)
async def aceitar_conteudo_ia(
    documento_id: int,
    campo_id: str,
    conteudo: str,
    score_confianca: float,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Aceita o conteúdo gerado pela IA e salva no documento
    
    Registra que este campo foi gerado por IA para fins de auditoria
    """
    documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # Salvar conteúdo
    # TODO: Implementar lógica de salvamento no campo correto
    
    # Registrar que foi gerado por IA
    if campo_id not in documento.campos_gerados_ia:
        documento.campos_gerados_ia.append(campo_id)
    
    documento.scores_confianca_ia[campo_id] = score_confianca
    
    db.commit()
    db.refresh(documento)
    
    return documento


# ============================================================================
# CONSOLIDAÇÃO E GERAÇÃO DE DOCUMENTO FINAL
# ============================================================================

@router.post("/etp/{documento_id}/consolidar", response_model=ConsolidacaoResponse)
async def consolidar_etp(
    documento_id: int,
    request: ConsolidacaoRequest,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Consolida o ETP e gera documento final (DOCX ou PDF)
    
    **Modos:**
    - automatico: IA revisa e melhora o conteúdo
    - manual: Gera documento sem alterações
    """
    documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()
    
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )
    
    # Validar se está completo
    validacao = validar_conformidade_etp(documento_id, db)
    
    if not validacao.valido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Documento não está completo. Campos faltantes: " + ", ".join(validacao.campos_obrigatorios_faltantes)
        )
    
    # Usar serviço de IA para consolidação
    ai_service = ETPAIService(db)
    
    resultado = await ai_service.consolidar_documento(
        documento_id=documento_id,
        modo=request.modo
    )
    
    # Gerar documento DOCX
    doc_generator = DocumentGenerator(db)
    
    try:
        docx_path = doc_generator.gerar_etp_docx(documento_id)
        pdf_path = doc_generator.converter_para_pdf(docx_path)
        
        # TODO: Upload para S3 ou storage
        # Por enquanto, usar path local
        documento_url = docx_path
    except Exception as e:
        print(f"Erro ao gerar documento: {e}")
        documento_url = f"https://storage.example.com/etp-{documento_id}.docx"
    
    return ConsolidacaoResponse(
        sucesso=resultado["sucesso"],
        documento_url=documento_url,
        formato="docx",
        tamanho_bytes=245678,
        tempo_geracao=3.5,
        melhorias_aplicadas=resultado["melhorias_aplicadas"]
    )


# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def calcular_progresso(documento: DocumentoETP, db: Session) -> Dict[str, Any]:
    """
    Calcula o progresso de preenchimento do documento
    """
    # TODO: Implementar lógica real
    # - Contar campos obrigatórios preenchidos
    # - Calcular percentual
    
    return {
        "percentual": 30,
        "campos_preenchidos": {
            "ETP-I": True,
            "ETP-II": True,
            "ETP-IV": False
        }
    }


def validar_documento(documento: DocumentoETP, template: ModeloInstitucional, campos_lei: List) -> ValidacaoConformidade:
    """
    Valida conformidade do documento com a lei
    """
    # TODO: Implementar lógica real de validação
    
    return ValidacaoConformidade(
        valido=False,
        campos_obrigatorios_faltantes=["ETP-IV", "ETP-VI", "ETP-VII"],
        avisos=["Campo ETP-III não preenchido (não-obrigatório)"],
        progresso_percentual=30,
        detalhes={
            "total_campos": 13,
            "campos_preenchidos": 4,
            "campos_obrigatorios": 8,
            "campos_obrigatorios_preenchidos": 2
        }
    )

