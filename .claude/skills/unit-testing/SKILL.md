---
name: unit-testing
description: Writing, refactoring, reviewing, or running unit tests — including mocks and fakes, fixtures, schema and codec tests, snapshot choices, coverage questions, assertion design, or deciding whether a behavior belongs in a unit test at all. Not for end-to-end or browser tests, and not for judging overall verification-evidence adequacy. Fast, isolated checks that exercise one small exported contract from the caller's point of view, across runners such as Jest, Vitest, or Node's built-in runner. Covers naming and grouping, refactor-surviving design, boundary fakes, async assertions, and a review checklist.
user-invocable: false
---

# Unit Testing

This skill equips you to author, refactor, review, and run unit tests: fast, isolated checks that exercise one small exported contract from a caller's point of view, independently of framework wiring, the data layer, or the browser. Reach for it to write a new spec, tighten an existing one, decide what to assert, or judge someone else's unit-test change.

The conventions are framework-agnostic — they hold whether the project runs Jest, Vitest, Node's built-in test runner, or a similar runner. Examples are written in TypeScript with `describe`/`it`/`expect`, the vocabulary most runners share; read `it`/`test`, the assertion entrypoint, and the mocking calls as stand-ins for whatever the project's runner provides.

Where a project ships a capability for its specific runner, that capability owns the **mechanism** — the config file, pools and isolation, coverage providers, reporters, and the runner's own mocking and fake-timer API — and this skill owns what to assert, how a spec is shaped, and whether the behavior belongs in a unit test at all. Reach for the runner's capability when the question is which option or which call; reach for this one when the question is what the test should verify.

A unit test earns its place when it exercises a small exported contract quickly, independently, and from the outside. It becomes a liability when it overfits implementation details or stands in for higher-confidence integration or e2e coverage — so part of this capability is knowing when _not_ to write one, and routing that behavior to a broader test instead.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Testing Scope

See [testing-scope.md](./references/testing-scope.md) for:

- deciding whether a behavior belongs in unit, integration, or e2e coverage, with a decision diagram
- keeping pure helper tests small while routing browser, data-layer, and framework behavior to broader tests
- recognizing when a unit test would be lower confidence than an integration or e2e check

## Spec Structure and Naming

See [spec-structure-and-naming.md](./references/spec-structure-and-naming.md) for:

- adding, renaming, regrouping, or reviewing `describe(...)` and test-case blocks
- naming subjects by kind: callables with `()`, UI components in angle brackets, non-callable contracts with no suffix
- writing scenario names that read as clear verification sentences
- grouping repeated conditions or situations without duplicating function names

## Behavior and Implementation Details

See [behavior-and-implementation-details.md](./references/behavior-and-implementation-details.md) for:

- avoiding tests that overfit private helpers, dependency internals, callback mechanics, or call shapes
- keeping assertions focused on exported behavior from a caller's point of view
- deciding when an implementation detail is actually part of the public contract

## Fixtures, Fakes, and AHA

See [fixtures-fakes-and-aha.md](./references/fixtures-fakes-and-aha.md) for:

- creating fixtures, setup helpers, boundary fakes, mocks, spies, or shared constants
- choosing duplication over premature abstraction when test cases need local clarity
- keeping reusable test helpers obvious, narrow, and behavior-oriented

## Assertions, Snapshots, and Side Effects

See [assertions-snapshots-and-side-effects.md](./references/assertions-snapshots-and-side-effects.md) for:

- choosing assertions for values, async errors, side effects, and mock calls
- asserting a branch's distinguishing observable output plus a negative case, not merely that something renders
- deciding when snapshots are appropriate and how to keep them focused
- verifying observable outcomes without relying on incidental implementation details

## Schemas and Types

See [schemas-and-types.md](./references/schemas-and-types.md) for:

- testing schemas, codecs, decoded response shapes, and collection/list response decoding
- handling type-only modules and compile-time contracts
- balancing runtime schema checks with compile-time type expectations

## Review Checklist

See [review-checklist.md](./references/review-checklist.md) for:

- implementation self-review or code review for unit tests
- checking structure, naming, fixtures, mocks, assertions, and scope
- the optional coverage gate: the project's coverage command, configured thresholds, and ignore-pragma discipline
- reporting residual risk when unit tests cannot cover the behavior with enough confidence

## Project Defaults

These defaults are intentionally short. Follow the linked references for examples, edge cases, and review criteria. Where a rule says "the project's convention", follow the existing local pattern; if none exists, establish one and keep it consistent.

**Guidelines:**

- MUST colocate unit tests following the project's colocated unit-test file naming convention (such as `*.test.ts` or `*.spec.ts` beside the source) unless an existing local pattern requires a different location.
- MUST import the test framework's APIs explicitly when the runner requires or supports it, rather than relying on implicit global-scope symbols.
- MUST use the project's chosen test-case function (`it` or `test`) consistently and not mix it with an alternative spelling within the same project.
- MUST run unit tests through the project's unit-test command (such as `npm run test:unit`) unless investigating a targeted failure.
- MUST run the project's format and lint commands after adding or changing unit tests, plus the type-check command when the project has one.
- SHOULD prefer integration or e2e tests when confidence depends on framework runtime wiring, the data layer, browser behavior, rendering, routing, or user-facing UI.
