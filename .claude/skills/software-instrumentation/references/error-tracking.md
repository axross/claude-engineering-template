# Error Tracking

Apply this reference when instrumenting or reviewing error-tracker setup, exception capture, instrumentation files, breadcrumbs, or error context.

An **error tracker** (error-reporting service such as Sentry, Rollbar, Bugsnag, or Honeybadger) is where unexpected failures become visible: it groups exceptions, attaches stack traces and breadcrumbs, and alerts. This file uses `reportError(...)` for its capture call and `addBreadcrumb(...)` for its breadcrumb call; substitute your project's actual names.

The rules below govern **what** to capture and what an event may carry, whichever tracker is installed. The mechanics of the tracker itself — its packages, its initialization options, its source-map upload, its sampling and privacy settings — belong to that vendor's own instrumentation capability; consult it whenever a change touches the tracker's configuration rather than what the application reports.

## Integration Boundaries

An error tracker touches production diagnostics and user privacy at once, so its initialization and imports deserve a single, well-guarded home rather than being scattered across feature modules.

**Guidelines:**

- MUST initialize the error tracker in its dedicated init/config or instrumentation file(s), not inline inside feature code.
- MUST import the capture call from the SDK your project standardized on (for a framework-integrated SDK, the framework package — e.g. the Next.js integration — not the lower-level core/node/browser package, which wires runtimes incorrectly).
- SHOULD route app code through one thin project wrapper (e.g. `reportError`, `addBreadcrumb`) so the vendor SDK is imported in exactly one module and swapping vendors touches one file.
- MUST treat changes to init/config files, source-map upload, and runtime options as integration-sensitive work — consult current official docs for the SDK before changing them, per your project's process for changing external integrations.

## Capturing Exceptions

A captured exception should mean "a human should look at this". Expected validation failures and normal not-found paths are control flow, and reporting them trains everyone to ignore the dashboard. This section governs only **which** failures are worth capturing; whether to report, rethrow, or recover a given caught error follows the caught-error decision flow in [error-handling.md](./error-handling.md), not restated here.

**Guidelines:**

- MUST call `reportError(...)` whenever a caught error is an unexpected failure worth investigating, placing the call as the caught-error decision flow in [error-handling.md](./error-handling.md) prescribes (before any early exit, rethrowing after when a caller or boundary still needs it).
- SHOULD capture non-thrown unexpected states with a descriptive `Error` when they signal a renderer, parser, or data-contract gap.
- MUST NOT capture expected input-validation failures or normal not-found paths as exceptions unless they indicate abuse or a system defect.

## Breadcrumbs

Breadcrumbs are the trail of recent events the tracker attaches to the next captured exception, so a reported issue arrives with the sequence that led up to it — often the difference between a bare stack trace and an actionable report.

**Guidelines:**

- SHOULD populate the trail through ordinary log calls when the logger mirrors log lines into breadcrumbs (see [logging.md](./logging.md)); logging well is then how you get a useful trail for free.
- SHOULD reserve a direct `addBreadcrumb(...)` call for a non-log event worth placing on the timeline (a navigation, a state transition, a user action).
- MUST keep breadcrumb `message`, `category`, and `data` free of secrets, tokens, raw request bodies, and PII — breadcrumb data ships to the tracker alongside the exception, so the [Event Context and PII](#event-context-and-pii) rules apply.
- SHOULD attach a public identifier (an entity id, a route, a module name) as breadcrumb data so the trail is filterable.

## Trace and Replay Sampling

Sampling decisions are made before anyone knows which session will error, and a trace or replay that was never captured cannot be reconstructed after the fact — so error-time capture is worth protecting even when steady-state sampling is turned down.

**Guidelines:**

- SHOULD keep on-error capture (error-linked traces and session replay) at full rate even when the baseline trace/replay sample rate is lowered — the erroring session is the diagnostic one.
- SHOULD lower the baseline trace sample rate on high-traffic paths so telemetry volume and cost stay bounded; full sampling on a hot route will exhaust quotas.
- MUST NOT lower a sample rate as an incidental side effect of an unrelated change — a quieter dashboard reads as "healthy" when it is really "blind".
- SHOULD record why a non-default sample rate was chosen, so a later reviewer can tell a deliberate limit from an accident.

## Event Context and PII

Context should explain a failure without copying private content into a third-party event. Everything attached to an event leaves your system, so the default is to attach identifiers, not values.

**Guidelines:**

- MUST NOT attach secrets, access tokens, raw request bodies, raw user content, non-public content, session data, or private data-layer fields to event context.
- MUST treat any "send default PII" option as a privacy-sensitive setting and justify each user, request, or identifier field it enables, per your project's security and privacy conventions.
- SHOULD prefer route names, public identifiers, operation names, feature flags, and booleans over raw content values.
- SHOULD include enough stable, intentionally-public context — an entity id, a route, a filename, a module name — to make an issue actionable.
