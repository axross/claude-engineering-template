# E2E Test Commands

Use this reference to choose the command that matches the target environment and the snapshot task. The exact command depends on the runner; the intent behind each command is what generalizes.

The examples use `npm run test:e2e` as the project's wrapper script. Substitute the project's own script or the runner invocation directly — `npx playwright test`, `npx cypress run`, `npx vitest run --config vitest.e2e.config.ts`, or `maestro test e2e/flows`.

## Running E2E Tests

Run the full suite for local verification:

```bash
npm run test:e2e
```

**Guidelines:**

- MUST run the full e2e suite after a change affects a user-facing output surface, an endpoint the suite drives, or e2e coverage.
- MUST report that the run was skipped, and why, when the suite cannot run in the current environment (for example, a mobile suite with no simulator, or a browser suite with no browser binary) — do not claim e2e verification that did not happen.
- SHOULD run only the affected file or a tagged subset while iterating, then finish with the full run before claiming completion.

**Example — narrowing the run while iterating:**

```bash
# Playwright: a single spec, or a grep over tags
npx playwright test e2e/tests/routes/index/page.test.ts
npx playwright test --grep "@smoke"

# Maestro: a single flow, or a tag filter
npx maestro test e2e/flows/app-launch.yaml
npx maestro test --include-tags "smoke" e2e/flows
```

## Iterating Without Rebuilding

A suite that runs against a production build (see [test-environment.md](./test-environment.md)) rebuilds the app on every full run. When the application code has not changed, reuse the existing build.

**Guidelines:**

- SHOULD use the iteration run (skip the build, reuse the prior build output) while authoring or debugging tests whose application code has not changed.
- MUST re-run the full command (build included) when the change touches application code — an iteration run exercises a stale build and can pass against code that no longer exists.

**Example:**

```bash
# Full run: build, then test against the built app
npm run test:e2e

# Iteration run: reuse the existing build (requires a prior build)
npx vitest run --config vitest.e2e.config.ts
```

## Updating Snapshots

Runners that capture visual or serialized snapshots compare against a stored baseline. Regenerate the baseline only when the output change is intentional.

```bash
npm run test:e2e -- --update-snapshots
```

**Guidelines:**

- MUST update snapshots only when the visual or serialized output change is intentional; a diff you did not intend is a regression, not a stale snapshot.
- MUST review the regenerated baseline before committing it, the same as any other change.
- SHOULD state, in the change description, the reason the expected output moved.

## Targeting an Environment

By default the suite runs against a locally managed server. A base-URL environment variable retargets it at a deployed environment without editing tests.

**Guidelines:**

- SHOULD run against a local production build (build, start, then test) when verifying production-only behavior that the dev server does not reproduce.
- MUST keep the local production server running for the whole run when the runner does not start it itself.
- SHOULD set the base-URL environment variable only when intentionally testing a deployed environment instead of the local app.
- MUST NOT point a suite that boots and owns its own server at a deployed environment; that suite manages a local server and cannot target a remote one.

**Example — local production build, then a deployed target:**

```bash
# Verify production-only behavior against a local production build
npm run build && npm run start   # in one terminal
npm run test:e2e                 # in a second terminal

# Retarget the suite at a deployed environment
E2E_BASE_URL=https://example.com npm run test:e2e
```
