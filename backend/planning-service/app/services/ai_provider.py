"""
Provedor de IA com fallback automático
Tenta OpenAI primeiro, depois Gemini se houver problemas
"""

import os
import time
from typing import Dict, Any, Optional
from openai import OpenAI
import google.generativeai as genai


class AIProvider:
    """
    Provedor unificado de IA com fallback automático
    """
    
    def __init__(self):
        # Configurar OpenAI
        self.openai_client = None
        if os.getenv("OPENAI_API_KEY"):
            try:
                self.openai_client = OpenAI(
                    api_key=os.getenv("OPENAI_API_KEY"),
                    base_url=os.getenv("OPENAI_API_BASE")
                )
            except Exception as e:
                print(f"Erro ao inicializar OpenAI: {e}")
        
        # Configurar Gemini
        self.gemini_client = None
        if os.getenv("GEMINI_API_KEY"):
            try:
                genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
                self.gemini_client = genai.GenerativeModel('gemini-2.0-flash-exp')
            except Exception as e:
                print(f"Erro ao inicializar Gemini: {e}")
    
    async def generate_text(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        Gera texto usando IA com fallback automático
        
        Args:
            prompt: Prompt para geração
            system_message: Mensagem de sistema (opcional)
            temperature: Temperatura (0-1)
            max_tokens: Máximo de tokens
        
        Returns:
            Dict com conteúdo gerado e metadados
        """
        start_time = time.time()
        
        # Tentar OpenAI primeiro
        if self.openai_client:
            try:
                result = await self._generate_openai(
                    prompt, system_message, temperature, max_tokens
                )
                result["provider"] = "openai"
                result["tempo_geracao"] = time.time() - start_time
                return result
            except Exception as e:
                print(f"OpenAI falhou, tentando Gemini: {e}")
        
        # Fallback para Gemini
        if self.gemini_client:
            try:
                result = await self._generate_gemini(
                    prompt, system_message, temperature, max_tokens
                )
                result["provider"] = "gemini"
                result["tempo_geracao"] = time.time() - start_time
                return result
            except Exception as e:
                print(f"Gemini também falhou: {e}")
                raise Exception("Nenhum provedor de IA disponível")
        
        raise Exception("Nenhum provedor de IA configurado")
    
    async def _generate_openai(
        self,
        prompt: str,
        system_message: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> Dict[str, Any]:
        """
        Gera texto usando OpenAI
        """
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        content = response.choices[0].message.content
        tokens = response.usage.total_tokens
        
        # Calcular score de confiança baseado no finish_reason
        score_confianca = 0.95 if response.choices[0].finish_reason == "stop" else 0.75
        
        return {
            "conteudo_gerado": content,
            "score_confianca": score_confianca,
            "tokens_utilizados": tokens
        }
    
    async def _generate_gemini(
        self,
        prompt: str,
        system_message: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> Dict[str, Any]:
        """
        Gera texto usando Gemini
        """
        # Combinar system message com prompt
        full_prompt = prompt
        if system_message:
            full_prompt = f"{system_message}\n\n{prompt}"
        
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens
        )
        
        response = self.gemini_client.generate_content(
            full_prompt,
            generation_config=generation_config
        )
        
        content = response.text
        
        # Gemini não retorna contagem de tokens facilmente
        # Estimativa aproximada: 1 token ≈ 4 caracteres
        tokens_estimados = len(content) // 4
        
        # Score de confiança baseado na resposta
        score_confianca = 0.90 if content and len(content) > 50 else 0.70
        
        return {
            "conteudo_gerado": content,
            "score_confianca": score_confianca,
            "tokens_utilizados": tokens_estimados
        }


# Singleton global
_ai_provider = None

def get_ai_provider() -> AIProvider:
    """
    Retorna instância singleton do provedor de IA
    """
    global _ai_provider
    if _ai_provider is None:
        _ai_provider = AIProvider()
    return _ai_provider

