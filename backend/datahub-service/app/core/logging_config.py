import logging
from pythonjsonlogger import jsonlogger
from starlette.requests import Request
from contextvars import ContextVar

# Context variable to hold the trace_id
trace_id_var: ContextVar[str] = ContextVar("trace_id", default=None)

class TraceIdFilter(logging.Filter):
    def filter(self, record):
        record.trace_id = trace_id_var.get()
        return True

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Remove existing handlers to avoid duplicate logs
    if logger.hasHandlers():
        logger.handlers.clear()

    # Create a handler for console output
    logHandler = logging.StreamHandler()

    # Create a formatter and set it for the handler
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(trace_id)s %(message)s'
    )
    logHandler.setFormatter(formatter)

    # Add the filter and handler to the logger
    logger.addFilter(TraceIdFilter())
    logger.addHandler(logHandler)
