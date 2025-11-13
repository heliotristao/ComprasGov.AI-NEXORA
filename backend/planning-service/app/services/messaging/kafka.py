"""Kafka publishing utilities used by the Risco.AI module."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any, Dict

try:
    from aiokafka import AIOKafkaProducer
except Exception:  # pragma: no cover - aiokafka might be unavailable in tests
    AIOKafkaProducer = None  # type: ignore

logger = logging.getLogger(__name__)

_PRODUCER: AIOKafkaProducer | None = None
_PRODUCER_LOCK = asyncio.Lock()


def _bootstrap_servers() -> list[str]:
    servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "")
    return [server.strip() for server in servers.split(",") if server.strip()]


async def _get_producer() -> AIOKafkaProducer | None:
    if AIOKafkaProducer is None:
        return None

    servers = _bootstrap_servers()
    if not servers:
        return None

    global _PRODUCER
    if _PRODUCER is not None:
        return _PRODUCER

    async with _PRODUCER_LOCK:
        if _PRODUCER is not None:
            return _PRODUCER

        loop = asyncio.get_running_loop()
        producer = AIOKafkaProducer(
            loop=loop,
            bootstrap_servers=servers,
            client_id=os.getenv("KAFKA_CLIENT_ID", "planning-service"),
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        )
        await producer.start()
        _PRODUCER = producer
        return _PRODUCER


async def publish_event(topic: str, payload: Dict[str, Any]) -> None:
    """Publishes an event to Kafka (if configured)."""

    producer = await _get_producer()
    if producer is None:
        logger.info(
            "Kafka producer not configured; skipping publish",
            extra={"topic": topic, "payload": payload},
        )
        return

    try:
        await producer.send_and_wait(topic, payload)
    except Exception as exc:  # pragma: no cover - network dependent
        logger.warning(
            "Failed to publish Kafka event", exc_info=exc, extra={"topic": topic}
        )


async def close_producer() -> None:
    """Gracefully closes the Kafka producer (mainly for shutdown hooks)."""

    global _PRODUCER
    if _PRODUCER is not None:
        await _PRODUCER.stop()
        _PRODUCER = None
