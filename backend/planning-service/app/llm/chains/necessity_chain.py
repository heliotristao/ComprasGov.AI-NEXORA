from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

def get_necessity_chain():
    """
    Creates and returns a LangChain chain specifically for generating the
    'Justification for the Need' section of a document.
    """
    prompt = PromptTemplate(
        template="""
            Você é um especialista em compras públicas no Brasil.
            Sua tarefa é gerar o texto para a seção 'Justificativa da Necessidade de Contratação' de um Estudo Técnico Preliminar (ETP).
            Com base na descrição do problema fornecida, elabore uma justificativa clara, concisa e bem fundamentada, abordando os seguintes pontos:
            1.  **Contextualização:** Apresente o problema que a contratação visa resolver.
            2.  **Impacto:** Descreva as consequências negativas de não realizar a contratação.
            3.  **Benefícios:** Destaque os benefícios e resultados positivos esperados com a solução.

            **Descrição do Problema:**
            {problem_description}

            **Justificativa da Necessidade de Contratação:**
        """,
        input_variables=["problem_description"],
    )
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7)
    return prompt | llm
