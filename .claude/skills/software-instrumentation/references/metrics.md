# Metrics

Apply this reference when instrumenting or reviewing code that emits a metric — the third telemetry signal, alongside logs and traces. A metric is a number aggregated over time and sliced by a small set of labels: request rate, latency, error rate, queue depth, saturation. This file uses `metrics.count(...)` and `metrics.distribution(...)` for the emit call; substitute your project's metrics API (StatsD, OpenTelemetry metrics, a vendor SDK, or your error tracker's metrics surface).

Product and usage events — a feature used, a funnel step reached, a conversion — are a different signal with different naming, identity, and consent rules. They belong to [product-event-tracking.md](./product-event-tracking.md), not here.

## What Earns a Metric

A metric answers a question a dashboard or an alert asks continuously, so it earns its place by being watched rather than by being emitable. Re-deriving the same number from log lines works once, in an incident, slowly; a counter answers it on every refresh for the cost of an increment.

> Worth a metric: how many requests per second this endpoint serves, what the p99 latency is, how deep the retry queue is, what fraction of writes fail.

> Not worth a metric: that one specific request from one specific user failed at 09:14 — that is a log line, and the failure itself belongs to the error tracker.

**Guidelines:**

- SHOULD emit a metric for a health signal a dashboard or an alert watches continuously — request rate, latency, error rate, saturation.
- SHOULD prefer a counter or a duration over a log line for anything counted or aggregated, because rolling a metric up is cheap and re-deriving it from logs is not.
- SHOULD NOT emit a metric nobody has named a dashboard panel or an alert threshold for; an unwatched series costs storage and attention and answers nothing.
- MUST NOT use a metric to record which individual user did what — that is a product event or a log line, and it is the fastest way to exhaust a cardinality budget.

## Types and Units

Picking the wrong instrument type is not a style error: a counter that should have been a gauge reports nonsense once the value decreases, and a duration recorded as a counter cannot produce a percentile at all.

| Instrument   | Records                          | Typical question                        |
| ------------ | -------------------------------- | --------------------------------------- |
| Counter      | A monotonically increasing total | How many, how often, at what rate       |
| Gauge        | A value that rises and falls     | How many right now — depth, size, usage |
| Distribution | A population of observations     | p50, p95, p99 — latency, payload size   |

**Guidelines:**

- MUST choose a counter for a total that only increases, a gauge for a value that can decrease, and a distribution for anything a percentile is wanted from.
- MUST state the unit in the metric name or its declared unit field — `_seconds`, `_bytes`, `_total` — so nobody has to guess at a chart's axis.
- SHOULD record a duration as a distribution rather than as an average computed in application code, because an average of averages is not an average.
- SHOULD keep one unit per metric name across every emitter, since a series mixing milliseconds and seconds is silently wrong rather than visibly broken.

## Labels and Cardinality

A metric's storage cost is the product of its label values, so one unbounded label turns one series into millions. This is the failure mode that takes a metrics backend down, and it is nearly always introduced by attaching an identifier that felt harmless.

> A route template — `/orders/:id` — is one series per route. A full URL — `/orders/8f21c…` — is one series per order, forever.

**Guidelines:**

- MUST keep every label low-cardinality and bounded: a route template, a status class, a region, an enum.
- MUST NOT use a user id, session id, request id, full URL, email address, free-text value, or raw error message as a label.
- SHOULD decide a label's value set before emitting it, and treat an unbounded set as a signal that the data belongs in a log line or a trace instead.
- SHOULD keep the label set small and stable, because adding a label multiplies every existing series rather than adding one.

## Emitting Metrics Safely

Metric emission is a side effect on a path the user is waiting for, so it inherits the same non-negotiables as every other telemetry call: it never blocks, never throws, and never becomes the reason a request fails.

```typescript
// One wrapper — the vendor client is imported here and nowhere else.
export function recordDuration(
  name: MetricName,
  seconds: number,
  labels: Labels,
) {
  if (!metricsEnabled) return; // gated — no backend configured, or disabled for this environment
  try {
    metrics.distribution(name, seconds, labels);
  } catch {
    // A metrics backend outage must not surface as a request failure.
  }
}
```

**Guidelines:**

- MUST emit metrics through one project wrapper rather than calling the vendor client from feature code, so the client is imported in exactly one module.
- MUST NOT let a metrics failure break the user-facing path; emitting is a side effect and must not throw into the caller.
- MUST gate emission behind a runtime flag so metrics stay inert where no backend is configured — local development, tests, and preview environments.
- SHOULD treat a metric name and its label keys as a stable contract, because renaming one breaks every dashboard panel and alert rule built on it.
- SHOULD emit from the narrowest place that knows the outcome — the boundary that just completed the work — rather than from a wrapper several layers away that has to infer it.
