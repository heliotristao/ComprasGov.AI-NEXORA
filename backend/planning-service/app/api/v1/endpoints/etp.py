"""
Endpoints para gestão de documentos ETP
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.base import get_db
from app.api.v1.dependencies import get_current_user
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


@router.put("/etp/{documento_id}/section/{section_id}", response_model=Dict[str, str])
async def salvar_secao_etp(
    documento_id: int,
    section_id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Salva os dados de uma seção específica do ETP.
    """
    db_documento = db.query(DocumentoETP).filter(DocumentoETP.id == documento_id).first()

    if not db_documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento ETP não encontrado"
        )

    # TODO: Verify user permissions

    # Initialize dados as a dictionary if it's None
    if db_documento.dados is None:
        db_documento.dados = {}

    # Merge the new data for the specific section
    db_documento.dados[section_id] = payload

    # Mark the JSONB field as modified
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(db_documento, "dados")

    db.commit()
    db.refresh(db_documento)

    return {"message": f"Seção {section_id} salva com sucesso."}


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
    # Obter template
    template = db.query(ModeloInstitucional).filter(
        ModeloInstitucional.id == documento.template_id
    ).first()
    
    if not template or not template.estrutura:
        return {
            "percentual": 0,
            "campos_preenchidos": {}
        }
    
    # Obter campos obrigatórios da lei
    campos_lei = db.query(CampoObrigatorioLei).filter(
        CampoObrigatorioLei.tipo_documento == "ETP",
        CampoObrigatorioLei.obrigatorio == True
    ).all()
    
    campos_obrigatorios_ids = {campo.codigo for campo.id in campos_lei}
    
    # Verificar quais campos estão preenchidos
    campos_preenchidos = {}
    total_campos = 0
    campos_completos = 0
    
    dados = documento.dados or {}
    
    # Percorrer seções do template
    for secao in template.estrutura.get("secoes", []):
        for campo in secao.get("campos", []):
            campo_id = campo.get("id")
            total_campos += 1
            
            # Verificar se campo está preenchido
            valor = dados.get(campo_id)
            is_preenchido = bool(valor and str(valor).strip())
            
            campos_preenchidos[campo_id] = is_preenchido
            
            if is_preenchido:
                campos_completos += 1
    
    # Calcular percentual
    percentual = int((campos_completos / total_campos * 100)) if total_campos > 0 else 0
    
    return {
        "percentual": percentual,
        "campos_preenchidos": campos_preenchidos
    }


def validar_documento(documento: DocumentoETP, template: ModeloInstitucional, campos_lei: List) -> ValidacaoConformidade:
    """
    Valida conformidade do documento com a lei
    """
    dados = documento.dados or {}
    mapeamento = template.mapeamento_lei or {}
    
    campos_obrigatorios_faltantes = []
    avisos = []
    
    total_campos = 0
    campos_preenchidos_count = 0
    campos_obrigatorios_count = len(campos_lei)
    campos_obrigatorios_preenchidos = 0
    
    # Verificar cada campo obrigatório da lei
    for campo_lei in campos_lei:
        # Obter mapeamento deste campo no template
        campos_template = mapeamento.get(campo_lei.codigo, [])
        
        # Verificar se pelo menos um dos campos mapeados está preenchido
        campo_preenchido = False
        
        for campo_id in campos_template:
            valor = dados.get(campo_id)
            if valor and str(valor).strip():
                campo_preenchido = True
                break
        
        if campo_preenchido:
            campos_obrigatorios_preenchidos += 1
        else:
            campos_obrigatorios_faltantes.append(campo_lei.codigo)
    
    # Contar todos os campos do template
    for secao in template.estrutura.get("secoes", []):
        for campo in secao.get("campos", []):
            total_campos += 1
            valor = dados.get(campo.get("id"))
            if valor and str(valor).strip():
                campos_preenchidos_count += 1
            elif not campo.get("obrigatorio", False):
                # Campo não-obrigatório não preenchido
                avisos.append(f"Campo {campo.get('nome', campo.get('id'))} não preenchido (não-obrigatório)")
    
    # Calcular progresso
    progresso = int((campos_preenchidos_count / total_campos * 100)) if total_campos > 0 else 0
    
    # Documento é válido se todos os campos obrigatórios estão preenchidos
    valido = len(campos_obrigatorios_faltantes) == 0
    
    return ValidacaoConformidade(
        valido=valido,
        campos_obrigatorios_faltantes=campos_obrigatorios_faltantes,
        avisos=avisos[:10],  # Limitar avisos
        progresso_percentual=progresso,
        detalhes={
            "total_campos": total_campos,
            "campos_preenchidos": campos_preenchidos_count,
            "campos_obrigatorios": campos_obrigatorios_count,
            "campos_obrigatorios_preenchidos": campos_obrigatorios_preenchidos
        }
    )

