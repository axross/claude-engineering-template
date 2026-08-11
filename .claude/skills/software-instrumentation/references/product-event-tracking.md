# Product Event Tracking

Apply this reference when writing or reviewing the code that emits product and usage events — a feature used, a funnel step reached, a conversion recorded — or the wrapper, identity calls, and gating those events flow through. This file uses `trackEvent(...)`, `identifyUser(...)`, and `resetUser(...)` for the call shapes; substitute whatever your project's analytics tool names them.

This is the **engineer's** half of the subject: what the code does. Which metric the business chases, how a funnel or retention curve is read, and the statistics behind an experiment are a different discipline and are out of scope here. Where a project uses a specific analytics vendor, that vendor's own capability owns its SDK options, ingestion limits, and product configuration — an Amplitude instrumentation capability, for instance, owns Amplitude's initialization options, identity and session calls, autocapture defaults, and cost model. The rules below hold whichever vendor fills the role.

System-health measurement — request rate, latency, saturation — is the metrics signal and lives in [metrics.md](./metrics.md).

## The Emit Boundary

An analytics SDK reached directly from feature code welds the vendor into every file that measures anything, and there is no single place left to normalise a name, attach shared context, honour consent, or swallow a failure. One module owning the import turns all of those into one edit.

```typescript
// analytics.ts — the only module that imports the vendor SDK.
export function trackEvent<Name extends keyof Events>(
  name: Name,
  properties: Events[Name],
) {
  if (!analyticsEnabled) return;
  try {
    analytics.track(
      toWireName(name),
      toWireKeys({ ...baseContext(), ...properties }),
    );
  } catch {
    // Telemetry is a side effect; a failed send is never the caller's problem.
  }
}
```

**Guidelines:**

- MUST import the analytics SDK in exactly one module, and call it from feature code only through that module's own functions.
- MUST NOT expose a vendor type in a feature module's signature, so replacing the vendor never reaches a call site.
- MUST give the wrapper a test double — a `__mocks__` companion or an injectable no-op — so no test reaches a real client.
- SHOULD make the wrapper responsible for name and key normalisation, shared context, consent and environment gating, and failure isolation, rather than distributing those across call sites.
- SHOULD keep initialization beside the wrapper and run it once from the entry module, so ordering is inspectable in one place.
- SHOULD put a fan-out to a second sink — an event that is also a breadcrumb, or a log line that is also an event — inside the wrapper, so one call site cannot drift out of step with the other sink.

## The Typed Event Schema

An event name is a string, which means a typo compiles, ships, and silently creates a second event nobody charts. A map from event name to its allowed property shape moves that whole class of defect to build time, and doubles as the checked-in list of what the product measures.

```typescript
interface Events {
  "checkout completed": { payment_method: PaymentMethod; item_count: number };
  "post shared": { post_id: string; destination: ShareDestination };
  "splash screen hidden": Record<string, never>; // no payload — callers cannot invent one
}
```

**Guidelines:**

- MUST constrain event names and their properties with a type, so an unknown name or a malformed payload is a compile-time error rather than a runtime one.
- MUST type a payload-free event so a caller cannot attach ad-hoc properties to it.
- SHOULD prefer a closed union over a bare `string` for any property with a known value set, since the union is what makes a chart's breakdown finite.
- SHOULD commit a generated schema to source control like any other artefact when the schema is generated from a tracking plan, so a reviewer sees what changed.
- SHOULD keep one schema per application, shared through a package when several surfaces of a monorepo emit into the same stream.
- MAY validate a payload at runtime in development builds only; a production throw would break the caller for a telemetry defect.

## Naming Events

An event name is a schema every chart, funnel, alert, and export is built on, and analytics tools treat names case-sensitively — so `Checkout Completed`, `checkout completed`, and `Completed Checkout` are three unrelated events. The default that survives a redesign is a noun the product owns plus a past-tense verb, stated from the user's point of view.

**Good examples:**

> `checkout completed`, `post shared`, `subscription cancelled`

**Bad examples:**

> `Tap Presets Button` — names the control, so a redesign orphans the history.

> `checkout completed with apple pay` — buries a value in the name; that is a property.

> `Message Sent` — ambiguous actor: sent by the user, or to them?

**Guidelines:**

