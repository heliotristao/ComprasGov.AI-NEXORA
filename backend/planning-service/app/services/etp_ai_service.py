from sqlalchemy.orm import Session
from langchain_core.runnables import Runnable, RunnableLambda

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

    get_client = getattr(provider, "get_client", None)
    if not callable(get_client):
        raise ValueError("AI provider does not expose a callable get_client method")

    llm_client = get_client()

    if isinstance(llm_client, Runnable):
        llm = llm_client
    elif callable(getattr(llm_client, "invoke", None)):
        llm = RunnableLambda(
            lambda data, *args, **kwargs: llm_client.invoke(data, *args, **kwargs)
        )
    elif callable(llm_client):
        llm = RunnableLambda(lambda data, *args, **kwargs: llm_client(data, *args, **kwargs))
    else:
        raise ValueError("AI provider client is not runnable")

    provider_name_getter = getattr(provider, "get_provider_name", None)
    provider_name = (
        provider_name_getter()
        if callable(provider_name_getter)
        else getattr(provider, "provider_name", "unknown")
    )

    model_name_getter = getattr(provider, "get_model_name", None)
    model_name = (
        model_name_getter()
        if callable(model_name_getter)
        else getattr(provider, "model_name", "unknown")
    )

    # 3. Chama a cadeia de geração
    generation_result = generate_field_content(llm=llm, field=field, etp_data=etp.dados)

    # 4. Salva o resultado na tabela etp_ai_traces
    trace_in = ETPAITraceCreate(
        etp_id=etp_id,
        field=field,
        prompt=generation_result.get("prompt", ""),
        response=generation_result.get("response", ""),
        confidence=generation_result.get("confidence"),
        provider=provider_name,
        model=model_name,
    )
    create_trace(db, trace_in=trace_in)

    # 5. Retorna o resultado da geração para a API
    return {
        "generated_content": generation_result.get("response"),
        "provider": provider_name,
        "confidence": generation_result.get("confidence"),
    }
