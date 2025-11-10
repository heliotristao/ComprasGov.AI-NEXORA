from __future__ import annotations

import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.repositories import ContractNotFoundError, ContractRepository
from app.schemas import ContractClauseRead
from app.services.contracts.clause_extractor import classify_clauses, extract_text_from_pdf
from app.db.session import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.post("/{contract_id}/extract-clauses", response_model=list[ContractClauseRead], status_code=HTTPStatus.CREATED)
async def extract_contract_clauses(
    contract_id: int,
    pdf_file: UploadFile = File(..., description="Arquivo PDF do contrato para processamento"),
    session: Session = Depends(get_session),
) -> list[ContractClauseRead]:
    """Extrai e classifica as cláusulas contratuais de um PDF, persistindo-as no banco."""

    if pdf_file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=HTTPStatus.UNSUPPORTED_MEDIA_TYPE, detail="O arquivo enviado deve ser um PDF.")

    file_bytes = await pdf_file.read()
    if not file_bytes:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="O arquivo enviado está vazio.")

    try:
        extracted_text = extract_text_from_pdf(file_bytes)
    except ValueError as exc:  # pragma: no cover - defensive branch
        logger.exception("Falha ao extrair texto do PDF")
        raise HTTPException(status_code=HTTPStatus.UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    if not extracted_text.strip():
        raise HTTPException(status_code=HTTPStatus.UNPROCESSABLE_ENTITY, detail="Não foi possível extrair texto do PDF enviado.")

    clauses = classify_clauses(extracted_text)
    if not clauses:
        raise HTTPException(
            status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
            detail="Nenhuma cláusula reconhecida foi encontrada no documento informado.",
        )

    repository = ContractRepository(session)
    try:
        persisted_clauses = repository.add_clauses(contract_id, clauses)
    except ContractNotFoundError as exc:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=str(exc)) from exc

    return [ContractClauseRead.model_validate(clause) for clause in persisted_clauses]