- SHOULD name an event as object plus past-tense verb from the user's perspective, unless the project has a different convention written down.
- MUST apply one written convention — casing, word order, and tense — across every event the project emits, since analytics tools distinguish names that differ only in case.
- MUST NOT name an event after the UI control that triggered it; the name has to outlive the button.
- MUST NOT interpolate a value into an event name; a value belongs in a property, where it can be filtered and grouped.
- SHOULD name the actor unambiguously, so no reader has to ask who performed the action.
- SHOULD convert the call-site form to the wire form at the wrapper boundary and nowhere else, so call sites stay idiomatic while the emitted schema stays uniform.
- SHOULD treat three events differing by one word as one event with a property, because the split version breaks every funnel that should have counted them together.

## Properties

Properties are where an event stops being a bare count and starts answering a question — and where PII, unbounded cardinality, and silent serialisation losses get in. Which bag a value belongs in also matters: an event property describes that one occurrence, while a user property describes the person and applies to every event from then on, never retroactively.

**Guidelines:**

- MUST attach a value as an event property when it describes the occurrence, and as a user property when it describes the person and should apply to their later events.
- MUST NOT expect a user-property change to alter events already emitted; the update applies forward only.
- MUST NOT put secrets, credentials, raw user content, free-text input, or unnecessary PII into a property, including PII arriving through a route parameter, a query string, or a search term.
- SHOULD inject the context every event carries — app version, platform, locale, build channel — once in the wrapper rather than at each call site.
- SHOULD use enums, booleans, and numbers over stringly-typed values, so a breakdown produces a finite set.
- SHOULD keep property values bounded in cardinality for anything meant to be grouped by, and treat an unbounded value as a candidate for a log line instead.
- SHOULD send flat payloads and reject what the transport cannot serialise loudly, because an encoder that quietly nulls an unsupported value ships an event whose property is permanently empty.

## Where the Call Goes

An event fired from the click handler records an intention; an event fired after the write succeeds records a fact. Only the second is safe to build a funnel on, because the first counts attempts that failed, retried, or were abandoned mid-flight.

```typescript
// Both outcomes are instrumented — silence is not data.
try {
  const order = await submitOrder(cart);
  trackEvent("checkout completed", {
    order_id: order.id,
    item_count: cart.length,
  });
} catch (error) {
  trackEvent("checkout failed", { reason: classify(error) });
  throw error;
}
```

**Guidelines:**

- MUST emit the event where the fact becomes true — after the operation succeeds — not where the interaction started.
- MUST instrument the failure path as its own event carrying a reason, so a drop-off can be told apart from an error.
- MUST NOT emit an event from a render body or from an effect that re-runs on a dependency change.
- SHOULD emit a view event from one router subscription rather than from each screen, which also avoids React Strict Mode's development-only double invocation of mount effects — a `useRef` guard against that double fire is a sign the call is in the wrong layer, not a fix.
- SHOULD carry an idempotency key on events that can be replayed by a retry, a background job, or an offline queue flush.
- SHOULD emit server-side events without blocking the response, through the framework's post-response hook (`after()` in Next.js, a platform `waitUntil`) rather than by awaiting the send inline.
- SHOULD place an event on the server when it asserts money, entitlement, or persisted state, and on the client when it captures intent or abandonment the server never sees.

## Identity

Analytics counts people, and it counts them by whatever identifier arrives on the event. A placeholder id is worse than none: every user who sends `"null"` or `"anonymous"` collapses into a single profile whose funnel and retention numbers are meaningless.

**Guidelines:**

- MUST identify the user at sign-in, sign-up, and session restore, and MUST NOT send an identifier before one genuinely exists.
- MUST NOT send a placeholder identifier such as `null`, `none`, `anonymous`, `undefined`, or `0`.
- MUST send an internal, immutable, non-PII identifier; an email address or username changes and is personal data.
- MUST reset identity on logout and on account switch, or the next user's activity is attributed to the previous one.
- SHOULD set the user properties an event depends on before emitting that event, since a later update does not reach it.
- SHOULD let anonymous activity flow un-identified and rely on the tool's own merge at sign-in, rather than inventing a pseudonymous id the tool cannot reconcile.
- SHOULD pass identity explicitly per request in server-side code, where there is no ambient current user.

## Sessions

A session is a definition, not a fact: it is an inactivity window the SDK applies, and its default differs between platforms and sometimes between an SDK's configuration and its vendor's ingestion. Session-scoped metrics inherit whatever that definition is, so it is worth knowing rather than assuming.

**Guidelines:**

