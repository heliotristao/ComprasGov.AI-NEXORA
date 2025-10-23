import os
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

load_dotenv()

_prompt_template = """
Você é um especialista em licitações públicas no Brasil. Sua tarefa é redigir a seção 'Justificativa da Necessidade' de um Estudo Técnico Preliminar (ETP) com base na descrição do problema fornecida. O texto deve ser formal, claro e convincente.

Problema a ser resolvido: {problem_description}

Justificativa da Necessidade:
"""

_prompt = PromptTemplate(
    template=_prompt_template,
    input_variables=["problem_description"]
)

_openai_api_key = os.getenv("OPENAI_API_KEY")
if not _openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

_llm = ChatOpenAI(api_key=_openai_api_key, temperature=0.7)

# Singleton instance of the chain, created once on module load.
necessity_chain = LLMChain(llm=_llm, prompt=_prompt)
