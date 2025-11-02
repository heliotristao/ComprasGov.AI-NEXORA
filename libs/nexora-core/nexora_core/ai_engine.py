import os
import redis
from openai import OpenAI
import google.generativeai as genai
import logging
import json
import uuid
import hashlib
from typing import List, Optional, TypedDict

class GenerationResult(TypedDict):
    response: str
    provider: Optional[str]
    cost: Optional[float]
    trace_id: str
    confidence_score: Optional[float]

# Simple pricing map for OpenAI models (cost per 1M tokens)
OPENAI_PRICING = {
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "gpt-4": {"input": 30.00, "output": 60.00},
}

# Configure logging
handler = logging.StreamHandler()
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)
logger = logging.getLogger('AIEngine')
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class AIEngine:
    def __init__(self, provider_priority: List[str] = ['openai', 'gemini']):
        self.providers = {}
        if os.environ.get("OPENAI_API_KEY"):
            self.providers['openai'] = self._init_openai()
        if os.environ.get("GEMINI_API_KEY"):
            self.providers['gemini'] = self._init_gemini()

        self.redis_client = None
        if os.environ.get("REDIS_URL"):
            self.redis_client = redis.from_url(os.environ.get("REDIS_URL"))

        self.provider_priority = [p for p in provider_priority if p in self.providers]

    def _init_openai(self):
        return OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def _init_gemini(self):
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        return genai.GenerativeModel('gemini-pro')

    def _log(self, event: str, trace_id: str, provider: Optional[str] = None, cache_hit: Optional[bool] = None, error: Optional[str] = None, cost: Optional[float] = None):
        log_entry = {
            "event": event,
            "trace_id": trace_id,
            "provider": provider,
            "cache_hit": cache_hit,
            "error": error,
            "cost": cost
        }
        logger.info(json.dumps({k: v for k, v in log_entry.items() if v is not None}))

    def generate(self, prompt: str, provider: str = "auto", **kwargs) -> GenerationResult:
        trace_id = str(uuid.uuid4())
        cache_key = hashlib.sha256(prompt.encode('utf-8')).hexdigest()

        if self.redis_client:
            cached_response_json = self.redis_client.get(cache_key)
            if cached_response_json:
                self._log("cache.hit", trace_id=trace_id, cache_hit=True)
                cached_response = json.loads(cached_response_json)
                return GenerationResult(**cached_response)

        self._log("cache.miss", trace_id=trace_id, cache_hit=False)

        providers_to_try = self.provider_priority if provider == "auto" else [provider]
        last_error = None

        for p in providers_to_try:
            if p not in self.providers:
                continue

            try:
                self._log("api.call.start", trace_id=trace_id, provider=p)
                cost = None
                response = None
                confidence_score = None

                if p == 'openai':
                    response, cost = self._generate_openai(prompt, **kwargs)
                elif p == 'gemini':
                    response = self._generate_gemini(prompt, **kwargs)

                result = GenerationResult(
                    response=response,
                    provider=p,
                    cost=cost,
                    trace_id=trace_id,
                    confidence_score=confidence_score,
                )

                if self.redis_client:
                    self.redis_client.set(cache_key, json.dumps(result), ex=3600)

                self._log("api.call.success", trace_id=trace_id, provider=p, cost=cost)
                return result
            except Exception as e:
                last_error = str(e)
                self._log("api.call.error", trace_id=trace_id, provider=p, error=last_error)
                if provider != "auto":
                    break

        raise Exception(f"All AI providers failed. Last error: {last_error}")

    def _generate_openai(self, prompt: str, **kwargs) -> (str, float):
        model = kwargs.get("model", "gpt-3.5-turbo")
        completion = self.providers['openai'].chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        # Calculate cost
        cost = 0.0
        if completion.usage and model in OPENAI_PRICING:
            pricing = OPENAI_PRICING[model]
            prompt_cost = (completion.usage.prompt_tokens / 1_000_000) * pricing["input"]
            completion_cost = (completion.usage.completion_tokens / 1_000_000) * pricing["output"]
            cost = prompt_cost + completion_cost

        return completion.choices[0].message.content, cost

    def _generate_gemini(self, prompt: str, **kwargs) -> str:
        response = self.providers['gemini'].generate_content(prompt)
        return response.text
