# NEXORA Planning Service

This service manages Plannings, ETPs (Estudo Técnico Preliminar), and TRs (Termo de Referência).

## Logging

This service uses a centralized structured logging mechanism that includes a `trace_id` for distributed tracing. The `trace_id` is propagated through the `X-Trace-ID` header.
