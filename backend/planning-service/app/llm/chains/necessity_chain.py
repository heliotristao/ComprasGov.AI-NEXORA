import os
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

load_dotenv()

def get_necessity_chain() -> LLMChain:
    """
    Creates a LangChain chain specifically for generating the "Justificativa da Necessidade" section of an ETP.

    Returns:
        An LLMChain configured with a prompt template and the ChatOpenAI model.
    """
    prompt_template = """Você é um especialista em licitações públicas no Brasil. Sua tarefa é redigir a seção 'Justificativa da Necessidade' de um Estudo Técnico Preliminar (ETP) com base na descrição do problema fornecida. O texto deve ser formal, claro e convincente.

Problema a ser resolvido: {problem_description}

Justificativa da Necessidade:"""

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["problem_description"]
    )

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set.")

    llm = ChatOpenAI(api_key=openai_api_key, model_name="gpt-3.5-turbo", temperature=0.7)

    chain = LLMChain(llm=llm, prompt=prompt)

    return chain
