class TraceNotFoundException(Exception):
    """Custom exception for when a trace_id is not found or doesn't match."""

    pass


class ETPNotFoundException(Exception):
    """Custom exception for when an ETP is not found."""

    pass
