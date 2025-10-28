from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_milvus.vectorstores import Milvus

def get_technical_specs_chain():
    """
    Creates and returns a RAG-based LangChain chain for generating the
    'Technical Specifications' section of a Terms of Reference.
    """
    # 1. Create a retriever
    embeddings = OpenAIEmbeddings()
    vector_store = Milvus(
        embedding_function=embeddings,
        connection_args={"host": "milvus", "port": 19530},
        collection_name="rag_documents",
    )
    retriever = vector_store.as_retriever()

    # 2. Update the Prompt Template
    prompt_template = """
    Você é um engenheiro especialista em elaborar Termos de Referência. Sua tarefa é redigir a seção 'Especificações Técnicas' para o objeto descrito.

    Use o CONTEXTO ABAIXO, que contém normas técnicas e catálogos de produtos, para criar especificações detalhadas, objetivas e não restritivas.

    CONTEXTO:
    {context}

    OBJETO DA CONTRATAÇÃO (derivado do ETP):
    {object_description}

    Especificações Técnicas Detalhadas:
    """

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "object_description"]
    )

    # 3. Define the LLM
    llm = ChatOpenAI(temperature=0.3, model_name="gpt-4o")

    # 4. Refactor the Chain for RAG using LCEL
    rag_chain = (
        {"context": retriever, "object_description": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain
