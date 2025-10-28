import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

def generate_text(prompt: str) -> str:
    """
    Generates text using the OpenAI API.

    Args:
        prompt: The prompt to use for text generation.

    Returns:
        The generated text.
    """
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set.")

    llm = ChatOpenAI(api_key=openai_api_key)
    response = llm.invoke(prompt)
    return response.content
