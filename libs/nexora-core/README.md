# nexora-core

Core utilities for the Nexora platform.

## AIEngine

The `AIEngine` provides a unified interface for interacting with multiple AI providers, with built-in fallback and caching capabilities.

### Configuration

The `AIEngine` is configured through environment variables:

- `OPENAI_API_KEY`: Your API key for OpenAI.
- `GEMINI_API_KEY`: Your API key for Google Gemini.
- `REDIS_URL`: The URL for your Redis instance (e.g., `redis://localhost:6379/0`).

### Usage

Here's a simple example of how to use the `AIEngine`:

```python
from nexora_core.ai_engine import AIEngine

# Create an instance of the AI engine
ai_engine = AIEngine(provider_priority=['openai', 'gemini'])

# Generate text using the auto provider selection
response = ai_engine.generate("Hello, world!")
print(response)

# Generate text using a specific provider
response = ai_engine.generate("Hello, world!", provider="openai")
print(response)
```
