# Error Handling

Apply this reference when instrumenting or reviewing any code that might throw or receive an error. Error handling is an observability concern: an error that is swallowed, or reported without enough context, is an error nobody can see in production.

Throughout this file, `reportError(...)` stands in for your error tracker's capture call — the function that sends an exception to your error-reporting service (see [error-tracking.md](./error-tracking.md)). Substitute your project's actual call.

## Deciding What a Caught Error Means

Every `catch` makes the same three-way decision, in order: a known control-flow signal is rethrown untouched and never reported; an unexpected failure is reported **before** any early exit; then, if a caller or boundary still needs to act on it, it is rethrown after reporting, otherwise the catch recovers. This flow is the single source for that order — the sections below expand each branch, and [error-tracking.md](./error-tracking.md) points here rather than restating it.

```mermaid
flowchart TD
  A[Caught an error] --> B{A known control-flow signal? e.g. framework not-found or redirect sentinel}
  B -->|Yes| C[Rethrow it untouched - do NOT report; let the framework act]
  B -->|No| D[Unexpected failure: reportError before any early return/redirect/fallback]
  D --> E{Does a caller or error boundary still need to handle it?}
  E -->|Yes| F[Rethrow after reporting]
  E -->|No| G[Recover here - return a fallback, not-found, or safe default]
```

## Placement of try-catch

Only the root call site knows what a failed operation means to the user, so it alone can choose the right recovery — a nested helper can only guess, and a guess made three frames down usually hides the failure from the one place able to handle it.

**Guidelines:**

- MUST place `try`/`catch` at the **root call site** — the outermost function that initiates an operation (a request handler, a top-level command, a UI event handler, an entry-point function).
- MUST NOT swallow errors silently in nested helpers; let them propagate up the call stack so the root call site can decide.
- MUST rethrow a caught error when the `catch` exists only for a side effect such as logging — catching without rethrowing hides the error from the root call site.

```typescript
// CORRECT — nested helper lets errors propagate
async function fetchRecord(id: string) {
  return await dataLayer.find({ id });
}

// CORRECT — root call site catches, reports, then handles
export async function handleRequest(id: string) {
  try {
    return await fetchRecord(id);
  } catch (error) {
    reportError(error);
    return notFound();
  }
}

// WRONG — nested helper swallows the error
async function fetchRecord(id: string) {
  try {
    return await dataLayer.find({ id });
  } catch (error) {
    console.error(error); // error is lost after this line
  }
}
```

## Preserving the Original Error

A rethrow that discards the caught error erases the stack trace and cause that made the failure diagnosable, replacing a specific fault with a generic one.

**Guidelines:**

- MUST preserve the original error when wrapping it — attach it as the cause (`throw new Error("...", { cause: error })`) rather than throwing a fresh error that drops the original.
- SHOULD NOT stringify an error into a message and throw a new one; the structured error object carries stack and cause that a string does not.
- MUST NOT catch a known control-flow signal (for example a framework's not-found or redirect sentinel) and report it as a failure — re-throw it untouched so the framework can act on it.

## Reporting to the Error Tracker

Unexpected failures caught at the root call site should be reported before execution moves to a fallback, because a report sent after an early return may never be sent at all.

**Guidelines:**

- MUST report the error (via `reportError(...)`) when a caught error represents an unexpected failure that should be investigated.
- MUST report the error **before** any early return, redirect, or not-found path, so the report is always sent even when execution continues along an alternate branch.
- SHOULD also report non-thrown unexpected states with a descriptive `Error` — for example, a renderer or parser reaching a branch that should be unreachable.
- MUST consult [error-tracking.md](./error-tracking.md) before changing what context, tags, or identifiers accompany a captured error.

```typescript
// Report before the early exit, not after.
try {
  resource = await retrieveResource(id);
} catch (error) {
  reportError(error);
  return notFound();
}

// Non-thrown unexpected state, still reported.
unknownHandler: (_state, node) => {
  reportError(new Error(`Handled unknown node (type: ${node.type}).`));
};
```

## Top-Level Error Boundary

Unhandled render and runtime errors end their journey at the top-level boundary, so its report is the last guarantee that nothing fails invisibly.

**Guidelines:**

- MUST keep the framework's top-level error boundary as the last-resort handler for the whole application, and MUST report the errors it receives via `reportError(...)`.
- MUST NOT remove or bypass the top-level error boundary.
- MAY add scope-specific boundaries for areas that need customized recovery, following the same report-then-render pattern.
- SHOULD NOT report from a normal not-found view — a not-found path is control flow, and reporting it buries real errors in noise.

```typescript
// The top-level error boundary reports once it receives the error.
export function TopLevelErrorBoundary({ error }: { error: Error }) {
  reportError(error);
  // ...render fallback UI...
}
```

## Error Messages

A reported issue is usually read in a dashboard where the message is the headline and the stack trace is minified or several clicks away, so the message has to carry the diagnosis on its own.

**Guidelines:**

- SHOULD write error messages that name the exact function or condition that failed, so a reported issue is actionable without opening the stack trace.
- SHOULD include the stable identifier that scopes the failure (an entity id, a route, an operation name) in the message or as reported context.
- MUST NOT put secrets, tokens, or raw user content into an error message — the message travels to the error tracker verbatim (see [error-tracking.md](./error-tracking.md)).

```typescript
// GOOD — the message alone explains the failure
throw new Error("retrieveResource() was called but the access token is null.");

// LESS GOOD — requires the stack trace to understand
throw new Error("Token is missing.");
```
