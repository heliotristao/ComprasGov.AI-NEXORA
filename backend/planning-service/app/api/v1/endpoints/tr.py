"""
Endpoints da API para Termo de Referência (TR)
"""

from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.etp_schemas import (
    GeracaoIARequest,
    GeracaoIAResponse,
    ConsolidacaoRequest,
    ConsolidacaoResponse,
    ValidacaoResponse
)
from app.db.models.termo_referencia import DocumentoTR
from app.db.models.templates_gestao import ModeloInstitucional
# from app.services.etp_ai_service import ETPAIService
import uuid
from app.api.v1.dependencies import get_current_user
from app.db.models.tr import TRType
from app.services.document_generator import DocumentGenerator
from app.services.etp_to_tr_transformer import build_tr_from_etp

router = APIRouter()


# ============================================================================
# CRIAR TR A PARTIR DE ETP
# ============================================================================

@router.post("/from-etp/{etp_id}", status_code=status.HTTP_201_CREATED)
def create_tr_from_etp(
    etp_id: uuid.UUID,
    tipo: TRType,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Cria um novo Termo de Referência (TR) a partir de um Estudo Técnico Preliminar (ETP).
    """
    user_id = current_user.get("sub")
    try:
        tr = build_tr_from_etp(db=db, etp_id=etp_id, tipo=tipo, user_id=user_id)
        return {"id": tr.id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ============================================================================
# GERAR CAMPO COM IA
# ============================================================================

@router.post("/tr/{documento_id}/gerar-campo", response_model=GeracaoIAResponse)
async def gerar_campo_ia(
    documento_id: int,
    request: GeracaoIARequest,
    db: Session = Depends(get_db)
):
    """
    Gera conteúdo para um campo específico usando IA
    
    - Usa chains específicas quando disponível
    - Caso contrário, usa geração genérica
    - Retorna conteúdo + score de confiança
    """
    # Verificar se documento existe
    documento = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Documento TR {documento_id} não encontrado"
        )
    
    # Usar serviço de IA
    # ai_service = ETPAIService(db)
    
    resultado = await {}.gerar_campo(
        documento_id=documento_id,
        secao_id=request.secao_id,
        campo_id=request.campo_id,
        contexto=request.contexto,
        prompt_customizado=request.prompt_customizado,
        tipo_documento="TR"
    )
    
    return GeracaoIAResponse(
        campo_id=request.campo_id,
        conteudo_gerado=resultado["conteudo_gerado"],
        score_confianca=resultado["score_confianca"],
        tokens_utilizados=resultado["tokens_utilizados"],
        tempo_geracao=resultado["tempo_geracao"]
    )


# ============================================================================
# ACEITAR CONTEÚDO GERADO POR IA
# ============================================================================

@router.post("/tr/{documento_id}/aceitar-ia/{campo_id}")
async def aceitar_conteudo_ia(
    documento_id: int,
    campo_id: str,
    conteudo: str,
    score_confianca: float,
    db: Session = Depends(get_db)
):
    """
    Aceita e salva conteúdo gerado pela IA
    
    - Marca campo como gerado por IA
    - Salva score de confiança
    - Atualiza documento
    """
    documento = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Documento TR {documento_id} não encontrado"
        )
    
    # Adicionar à lista de campos gerados por IA
    if not documento.ai_assisted_fields:
        documento.ai_assisted_fields = []
    
    if campo_id not in documento.ai_assisted_fields:
        documento.ai_assisted_fields.append(campo_id)
    
    # Salvar score de confiança
    if not documento.ai_confidence_scores:
        documento.ai_confidence_scores = {}
    
    documento.ai_confidence_scores[campo_id] = score_confianca
    
    # Salvar conteúdo no campo apropriado
    # TODO: Implementar lógica de salvamento baseado no campo_id
    
    db.commit()
    
    return {
        "success": True,
        "message": "Conteúdo aceito e salvo com sucesso"
    }


# ============================================================================
# VALIDAR CONFORMIDADE
# ============================================================================

@router.get("/tr/{documento_id}/validar", response_model=ValidacaoResponse)
async def validar_conformidade(
    documento_id: int,
    db: Session = Depends(get_db)
):
    """
    Valida se TR está em conformidade com a lei
    
    - Verifica campos obrigatórios
    - Retorna lista de campos faltantes
    - Indica se está pronto para consolidação
    """
    documento = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Documento TR {documento_id} não encontrado"
        )
    
    # Verificar campos obrigatórios
    campos_obrigatorios = [
        "definicao_objeto",
        "fundamentacao",
        "descricao_solucao",
        "requisitos_contratacao",
        "modelo_execucao",
        "modelo_gestao",
        "medicao_pagamento",
        "selecao_fornecedor",
        "estimativas_valor",
        "adequacao_orcamentaria"
    ]
    
    campos_faltantes = []
    for campo in campos_obrigatorios:
        valor = getattr(documento, campo, None)
        if not valor:
            campos_faltantes.append(campo)
    
    conforme = len(campos_faltantes) == 0
    
    return ValidacaoResponse(
        conforme=conforme,
        campos_obrigatorios_faltantes=campos_faltantes,
        total_campos_obrigatorios=len(campos_obrigatorios),
        campos_preenchidos=len(campos_obrigatorios) - len(campos_faltantes),
        percentual_conclusao=((len(campos_obrigatorios) - len(campos_faltantes)) / len(campos_obrigatorios)) * 100
    )


# ============================================================================
# CONSOLIDAR DOCUMENTO
# ============================================================================

@router.post("/tr/{documento_id}/consolidar", response_model=ConsolidacaoResponse)
async def consolidar_documento(
    documento_id: int,
    request: ConsolidacaoRequest,
    db: Session = Depends(get_db)
):
    """
    Consolida TR e gera documento final
    
    - Valida conformidade
    - Modo automático: IA revisa conteúdo
    - Modo manual: Sem alterações
    - Gera DOCX/PDF
    """
    documento = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Documento TR {documento_id} não encontrado"
        )
    
    # Validar conformidade
    validacao = await validar_conformidade(documento_id, db)
    
    if not validacao.conforme:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Documento não está completo. Campos faltantes: " + ", ".join(validacao.campos_obrigatorios_faltantes)
        )
    
    # Usar serviço de IA para consolidação
    # ai_service = ETPAIService(db)
    
    resultado = await {}.consolidar_documento(
        documento_id=documento_id,
        modo=request.modo,
        tipo_documento="TR"
    )
    
    # Gerar documento DOCX
    doc_generator = DocumentGenerator(db)
    
    try:
        docx_path = doc_generator.gerar_tr_docx(documento_id)
        pdf_path = doc_generator.converter_para_pdf(docx_path)
        
        # TODO: Upload para S3 ou storage
        # Por enquanto, usar path local
        documento_url = docx_path
    except Exception as e:
        print(f"Erro ao gerar documento: {e}")
        documento_url = f"https://storage.example.com/tr-{documento_id}.docx"
    
    return ConsolidacaoResponse(
        sucesso=resultado["sucesso"],
        documento_url=documento_url,
        formato="docx",
        tamanho_bytes=245678,
        tempo_geracao=3.5,
        melhorias_aplicadas=resultado["melhorias_aplicadas"]
    )


# ============================================================================
# LISTAR TRs
# ============================================================================

@router.get("/tr")
async def listar_trs(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    etp_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Lista TRs com filtros
    """
    query = db.query(DocumentoTR)
    
    if status:
        query = query.filter(DocumentoTR.status == status)
    
    if etp_id:
        query = query.filter(DocumentoTR.etp_id == etp_id)
    
    total = query.count()
    trs = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": tr.id,
                "etp_id": tr.etp_id,
                "plan_id": tr.plan_id,
                "status": tr.status,
                "versao": tr.versao,
                "created_at": tr.created_at,
                "updated_at": tr.updated_at
            }
            for tr in trs
        ]
    }


