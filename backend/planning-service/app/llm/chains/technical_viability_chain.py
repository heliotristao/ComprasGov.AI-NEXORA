from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_milvus.vectorstores import Milvus
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


def get_technical_viability_chain():
    """
    Returns a LangChain chain that generates a technical viability analysis
    for a given problem description, using a RAG setup.
    """
    template = """Você é um analista de sistemas sênior. Sua tarefa é redigir a seção 'Análise de Viabilidade Técnica' de um ETP.

Use o CONTEXTO ABAIXO, que contém documentação técnica e estudos de caso, para avaliar a viabilidade da solução proposta para o problema.

CONTEXTO:
{context}

PROBLEMA A SER RESOLVIDO:
{problem_description}

Análise de Viabilidade Técnica:
"""
    prompt = PromptTemplate.from_template(template)
    llm = ChatOpenAI(temperature=0.7, model_name="gpt-4")

    vector_store = Milvus(
        embedding_function=OpenAIEmbeddings(),
        connection_args={"host": "milvus", "port": 19530},
        collection_name="rag_documents",
    )
    retriever = vector_store.as_retriever()

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "problem_description": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain
