from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser

def get_risk_analysis_chain():
    """
    Creates and returns a LangChain chain specifically for generating a
    risk matrix based on a procurement description.
    """
    prompt = PromptTemplate(
        template="""
            Você é um especialista em gestão de riscos em contratações públicas no Brasil.
            Sua tarefa é identificar 5 riscos potenciais para a contratação descrita abaixo.

            Para cada risco, você deve fornecer:
            1. Uma descrição clara do risco (risk_description).
            2. A probabilidade de ocorrência (probability), classificada como "Baixa", "Média" ou "Alta".
            3. O impacto caso o risco ocorra (impact), classificado como "Baixo", "Médio" ou "Alto".
            4. Uma medida de mitigação sugerida (mitigation_measure).

            **Descrição da Contratação:**
            {description}

            **Instruções de Formato:**
            Retorne sua resposta como um objeto JSON contendo uma única chave "risks",
            que é uma lista de objetos, onde cada objeto representa um risco e contém
            as quatro chaves mencionadas acima (risk_description, probability, impact, mitigation_measure).

            **Exemplo de Saída:**
            {{
                "risks": [
                    {{
                        "risk_description": "Atraso na entrega dos equipamentos",
                        "probability": "Média",
                        "impact": "Alto",
                        "mitigation_measure": "Estabelecer cláusulas contratuais com multas por atraso e cronograma de entrega detalhado."
                    }}
                ]
            }}
        """,
        input_variables=["description"],
    )
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7)
    return prompt | llm | JsonOutputParser()
