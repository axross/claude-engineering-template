---
name: end-to-end-testing
description: Writing, reviewing, refactoring, or running end-to-end tests, or verifying a change through the e2e suite — whole-system checks that drive a running build the way a real user or client does. Triggers on snapshots, test IDs, selectors or locators, polling and waiting, flaky tests, scenario coverage, a runner (Playwright, Cypress, Maestro, Detox, WebdriverIO, Vitest), or a failing e2e run. For a test that mocks its dependencies to isolate one unit, use a unit-testing capability; for the runner's own config and reporters, that runner's own. Covers the test-id then role then copy locator hierarchy, poll-not-sleep waiting, and server lifecycle.
user-invocable: false
---

# End-to-End Testing

This skill equips you to author, run, review, and maintain end-to-end (E2E) tests: automated checks that exercise the whole system the way a real user or client does, against a running build rather than mocked-out units. Reach for it to write a new suite, add a test to an existing one, diagnose a flaky or failing run, or judge someone else's e2e change.

The conventions here are framework-agnostic. E2E suites take three broad shapes, and the same principles govern all of them:

- **Browser-driven UI** (e.g. Playwright, Cypress, WebdriverIO) — drive a real browser against the running web app.
- **Device-driven mobile UI** (e.g. Maestro, Detox) — drive a real app build on a simulator, emulator, or device.
- **Protocol / HTTP-level** (e.g. a Vitest suite driving a real REST, GraphQL, or MCP client) — boot the real server and exercise its endpoints with the real client, no browser.

Code examples use one concrete runner (usually Playwright) as the shape. Translate the API to the project's runner — the prose rules are what carry across stacks.

This skill owns the E2E level: whole-system checks against a real build. A check that mocks its dependencies to isolate one unit belongs at the unit level instead — if the project ships a unit-testing skill, defer to it for those conventions.

The level is not the runner. Where an e2e suite runs on a runner the project ships a capability for, that capability owns the runner's own surface — its config file, projects, pools, reporters, and browser-mode wiring — while the journeys, the locator fallback hierarchy, server lifecycle, and scenario coverage stay here.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Running End-to-End Tests

See [commands.md](./references/commands.md) for:

- The default local verification run and the faster iteration run
- Updating snapshots only for intentional visual changes
- Targeting dev, a local production build, or a deployed environment through a base-URL environment variable

**Guidelines:**

- MUST read [commands.md](./references/commands.md) before invoking the e2e suite, before regenerating a snapshot, and before pointing a run at a production build or a deployed environment.

## Test Suite Structure

See [structure.md](./references/structure.md) for:

- Keeping e2e tests in their own directory with their own runner glob, separate from unit tests
- The route-tree directory layout (default) and the purpose-based layout for single-route or journey-centric apps (smoke / happy-path / regressions / feature-area)
- Test-file naming, test-case naming, and step granularity (multi-phase scenarios use steps; short atomic tests omit them)

**Guidelines:**

- MUST read [structure.md](./references/structure.md) before adding an e2e test file, choosing where it sits in the suite, or naming a file, a test case, or a step inside one.

## Test Authoring Conventions

See [conventions.md](./references/conventions.md) for:

- The locator/selector fallback hierarchy (stable test IDs first, roles for accessible controls, text only for copy assertions)
- Native auto-waiting assertions over manual state reads, and asserting the observable contract rather than internals
- Polling / wait-for-condition helpers instead of fixed sleeps, and why fixed sleeps are banned
- Case-independent setup and cleanup hooks

**Guidelines:**

- MUST read [conventions.md](./references/conventions.md) before writing a locator, an assertion, a wait, or a setup or cleanup hook inside an e2e test.

## Test Environment and Fixtures

See [test-environment.md](./references/test-environment.md) for:

- Driving the real system under test through the client it actually exposes, with one shared client/context per file
- Owning the server lifecycle in one place with readiness polling, not fixed sleeps
- The deterministic-by-default rule: no live external network, with a manual escape hatch for genuinely network-dependent journeys
- Reusing one authenticated session across tests, and centralizing data/API helpers that return validated data

**Guidelines:**

- MUST read [test-environment.md](./references/test-environment.md) before starting or stopping the system under test from the suite, before letting a test reach an external network, and before adding an authentication, fixture, or data-setup helper the suite shares.

## Scenario Coverage

See [scenario-coverage.md](./references/scenario-coverage.md) for:

- The scenario-coverage metric (user journeys asserted, **not** e2e line coverage) and why line coverage was rejected
- The human-authored journey catalog and the scenario join tag plus area/priority/smoke facet tags
- The phased gate (`must`-priority journeys at 100% first), the catalog-to-tag join a project's own CI implements against a normalized `{ title, tags, status }` result shape, and an example catalog ([assets/scenarios.example.md](./assets/scenarios.example.md))

**Guidelines:**

- MUST read [scenario-coverage.md](./references/scenario-coverage.md) before adding or retiring a journey in the catalog, before tagging a test with a scenario or facet tag, and before reporting or gating on how much of the suite's journey coverage is met.
