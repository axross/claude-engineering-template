# E2E Test Environment and Fixtures

Apply this reference to the runtime the tests execute against: how the suite obtains a running system, drives it, keeps it deterministic, and shares expensive setup. These concerns are separate from how an individual test case is written (see [conventions.md](./conventions.md)).

## Drive the Real System Under Test

An e2e suite's value is fidelity: it must fail when a real user or client would fail. Drive the system through the same client it exposes to the outside world — a browser for a web UI, a device driver for a mobile app, the real protocol client for a service — never a hand-rolled substitute that can silently drift from real behavior.

**Guidelines:**

- MUST exercise the system through the client it actually exposes (browser driver, device driver, or the real SDK/protocol client), not a hand-rolled request that bypasses the real session, negotiation, or transport.
- MUST assert against a real running build, not mocked-out internals; mocking the thing under test turns an e2e test back into a unit test.
- SHOULD connect one shared client/context per test file (in a before-all hook) and close it in an after-all hook; per-test clients re-negotiate for no benefit.

**Example — one shared protocol client per file:**

```ts
import { afterAll, beforeAll } from "vitest";

let client: Client;

beforeAll(async () => {
  client = new Client({ name: "e2e", version: "0.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
});

afterAll(async () => {
  await client.close();
});
```

## Own the Server Lifecycle in One Place

The suite needs a running system before the first test. Own that lifecycle in one place — a global setup, or the runner's built-in server manager — and wait for readiness by polling an observable signal, never a fixed sleep. Individual test files import the base URL and never boot servers themselves.

**Guidelines:**

- MUST start the system under test from one place (a global-setup module, or the runner's built-in server block) and expose its base URL to the test files.
- MUST poll a readiness signal (a health request succeeding, the port accepting connections) with a bounded deadline instead of sleeping a guessed duration.
- MUST tear the server down after the run when the suite started it.
- SHOULD prefer the runner's built-in server manager when it has one (for example Playwright's `webServer`), and hand-roll a spawn-and-poll global setup only when the runner has no equivalent.

**Example — spawn, poll until ready, tear down:**

```ts
import { spawn } from "node:child_process";

const PORT = 3100;
// Exported so test files can import the base URL instead of booting a server.
export const BASE_URL = `http://localhost:${PORT}`;
let server: ReturnType<typeof spawn>;

export async function setup() {
  server = spawn("node", ["./server", "--port", String(PORT)], {
    stdio: "ignore",
  });

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(BASE_URL, { signal: AbortSignal.timeout(1_000) })).ok) {
        return;
      }
    } catch {
      // not accepting connections yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server not ready in time.");
}

// Tear the server down after the run (see the guideline above).
export async function teardown() {
  server?.kill();
}
```

## Deterministic by Default

The suite runs on every merge, so a dependency on a live third-party site makes CI fail on someone else's outage. Exercise failure paths with deterministic, offline-safe inputs, and push journeys that genuinely need the external network into a manual bucket instead of writing flaky automated tests.

**Guidelines:**

- MUST NOT depend on a live external website or third-party service in the automated suite; a single outage elsewhere should never redden this build.
- SHOULD exercise failure paths with deterministic inputs — reserved-TLD hostnames (`.invalid`, RFC 2606) for unresolvable-host journeys, guard-blocked addresses for refusal journeys — rather than real endpoints.
- MUST cover a journey that truly requires the external network as a `manual` catalog entry (see [scenario-coverage.md](./scenario-coverage.md)) verified by hand, not as an automated test that flakes.
- MUST NOT weaken a security guard (an SSRF check, a test-only bypass) to make a fixture reachable when the guard's behavior is part of what the suite verifies.

## Reuse One Authenticated Session

Re-authenticating in every test is slow and adds a failure mode unrelated to the behavior under test. Authenticate once, persist the session, and let every test and its helpers share it.

**Guidelines:**

- SHOULD authenticate once in a dedicated setup step, persist the session (a saved storage state, a token), and reuse it across tests rather than logging in per test.
- SHOULD make API/data helpers share the same authenticated session as the UI driver, so a helper request carries the test's credentials.
- SHOULD read test credentials from environment variables, never hard-coded, and store any persisted session under the e2e temp directory, not in version control.

**Example — reuse a saved authenticated state:**

```ts
import { test } from "@playwright/test";
import { authenticatedStorageState } from "@/e2e/helpers/api/auth";

test.use({ storageState: authenticatedStorageState });
```

## Reusable Data and API Helpers

Hard-coded expected values drift as content changes; fetching the same record through the API keeps UI assertions accurate without editing the spec every time the data moves. Centralizing request wiring in named helpers keeps auth state, URL construction, and response validation consistent, so test cases read as behavior instead of HTTP plumbing.

**Guidelines:**

- SHOULD fetch expected values from the system's own API and compare them against the UI, rather than hard-coding values that drift.
- MUST define API/data helpers in a shared location (for example `e2e/helpers/api/`), kebab-case file names, named exports.
- SHOULD validate the response shape in the helper (a schema parse) so a drifted API surfaces as a clear helper failure, not a confusing assertion mismatch.
- SHOULD call data helpers from a before-each hook rather than the test body when the data is not specific to the case.

**Example — a validated, auth-sharing data helper:**

```ts
export async function getExampleItem({ page, testInfo }) {
  const url = new URL("/api/items/example", testInfo.project.use.baseURL);

  // Share the test's authenticated session for the request.
  const response = await page.request.get(`${url}`);
  if (!response.ok()) {
    throw new Error("Failed to get the example item (non-200 response).");
  }

  // Validate the shape so a drifted API fails loudly and locally.
  return ItemSchema.parse(await response.json());
}
```
