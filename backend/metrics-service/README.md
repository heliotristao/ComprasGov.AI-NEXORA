# Metrics Service

This service is responsible for calculating and exposing business KPIs.

## API Endpoints

### `GET /metrics/process-status`

Returns a count of ETPs/TRs by status (`draft`, `in_review`, `approved`).

**Response Body:**

```json
{
  "draft": 0,
  "in_review": 0,
  "approved": 0
}
```

### `GET /metrics/trend`

Returns a time series of the volume of processes created per month.

**Response Body:**

```json
{
  "labels": ["2023-01", "2023-02"],
  "values": [10, 20]
}
```

### `GET /metrics/savings`

Returns an estimated savings metric.

**Response Body:**

```json
{
  "estimated_savings": 0.0,
  "currency": "BRL"
}
```

### `GET /metrics`

Exposes the same metrics in the Prometheus format for monitoring.
