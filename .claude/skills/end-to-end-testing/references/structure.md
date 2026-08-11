# E2E Test Structure

_Code examples use Playwright-shaped file names and APIs as the concrete form. Translate them to the project's runner; the structure conventions in the prose are framework-neutral._

## A Dedicated E2E Directory

E2E tests boot a running system and are slower and differently configured than unit tests, so they live apart from the unit suite with their own runner configuration and their own collection glob. Mixing them forces one config to serve two very different jobs.

```
<root>
├── e2e/                     # e2e tests, helpers, and catalog (own runner glob)
├── src/                     # application code, with unit tests colocated
└── ...
```

**Guidelines:**

- MUST keep e2e tests in their own top-level directory (for example `e2e/`), separate from colocated or `src/`-based unit tests.
- MUST give the e2e suite its own runner configuration that collects only the e2e glob, so a unit run never boots the e2e server and vice versa.
- MUST keep reusable e2e helpers and fixtures in a shared location every suite can reach (for example `e2e/helpers/`).

## Route-Tree Layout (Default)

Tests are easiest to find when their location mirrors the surface they cover. The default layout groups suites by route, so a route change points directly at the tests that guard it.

```
e2e/
├── helpers/                        # shared helpers (API/data/setup)
└── tests/
    ├── metadata.test.ts            # app-global metadata test
    └── routes/                     # route/feature-specific tests
        ├── index/
        │   └── page.test.ts        # tests for the "/" route
        └── items/
            └── id/
                └── page.test.ts    # tests for "/items/:id"
```

**Guidelines:**

- MUST place route/feature-specific e2e tests under a route tree that mirrors the app's routes (for example `e2e/tests/routes/`).
- SHOULD keep setup and app-global tests (metadata, not-found) directly under the tests root when they are not route-specific.
- SHOULD mirror the framework's own route segment names, including dynamic segments, so a route and its guarding tests stay one-to-one.

## Purpose-Based Layout

A route tree adds empty hierarchy when the app has one route or its value lives in cross-route journeys. Purpose-named suites keep the cheapest signal first: smoke proves the app boots and the core loop works, happy-path walks the main journeys end to end, regressions hold named guards for previously shipped bugs, and feature-area suites cover one surface in depth.

```
e2e/
└── tests/
    ├── smoke.test.ts          # boots + core loop, the first gate
    ├── happy-path.test.ts     # main journeys end to end
    ├── regressions.test.ts    # named guards for shipped bugs
    └── <feature>.test.ts      # feature-specific suite
```

**Guidelines:**

- SHOULD organize suites by purpose (`smoke`, `happy-path`, `regressions`, `<feature-area>`) instead of by route in single-route or journey-centric apps.
- MUST treat the smoke suite as the first gate: if it fails, deeper suites are not worth running.
- SHOULD guard each previously shipped bug with a named regression test instead of folding the check into an unrelated case.

## File Naming

File names follow the runner's discovery convention so the test-file matcher picks them up without extra configuration, and read as a journey list rather than a screen list.

**Guidelines:**

- MUST use kebab-case for file names.
- MUST use the runner's test-file extension (for example `.test.ts`, `.spec.ts`, or `.yaml` for Maestro flows) so discovery works without extra config.
- SHOULD name a file after the journey or surface it covers, not an incidental implementation detail.

## Test Case and Step Structure

One behavior per test keeps failures diagnosable, and named steps turn a multi-phase journey's report into a readable narrative. Steps earn their keep only when a test has phases to narrate — wrapping a single arrange → act → assert in one step adds noise, not structure.

**Guidelines:**

- MUST define one test case per behavior, and name it concisely as a sentence about the observable outcome, not the implementation ("refuses a non-public URL", not "calls the guard").
- MUST wrap each meaningful action/assertion group of a multi-phase scenario (two or more distinct arrange/act/assert phases) in a step, using the runner's step or labeling feature, at human-understandable granularity; steps can nest.
- MAY omit steps in a short atomic test (a single arrange → act → assert).
- MUST NOT pad an atomic test with a one-step wrapper just to satisfy step structure.

**Example — steps narrate a multi-phase journey; an atomic test omits them:**

```ts
import { expect, test } from "@playwright/test";

// Multi-phase: each phase is a named step.
test("Item summary section", async ({ page }) => {
  const summary = page.getByTestId("page").getByTestId("summary");

  await test.step("Verify the title", async () => {
    await expect(summary.getByTestId("title")).toBeVisible();
  });

  await test.step("Verify the primary action", async () => {
    await expect(summary.getByTestId("primary-action")).toBeVisible();
  });
});

// Atomic: one arrange → act → assert, no step wrapper.
test("Home page has the expected title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Example");
});
```