- SHOULD confirm the session timeout the installed SDK applies rather than assuming a default, and record the chosen value in configuration where the project depends on it.
- SHOULD verify whether session start and end events are emitted at all on each platform, since some SDKs leave them off by default and their absence is silent.
- SHOULD take control of the session identifier explicitly when the product's notion of a session differs from an inactivity window.
- SHOULD account for the foreground and background transitions on mobile and tab restore on web when reasoning about where a session boundary lands.

## Consent, Environment, and Keys

Analytics is user data leaving the system for a third party, so where consent is required it gates initialization rather than filtering afterwards — an SDK that has already started may have written storage and sent a first event before any filter runs.

**Guidelines:**

- MUST gate on consent at initialization where the project's privacy model requires it, rather than initializing and suppressing sends.
- MUST re-evaluate consent when it changes mid-session, in both directions, rather than only at first load.
- MUST keep telemetry inert in development, test, and preview environments through configuration, not by deleting or commenting out the call.
- MUST NOT hardcode an API key as a fallback in source; a missing key disables tracking without failing launch, and a committed literal cannot be varied per environment or rotated without a release.
- MUST keep a secret-tier token out of any variable a client bundle can read, whatever the public environment prefix is on the platform.
- SHOULD decide explicitly whether pre-consent events are queued and flushed on grant, or dropped, and implement one of the two rather than leaving it emergent.

## Reliability and Cost

Every event is billed, indexed, and counted against a per-project ceiling on distinct names, so instrumentation is a budget as well as a signal. It is also a side effect on a path the user is waiting for, which fixes what it is allowed to do to that path.

**Guidelines:**

- MUST NOT await an event send on a user-facing path, and MUST NOT let a failed send throw into the caller.
- MUST flush pending events before a process exits or an app backgrounds, or the last events of every session are lost.
- SHOULD aggregate a high-frequency interaction — scroll, keystroke, pointer move — into one summary event rather than emitting per occurrence.
- SHOULD rely on the SDK's batching and offline queue rather than building a second one, and know which storage backs that queue on each platform.
- SHOULD treat a per-project ceiling on distinct event or property names as a real constraint, since one buggy release emitting a generated name can exhaust it for everyone.
- SHOULD review any event emitted from a code path that can run per render or per frame, which is the usual source of a runaway bill.

## Verifying Instrumentation

Instrumentation breaks silently: nothing throws when an event stops firing, and the loss shows up weeks later as a chart that flattened. The assertion surface is the wrapper, not the network — a test that asserts the exact name and payload catches a rename, and a test against a stubbed transport catches nothing.

```typescript
it("records the completed checkout with its item count", async () => {
  await submitCheckout({ items: [a, b] });
  expect(trackEvent).toHaveBeenCalledWith("checkout completed", {
    order_id: "order_1",
    item_count: 2,
  });
});
```

**Guidelines:**

- MUST assert the exact event name and payload in a unit test for every event on a critical path, using the wrapper's test double.
- MUST keep the SDK inert in test runs, so a suite never emits into a real project.
- SHOULD assert the critical funnel's events in an end-to-end test, so a refactor that drops one fails the build rather than the dashboard.
- SHOULD confirm during development that the event _arrived_ with the identity, app version, and properties expected — through the tool's live inspector or debug mode — rather than confirming only that the call was made.
- SHOULD verify on a release build for anything whose behaviour differs from a development build, including consent gating, environment routing, and identity persistence.

## Changing and Retiring an Event

A rename is a breaking schema change to every chart, funnel, alert, cohort, and export built on the old name, and none of them fails loudly — they just go empty. Mobile and desktop clients make it worse: released versions keep sending the old shape for as long as users decline to update.

**Guidelines:**

- MUST treat renaming an event or a property key as a breaking change, and name the downstream consumers it affects before making it.
- SHOULD migrate by emitting both names for a defined window, or by mapping the old name in the analytics tool, and remove the old one only after the reporting window has passed.
- SHOULD assume released clients keep emitting the previous shape for months, and keep the receiving side tolerant of both until they age out.
- MUST delete the call sites and the schema entry together when retiring an event, so the schema never lists an event nothing emits.
- SHOULD flag, when reviewing a change, a new user-facing action with no event, a UI-shaped event name, a property carrying PII, an event emitted from a render body, a failure path with no event, an identity call with no matching reset, and a vendor import outside the wrapper.
