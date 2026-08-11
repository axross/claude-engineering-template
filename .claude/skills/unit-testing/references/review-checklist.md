# Review Checklist

Use this checklist during implementation self-review or code review for unit tests. It complements a project's quality-assurance or verification-evidence guidelines — which own verification evidence and residual-risk reporting — when the project defines them.

## Mandatory Verification

A test change is incomplete without proof that the code still passes the local checks relevant to the changed surface.

**Guidelines:**

- MUST verify every new or changed spec imports the test framework's APIs explicitly when the runner requires or supports it.
- MUST verify new or changed specs use the project's chosen test-case function consistently.
- MUST verify the project's unit-test command passes or report the exact blocker.
- MUST run the project's format and lint commands after adding or changing unit tests, plus the type-check command when the project has one.
- MUST report skipped commands with a concrete reason and residual risk.
- MUST run e2e tests instead of relying only on unit tests when the change affects UI output, route behavior, metadata, browser behavior, or e2e coverage.

## Coverage Gate

This section applies only when the project enforces unit-test coverage. If it does not, skip this section.

A coverage number is only trustworthy when every exclusion is deliberate: the gate proves branches were exercised, and each ignored branch records where it is verified instead.

**Guidelines:**

- MUST run the project's coverage command, when one exists, after adding or changing unit tests, and report the result.
- MUST treat coverage thresholds and file exclusions as deliberate project decisions, not values to loosen ad hoc to make a run pass.
- MUST cover a branch that cannot be exercised in the unit-test environment with e2e coverage instead, and exclude it with the coverage tool's ignore pragma plus a one-line reason.
- SHOULD prefer deleting provably dead code over excluding it from coverage.

## Naming And Structure Review

The test list should be useful documentation. If the test-runner output cannot tell what behavior failed, the structure needs work.

**Guidelines:**

- MUST verify new or changed specs group scenarios with `describe(...)` by the exported contract under test.
- MUST verify test-case names describe observable behavior rather than implementation method names.
- MUST verify condition-specific scenarios state the condition in the test-case name or enclosing `describe(...)` block.
- MUST verify function, method, and callable handler names in `describe(...)` and test-case titles include trailing `()`.
- MUST verify schemas, codecs, object contracts, and type names do not receive trailing `()` in titles.
- SHOULD flag repeated outer subjects in child test-case names as noise.
- SHOULD flag broad tests that should be split by condition or by act.

## Behavior And Maintainability Review

Good unit tests resist irrelevant refactors and fail for meaningful regressions.

**Guidelines:**

- MUST verify each scenario has one primary act and no unnecessary control flow.
- MUST verify tests exercise public exports, documented side effects, or stable contracts rather than private implementation details.
- SHOULD check that each fake represents a real boundary and is not hiding the behavior under test.
- SHOULD check that setup helpers clarify meaningful differences instead of hiding conditions behind generic options or modes.
- SHOULD check that each test would fail for the most likely regression the production change could introduce.
- MUST verify snapshots, if any, are small, deterministic, intentional, and reviewed as behavior.
- SHOULD flag incidental assertions that only pin current object shape without explaining why the caller cares.
