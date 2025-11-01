# NEXORA DataHub Service

This service manages artifact storage, metadata, and semantic cataloging.

## Logging

This service uses a centralized structured logging mechanism that includes a `trace_id` for distributed tracing. The `trace_id` is propagated through the `X-Trace-ID` header.
