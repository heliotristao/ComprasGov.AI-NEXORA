import asyncio
import json
import logging
import os
from typing import Any, Dict, Iterable, Optional

try:
    from aiokafka import AIOKafkaProducer  # type: ignore
except ModuleNotFoundError:  # pragma: no cover - fallback for test environments
    AIOKafkaProducer = None  # type: ignore

logger = logging.getLogger(__name__)


def _normalize_bootstrap_servers(raw: Optional[str]) -> Optional[Iterable[str]]:
    if not raw:
        return None
    return [server.strip() for server in raw.split(",") if server.strip()]


class KafkaEventManager:
    """Manage a shared Kafka producer for the planning service."""

    def __init__(self) -> None:
        self._producer: Optional[AIOKafkaProducer] = None
        self._bootstrap_servers = _normalize_bootstrap_servers(
            os.getenv("KAFKA_BOOTSTRAP_SERVERS")
        )
        self._lock = asyncio.Lock()

    @property
    def enabled(self) -> bool:
        return bool(self._bootstrap_servers)

    async def start(self) -> None:
        if AIOKafkaProducer is None:
            logger.warning("aiokafka is not installed; skipping producer startup")
            return

        if not self.enabled:
            logger.info("Kafka bootstrap servers not configured; skipping producer startup")
            return

        async with self._lock:
            if self._producer is not None:
                return

            self._producer = AIOKafkaProducer(
                bootstrap_servers=list(self._bootstrap_servers),
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            try:
                await self._producer.start()
                logger.info("Kafka producer connected", extra={"bootstrap_servers": self._bootstrap_servers})
            except Exception:
                self._producer = None
                logger.exception("Unable to start Kafka producer")
                raise

    async def stop(self) -> None:
        async with self._lock:
            if self._producer is None:
                return
            try:
                await self._producer.stop()
                logger.info("Kafka producer disconnected")
            finally:
                self._producer = None

    async def publish(self, topic: str, payload: Dict[str, Any]) -> None:
        if self._producer is None:
            logger.warning(
                "Kafka producer not initialized; event dropped",
                extra={"topic": topic},
            )
            return

        try:
            await self._producer.send_and_wait(topic, payload)
            logger.debug("Event published", extra={"topic": topic})
        except Exception:
            logger.exception("Failed to publish event", extra={"topic": topic})
            raise


kafka_manager = KafkaEventManager()
