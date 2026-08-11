# Lint and Format Gate

Apply these rules to verify the author respected the project's mandatory checks.

## Changes to the Gate Itself

A change to the gate's own configuration is the one case where a green build proves least: the diff can weaken or disable the very check that would have flagged it, and the build still passes. So the gate's configuration is reviewed as an output surface in its own right, not as ordinary config.

**Guidelines:**

- MUST treat a diff touching the project's lint or format configuration, its git hooks, or its CI workflow definitions as putting the verification gate itself at risk, and require evidence that the gate still runs and still fails on a violation.
- MUST flag a Critical when such a diff removes, narrows, or downgrades a rule, a checked path, or a gate step without a stated justification — a silently weakened gate is indistinguishable from a passing one.
- SHOULD ask the author to state which gate steps ran on the changed configuration, since a configuration error can make a gate exit zero without checking anything.

## Format

Formatting drift is caught by CI, so an unformatted diff is a guaranteed red build rather than a matter of taste.

**Guidelines:**

- MUST verify the diff is formatted: run the project's format command on the changed files when the diff is available in a local checkout and flag any resulting reformat; otherwise inspect the diff for these concrete drift categories — tab/space inconsistency, trailing whitespace, missing trailing newline, quote-style drift. Flag either as Critical (lint will fail).
- MUST flag a hand-applied formatting change to a file the diff did not otherwise need to touch — that violates the project's change-management scope discipline.

## Lint

A lint error fails the build, and most of the categories the linter promotes to errors mark a real hazard, not a style quibble.

**Guidelines:**

- MUST flag a Critical for any introduced lint **error** (not warning). Common categories to watch for:
  - an escape-hatch type (e.g., an `any`-equivalent) where the linter forbids it
  - an `import` from a package not declared in the project's manifest
  - a platform/runtime import used outside the file(s) where the linter whitelists it
  - an access to environment variables outside the file(s) where the linter whitelists it
  - any other project-specific rule the linter is configured to treat as an error
- MUST flag a Major when modified files carry **new** lint warnings.
- SHOULD report pre-existing lint warnings in changed files as Minor with a "consider fixing while you're here" framing — these are explicitly allowed to be cleaned up per the project's code-quality rules.

## Suppressions

An unexplained suppression is indistinguishable from a bug being papered over; the justification is what lets a later reader trust it.

**Guidelines:**

- MUST flag a new inline linter suppression directive whose line carries no comment justifying why the rule is disabled there. The project rule is "explain why, not just what".
- MUST flag a new block-level linter suppression in any file that is not one of the whitelisted exception points the linter config defines.
- SHOULD flag a type-checker suppression (e.g., a "ts-expect-error"-style directive) introduced without a comment explaining the upstream type bug it works around.

## Type Safety Compliance

Every escape-hatch cast or suppression turns off the type checker exactly where it was about to catch something, pushing the failure to runtime.

**Guidelines:**

- MUST flag any introduced escape-hatch cast or suppression (e.g., an `any` cast, an unsafe double cast, or a type-checker error suppression) swallowing a real error, per the project's own code conventions, if defined.
- MUST flag a missing return type on a new exported function when the project's conventions require explicit return types.
- SHOULD flag a non-`type`-only import for symbols used only as types when the project distinguishes type-only imports.
