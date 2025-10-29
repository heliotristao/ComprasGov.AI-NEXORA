from langchain.prompts import PromptTemplate
from langchain_core.runnables import Runnable
from langchain_core.output_parsers import JsonOutputParser
import json

# A dictionary of prompt templates for different ETP fields
PROMPT_TEMPLATES = {
    "justificativa": PromptTemplate.from_template(
        """
        Você é um especialista em aquisições públicas no Brasil. Baseado nos seguintes dados de um Estudo Técnico Preliminar (ETP), gere uma justificativa clara e concisa para a contratação.
        Dados do ETP: {etp_data}

        Sua resposta deve ser um objeto JSON com duas chaves: "response" e "confidence".
        - "response": O texto da justificativa.
        - "confidence": Um número de 0 a 1 indicando sua confiança na qualidade da justificativa gerada.
        """
    ),
    "necessidade": PromptTemplate.from_template(
        """
        Você é um especialista em aquisições públicas no Brasil. Com base nos dados do Estudo Técnico Preliminar (ETP) abaixo, descreva a necessidade da contratação.
        Dados do ETP: {etp_data}

        Sua resposta deve ser um objeto JSON com duas chaves: "response" e "confidence".
        - "response": O texto descrevendo a necessidade.
        - "confidence": Um número de 0 a 1 indicando sua confiança na qualidade da descrição gerada.
        """
    ),
    "objeto": PromptTemplate.from_template(
        """
        Você é um especialista em aquisições públicas no Brasil. Analise os dados do Estudo Técnico Preliminar (ETP) a seguir e defina o objeto da contratação de forma precisa.
        Dados do ETP: {etp_data}

        Sua resposta deve ser um objeto JSON com duas chaves: "response" e "confidence".
        - "response": O texto que define o objeto.
        - "confidence": Um número de 0 a 1 indicando sua confiança na qualidade da definição gerada.
        """
    ),
}


def generate_field_content(llm: Runnable, field: str, etp_data: dict) -> dict:
    """
    Generates content for a specific ETP field using an AI provider.

    Args:
        llm: The AI provider client (e.g., ChatOpenAI).
        field: The name of the field to generate content for.
        etp_data: The data from the ETP document.

    Returns:
        A dictionary containing the prompt, response, and confidence score.
    """
    if field not in PROMPT_TEMPLATES:
        raise ValueError(f"No prompt template found for field: {field}")

    prompt_template = PROMPT_TEMPLATES[field]
    parser = JsonOutputParser()
    chain = prompt_template | llm | parser

    # Ensure etp_data is a JSON string for the prompt
    etp_data_str = json.dumps(etp_data, ensure_ascii=False)

    prompt = prompt_template.format(etp_data=etp_data_str)
    result = chain.invoke({"etp_data": etp_data_str})

    return {
        "prompt": prompt,
        "response": result.get("response"),
        "confidence": result.get("confidence"),
    }
