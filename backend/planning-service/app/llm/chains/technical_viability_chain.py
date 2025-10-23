from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

def get_technical_viability_chain():
    """
    Returns a LangChain chain that generates a technical viability analysis
    for a given problem description.
    """
    prompt = PromptTemplate(
        input_variables=["problem_description"],
        template="""Você é um arquiteto de soluções e especialista em análise de risco técnico em projetos governamentais. Sua tarefa é redigir a seção 'Análise de Viabilidade Técnica' de um Estudo Técnico Preliminar (ETP).

Com base na descrição da solução proposta abaixo, avalie sua viabilidade técnica. Considere os requisitos tecnológicos, a maturidade da tecnologia e os desafios de implementação.

Solução Proposta: {problem_description}

Análise de Viabilidade Técnica:
"""
    )

    llm = ChatOpenAI(temperature=0.7, model_name="gpt-4")
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain
