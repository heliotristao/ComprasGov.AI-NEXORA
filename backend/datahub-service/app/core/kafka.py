import asyncio
import json
import logging
import os
from contextlib import suppress
from typing import Any, Awaitable, Callable, Dict, Iterable, Optional

try:
    from aiokafka import AIOKafkaConsumer  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    AIOKafkaConsumer = None  # type: ignore

logger = logging.getLogger(__name__)

EventHandler = Callable[[str, Dict[str, Any]], Awaitable[None]]


def _normalize_bootstrap_servers(raw: Optional[str]) -> Optional[Iterable[str]]:
    if not raw:
        return None
    return [server.strip() for server in raw.split(",") if server.strip()]


class KafkaConsumerManager:
    """Background Kafka consumer with graceful shutdown support."""

    def __init__(
        self,
        topics: Iterable[str],
        handler: EventHandler,
        *,
        group_id: str,
    ) -> None:
        self._topics = list(topics)
        self._handler = handler
        self._group_id = group_id
        self._bootstrap_servers = _normalize_bootstrap_servers(
            os.getenv("KAFKA_BOOTSTRAP_SERVERS")
        )
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._task: Optional[asyncio.Task[None]] = None
        self._lock = asyncio.Lock()
        self._stopping = asyncio.Event()

    @property
    def enabled(self) -> bool:
        return bool(self._bootstrap_servers)

    async def start(self) -> None:
        if AIOKafkaConsumer is None:
            logger.warning("aiokafka is not installed; skipping consumer startup")
            return

        if not self.enabled:
            logger.info("Kafka bootstrap servers not configured; skipping consumer startup")
            return

        async with self._lock:
            if self._consumer is not None:
                return

            self._consumer = AIOKafkaConsumer(
                *self._topics,
                bootstrap_servers=list(self._bootstrap_servers),
                group_id=self._group_id,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                enable_auto_commit=False,
            )
            try:
                await self._consumer.start()
                self._stopping.clear()
                self._task = asyncio.create_task(self._consume())
                logger.info(
                    "Kafka consumer connected",
                    extra={"topics": self._topics, "group_id": self._group_id},
                )
            except Exception:
                self._consumer = None
                logger.exception("Unable to start Kafka consumer")
                raise

    async def stop(self) -> None:
        async with self._lock:
            self._stopping.set()
            if self._task:
                self._task.cancel()
                with suppress(asyncio.CancelledError):
                    await self._task
                self._task = None

            if self._consumer:
                try:
                    await self._consumer.stop()
                    logger.info("Kafka consumer disconnected")
                finally:
                    self._consumer = None

    async def _consume(self) -> None:
        assert self._consumer is not None
        try:
            async for message in self._consumer:
                try:
                    await self._handler(message.topic, message.value)
                    await self._consumer.commit()
                except Exception:
                    logger.exception(
                        "Failed to process Kafka message",
                        extra={"topic": message.topic},
                    )
        except asyncio.CancelledError:
            logger.debug("Kafka consumer task cancelled")
        finally:
            self._stopping.set()


kafka_consumer_manager: Optional[KafkaConsumerManager] = None


def configure_consumer(topics: Iterable[str], handler: EventHandler, *, group_id: str) -> None:
    global kafka_consumer_manager
    kafka_consumer_manager = KafkaConsumerManager(topics, handler, group_id=group_id)


def get_consumer_manager() -> Optional[KafkaConsumerManager]:
    return kafka_consumer_manager
