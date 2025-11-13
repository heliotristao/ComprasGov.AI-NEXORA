from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any, Dict

try:
    from aiokafka import AIOKafkaProducer
except Exception:  # pragma: no cover - fallback when aiokafka isn't installed
    AIOKafkaProducer = None

logger = logging.getLogger(__name__)
_producer: AIOKafkaProducer | None = None
_lock = asyncio.Lock()


async def _get_producer() -> AIOKafkaProducer | None:
    global _producer
    if AIOKafkaProducer is None:
        return None

    broker_url = os.getenv("KAFKA_BROKER_URL")
    if not broker_url:
        return None

    async with _lock:
        if _producer is None:
            producer = AIOKafkaProducer(bootstrap_servers=broker_url)
            await producer.start()
            _producer = producer
    return _producer


async def publish_event(topic: str, payload: Dict[str, Any]) -> None:
    """Publica eventos no Kafka ou registra em log quando indisponível."""
    producer = await _get_producer()
    if producer is None:
        logger.info("Kafka indisponível. Evento %s armazenado em log: %s", topic, payload)
        return

    message = json.dumps(payload).encode("utf-8")
    await producer.send_and_wait(topic, message)
