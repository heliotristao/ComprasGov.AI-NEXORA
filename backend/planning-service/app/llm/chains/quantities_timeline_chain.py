from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain


# 1. Define the Prompt Template
quantities_timeline_prompt_template = PromptTemplate(
    input_variables=["problem_description"],
    template=(
        "Você é um gerente de projetos especialista em planejamento de "
        "contratações públicas no Brasil. Sua tarefa é redigir a seção "
        "'Estimativa de Quantitativos e Cronograma de Execução' de um "
        "Estudo Técnico Preliminar (ETP).\n\n"
        "Com base na descrição do problema abaixo, proponha uma estrutura "
        "de entregas em formato de tabela (Markdown) com as colunas: "
        "'Etapa', 'Descrição da Atividade', 'Quantidade Estimada', e "
        "'Prazo (dias)'.\n\n"
        "Problema a ser resolvido: {problem_description}\n\n"
        "Estimativa de Quantitativos e Cronograma de Execução:\n"
    )
)


# 2. Create the Chain Function
def get_quantities_timeline_chain():
    """
    Retorna uma LLMChain configurada para gerar a seção
    'Quantitativos e Cronograma' de um ETP.
    """
    llm = ChatOpenAI(model_name="gpt-4-turbo", temperature=0.3)
    chain = LLMChain(llm=llm, prompt=quantities_timeline_prompt_template)
    return chain
