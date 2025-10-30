import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        trace_id = str(uuid.uuid4())

        response = await call_next(request)

        duration = (time.time() - start_time) * 1000

        log_data = {
            "trace_id": trace_id,
            "ip": request.client.host,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": f"{duration:.2f}",
        }

        logger.info(json.dumps(log_data))

        return response
