from sqlalchemy.orm import Session
from app.crud.crud_documento_etp import get_documento_etp
from app.crud.crud_etp_ai_trace import create_trace
from app.llm.chains.etp_field_chain import generate_field_content
from app.services.ai_provider import get_ai_provider
from app.schemas.etp_ai_trace_schemas import ETPAITraceCreate


def generate_field(db: Session, *, etp_id: int, field: str) -> dict:
    """
    Generates content for a specific ETP field, orchestrating the process.

    Args:
        db: The database session.
        etp_id: The ID of the ETP document.
        field: The name of the field to generate content for.

    Returns:
        A dictionary containing the generated content and trace information.
    """
    # 1. Busca o ETP
    etp = get_documento_etp(db, etp_id=etp_id)
    if not etp:
        raise ValueError(f"ETP with id {etp_id} not found.")

    # 2. Obtém o provedor de IA
    provider = get_ai_provider()
    llm = provider.get_client()

    # 3. Chama a cadeia de geração
    generation_result = generate_field_content(llm=llm, field=field, etp_data=etp.dados)

    # 4. Salva o resultado na tabela etp_ai_traces
    trace_in = ETPAITraceCreate(
        etp_id=etp_id,
        field=field,
        prompt=generation_result["prompt"],
        response=generation_result["response"],
        confidence=generation_result["confidence"],
        provider=provider.get_provider_name(),
        model=provider.get_model_name(),
    )
    create_trace(db, trace_in=trace_in)

    # 5. Retorna o resultado da geração para a API
    return {
        "generated_content": generation_result["response"],
        "provider": provider.get_provider_name(),
        "confidence": generation_result["confidence"],
    }
