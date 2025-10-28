import os
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from dotenv import load_dotenv

load_dotenv()

def get_solution_comparison_chain():
    """
    Creates and returns a LangChain LLMChain specialized in generating
    a 'Comparative Analysis of Solutions' section for a Preliminary Technical Study (ETP).
    """
    prompt_template = """
    Você é um consultor sênior em contratações públicas no Brasil. Sua tarefa é redigir a seção 'Análise Comparativa de Soluções' de um Estudo Técnico Preliminar (ETP).

    Com base na descrição do problema abaixo, analise pelo menos 3 soluções possíveis, comparando seus prós e contras. A análise deve ser formal e técnica.

    Problema a ser resolvido: {problem_description}

    Análise Comparativa de Soluções:
    """

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["problem_description"]
    )

    # Ensure the OPENAI_API_KEY is available
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set.")

    llm = ChatOpenAI(api_key=openai_api_key, model_name="gpt-4o", temperature=0.3)

    chain = LLMChain(llm=llm, prompt=prompt)
    return chain