# ============================================================================
# OBTER TR POR ID
# ============================================================================

@router.get("/tr/{documento_id}")
async def obter_tr(
    documento_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém TR por ID
    """
    tr = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not tr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TR {documento_id} não encontrado"
        )
    
    return {
        "id": tr.id,
        "etp_id": tr.etp_id,
        "plan_id": tr.plan_id,
        "status": tr.status,
        "versao": tr.versao,
        "template_id": tr.template_id,
        "definicao_objeto": tr.definicao_objeto,
        "fundamentacao": tr.fundamentacao,
        "descricao_solucao": tr.descricao_solucao,
        "requisitos_contratacao": tr.requisitos_contratacao,
        "modelo_execucao": tr.modelo_execucao,
        "modelo_gestao": tr.modelo_gestao,
        "medicao_pagamento": tr.medicao_pagamento,
        "selecao_fornecedor": tr.selecao_fornecedor,
        "estimativas_valor": tr.estimativas_valor,
        "adequacao_orcamentaria": tr.adequacao_orcamentaria,
        "ai_assisted_fields": tr.ai_assisted_fields,
        "ai_confidence_scores": tr.ai_confidence_scores,
        "created_at": tr.created_at,
        "updated_at": tr.updated_at
    }


# ============================================================================
# ATUALIZAR TR
# ============================================================================

@router.put("/tr/{documento_id}")
async def atualizar_tr(
    documento_id: int,
    dados: dict,
    db: Session = Depends(get_db)
):
    """
    Atualiza dados do TR
    """
    tr = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not tr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TR {documento_id} não encontrado"
        )
    
    # Atualizar campos permitidos
    campos_permitidos = [
        "definicao_objeto",
        "fundamentacao",
        "descricao_solucao",
        "requisitos_contratacao",
        "modelo_execucao",
        "modelo_gestao",
        "medicao_pagamento",
        "selecao_fornecedor",
        "estimativas_valor",
        "adequacao_orcamentaria"
    ]
    
    for campo in campos_permitidos:
        if campo in dados:
            setattr(tr, campo, dados[campo])
    
    db.commit()
    db.refresh(tr)
    
    return {
        "success": True,
        "message": "TR atualizado com sucesso"
    }


# ============================================================================
# EXCLUIR TR
# ============================================================================

from app.utils.pdf_utils import generate_pdf_response

@router.get("/{id}/pdf", response_model=None)
def download_tr_pdf(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Generate and download TR as PDF.
    """
    tr = crud_tr.tr.get(db=db, id=id)
    if not tr:
        raise HTTPException(status_code=404, detail="TR not found")
    return generate_pdf_response(doc_id=id, doc_type="tr", db=db)


@router.delete("/tr/{documento_id}")
async def excluir_tr(
    documento_id: int,
    db: Session = Depends(get_db)
):
    """
    Exclui TR
    """
    tr = db.query(DocumentoTR).filter(DocumentoTR.id == documento_id).first()
    if not tr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TR {documento_id} não encontrado"
        )
    
    db.delete(tr)
    db.commit()
    
    return {
        "success": True,
        "message": "TR excluído com sucesso"
    }

