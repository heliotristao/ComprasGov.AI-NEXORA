from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Dict, List

import fitz  # PyMuPDF
import spacy
from spacy.matcher import Matcher

logger = logging.getLogger(__name__)

_CLAUSE_KEYWORDS = {
    "vigencia": [
        "vigência",
        "vigencia",
        "prazo de vigência",
        "duração do contrato",
        "prazo contratual",
    ],
    "preco": [
        "preço",
        "preco",
        "valor do contrato",
        "montante",
        "pagamento",
    ],
    "reajuste": [
        "reajuste",
        "reajustamento",
        "correção monetária",
        "índice de reajuste",
    ],
    "penalidade": [
        "penalidade",
        "penalidades",
        "multa",
        "multas",
        "sanção",
        "sanções",
    ],
    "obrigacao": [
        "obrigação",
        "obrigações",
        "responsabilidade",
        "responsabilidades",
        "deveres",
    ],
}

_DEFAULT_CLAUSE_TYPE = "outras"
_SECTION_SPLIT_REGEX = re.compile(r"\n{2,}")


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extrai texto de um arquivo PDF usando PyMuPDF."""

    if not pdf_bytes:
        raise ValueError("O conteúdo do PDF está vazio.")

    try:
        document = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:  # pragma: no cover - defensive branch
        raise ValueError("Não foi possível abrir o arquivo PDF informado.") from exc

    try:
        text_chunks: list[str] = []
        for page in document:
            text_chunks.append(page.get_text("text"))
    finally:
        document.close()

    return "\n".join(chunk.strip() for chunk in text_chunks if chunk and chunk.strip())


@lru_cache(maxsize=1)
def _load_nlp() -> spacy.language.Language:
    try:
        return spacy.load("pt_core_news_lg")
    except OSError:
        logger.warning(
            "Modelo pt_core_news_lg não disponível. Utilizando pipeline spaCy vazia e fallback baseado em regex.",
        )
        return spacy.blank("pt")


@lru_cache(maxsize=1)
def _build_matcher() -> Matcher:
    nlp = _load_nlp()
    matcher = Matcher(nlp.vocab)

    for clause_type, keywords in _CLAUSE_KEYWORDS.items():
        for keyword in keywords:
            tokens = [token for token in keyword.lower().split() if token]
            if not tokens:
                continue
            pattern = [{"LOWER": token} for token in tokens]
            matcher.add(clause_type, [pattern])

    return matcher


def _keyword_fallback(section: str) -> str | None:
    lowered = section.lower()
    for clause_type, keywords in _CLAUSE_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return clause_type
    return None


def classify_clauses(text: str) -> List[Dict[str, str]]:
    """Classifica cláusulas contratuais em categorias pré-definidas."""

    if not text.strip():
        return []

    nlp = _load_nlp()
    matcher = _build_matcher()

    sections = [section.strip() for section in _SECTION_SPLIT_REGEX.split(text) if section.strip()]
    clauses: list[dict[str, str]] = []

    for section in sections:
        doc = nlp(section)
        matches = matcher(doc)
        clause_type = _DEFAULT_CLAUSE_TYPE

        if matches:
            # Seleciona o primeiro match encontrado para determinar o tipo
            match_id, *_ = matches[0]
            clause_type = nlp.vocab.strings[match_id]
        else:
            fallback_type = _keyword_fallback(section)
            if fallback_type:
                clause_type = fallback_type

        clauses.append({"descricao": section, "tipo": clause_type})

    return clauses
