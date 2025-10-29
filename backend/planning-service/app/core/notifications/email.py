"""Email notification helpers."""
from __future__ import annotations

import logging
from typing import Iterable

logger = logging.getLogger(__name__)


def send_email_notification(recipients: Iterable[str], subject: str, body: str) -> None:
    """Stub email sender that logs notification payload."""
    recipient_list = ", ".join(recipients)
    logger.info("Email notification to %s | %s", recipient_list, subject)
    logger.debug("Email body: %s", body)
