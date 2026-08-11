---
name: end-to-end-testing
description: Writing, reviewing, refactoring, or running end-to-end tests, or verifying a change through the e2e suite — including a prompt naming only snapshots, test IDs, selectors or locators, polling and waiting, flaky tests, scenario coverage, a runner (Playwright, Cypress, Maestro, Detox, WebdriverIO, Vitest), or a failing e2e run. Tests that drive the whole system as a real user or client does. Covers layout and naming, the test-id then role then copy locator hierarchy, poll-not-sleep waiting, server lifecycle, no live network, and a scenario catalog.
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

## Test Suite Structure

See [structure.md](./references/structure.md) for:

- Keeping e2e tests in their own directory with their own runner glob, separate from unit tests
- The route-tree directory layout (default) and the purpose-based layout for single-route or journey-centric apps (smoke / happy-path / regressions / feature-area)
- Test-file naming, test-case naming, and step granularity (multi-phase scenarios use steps; short atomic tests omit them)

## Test Authoring Conventions

See [conventions.md](./references/conventions.md) for:

- The locator/selector fallback hierarchy (stable test IDs first, roles for accessible controls, text only for copy assertions)
- Native auto-waiting assertions over manual state reads, and asserting the observable contract rather than internals
- Polling / wait-for-condition helpers instead of fixed sleeps, and why fixed sleeps are banned
- Case-independent setup and cleanup hooks

## Test Environment and Fixtures

See [test-environment.md](./references/test-environment.md) for:

- Driving the real system under test through the client it actually exposes, with one shared client/context per file
- Owning the server lifecycle in one place with readiness polling, not fixed sleeps
- The deterministic-by-default rule: no live external network, with a manual escape hatch for genuinely network-dependent journeys
- Reusing one authenticated session across tests, and centralizing data/API helpers that return validated data

## Scenario Coverage

See [scenario-coverage.md](./references/scenario-coverage.md) for:

- The scenario-coverage metric (user journeys asserted, **not** e2e line coverage) and why line coverage was rejected
- The human-authored journey catalog and the scenario join tag plus area/priority/smoke facet tags
- The phased gate (`must`-priority journeys at 100% first), the catalog-to-tag join a project's own CI implements against a normalized `{ title, tags, status }` result shape, and an example catalog ([assets/scenarios.example.md](./assets/scenarios.example.md))
