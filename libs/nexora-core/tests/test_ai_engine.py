import unittest
from unittest.mock import patch, MagicMock
import os
from nexora_core.ai_engine import AIEngine
import hashlib

class TestAIEngine(unittest.TestCase):

    @patch('nexora_core.ai_engine.OpenAI')
    def test_openai_provider_success(self, MockOpenAI):
        mock_client = MockOpenAI.return_value
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "OpenAI response"
        mock_completion.usage.prompt_tokens = 10
        mock_completion.usage.completion_tokens = 20
        mock_client.chat.completions.create.return_value = mock_completion

        with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_key", "GEMINI_API_KEY": ""}):
            ai_engine = AIEngine(provider_priority=['openai'])
            response = ai_engine.generate("test prompt", provider="openai")

        self.assertEqual(response, "OpenAI response")

    @patch('nexora_core.ai_engine.genai')
    def test_gemini_provider_success(self, mock_gemini):
        mock_response = MagicMock()
        mock_response.text = "Gemini response"
        mock_gemini.GenerativeModel.return_value.generate_content.return_value = mock_response

        with patch.dict(os.environ, {"OPENAI_API_KEY": "", "GEMINI_API_KEY": "fake_key"}):
            ai_engine = AIEngine(provider_priority=['gemini'])
            response = ai_engine.generate("test prompt", provider="gemini")
            self.assertEqual(response, "Gemini response")

    @patch('nexora_core.ai_engine.redis')
    @patch('hashlib.sha256')
    def test_cache_hit(self, mock_sha256, mock_redis):
        mock_sha256.return_value.hexdigest.return_value = "cache_key"
        mock_redis.from_url.return_value.get.return_value = b"cached response"
        with patch.dict(os.environ, {"REDIS_URL": "redis://fake"}):
            ai_engine = AIEngine()
            response = ai_engine.generate("test prompt")
            self.assertEqual(response, "cached response")
            ai_engine.redis_client.get.assert_called_once_with("cache_key")

    @patch('nexora_core.ai_engine.redis')
    @patch('nexora_core.ai_engine.OpenAI')
    @patch('hashlib.sha256')
    def test_cache_miss(self, mock_sha256, MockOpenAI, mock_redis):
        mock_sha256.return_value.hexdigest.return_value = "cache_key"
        mock_redis.from_url.return_value.get.return_value = None

        mock_client = MockOpenAI.return_value
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "fresh response"
        mock_completion.usage.prompt_tokens = 10
        mock_completion.usage.completion_tokens = 20
        mock_client.chat.completions.create.return_value = mock_completion

        with patch.dict(os.environ, {"REDIS_URL": "redis://fake", "OPENAI_API_KEY": "fake_key", "GEMINI_API_KEY": ""}):
            ai_engine = AIEngine(provider_priority=['openai'])
            response = ai_engine.generate("test prompt")
            self.assertEqual(response, "fresh response")
            ai_engine.redis_client.get.assert_called_once_with("cache_key")
            ai_engine.redis_client.set.assert_called_once_with("cache_key", "fresh response", ex=3600)

    @patch('nexora_core.ai_engine.genai')
    @patch('nexora_core.ai_engine.OpenAI')
    def test_fallback_logic(self, MockOpenAI, mock_gemini):
        MockOpenAI.return_value.chat.completions.create.side_effect = Exception("OpenAI failed")

        mock_response = MagicMock()
        mock_response.text = "Gemini fallback response"
        mock_gemini.GenerativeModel.return_value.generate_content.return_value = mock_response

        with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_key", "GEMINI_API_KEY": "fake_key"}):
            ai_engine = AIEngine(provider_priority=['openai', 'gemini'])
            response = ai_engine.generate("test prompt")
            self.assertEqual(response, "Gemini fallback response")

if __name__ == '__main__':
    unittest.main()
