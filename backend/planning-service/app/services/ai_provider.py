import os
from langchain_openai import ChatOpenAI
# from langchain_vertexai import VertexAI
from dotenv import load_dotenv

load_dotenv()


class AIProvider:
    def __init__(self, client, provider_name: str, model_name: str):
        self.client = client
        self.provider_name = provider_name
        self.model_name = model_name

    def get_client(self):
        return self.client

    def get_provider_name(self):
        return self.provider_name

    def get_model_name(self):
        return self.model_name


def get_ai_provider():
    """
    Gets the configured AI provider.

    Returns:
        An instance of the AI provider.
    """
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        client = ChatOpenAI(api_key=openai_api_key)
        return AIProvider(client=client, provider_name="OpenAI", model_name="gpt-4")

    # vertex_api_key = os.getenv("VERTEX_API_KEY")
    # if vertex_api_key:
    #     client = VertexAI()
    #     return AIProvider(client=client, provider_name="VertexAI", model_name="gemini-pro")

    raise ValueError("No AI provider API key found in environment variables.")
