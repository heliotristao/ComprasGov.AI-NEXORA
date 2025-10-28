from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_milvus.vectorstores import Milvus
import os


def ingest_document(file_path: str):
    """
    Ingests a PDF document into the Milvus vector store.

    Args:
        file_path: The path to the PDF file.
    """
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    docs = text_splitter.split_documents(documents)

    embeddings = OpenAIEmbeddings()

    vector_store = Milvus.from_documents(
        docs,
        embedding=embeddings,
        connection_args={"host": "milvus", "port": 19530},
        collection_name="rag_documents",
        drop_old=True,
    )
    return vector_store
