from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

def get_technical_specs_chain():
    """
    Creates and returns a LangChain chain specifically for generating the
    'Technical Specifications of the Object' section of a Terms of Reference.
    """
    prompt_template = """
    Você é um engenheiro especialista em elaborar Termos de Referência para o governo brasileiro.
    Sua tarefa é redigir a seção 'Especificações Técnicas do Objeto' com base na descrição da necessidade.

    As especificações devem ser claras, objetivas, mensuráveis e não podem direcionar para uma marca ou fornecedor específico.
    Formate a saída como uma lista numerada.

    Necessidade a ser atendida: {problem_description}

    Especificações Técnicas do Objeto:
    """

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["problem_description"]
    )

    llm = ChatOpenAI(temperature=0.3, model_name="gpt-4o")

    chain = LLMChain(llm=llm, prompt=prompt)

    return chain
