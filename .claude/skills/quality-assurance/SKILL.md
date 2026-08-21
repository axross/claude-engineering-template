---
name: quality-assurance
description: Reviewing whether a change carries adequate verification evidence — "is this verified", "did this break anything", "were the required checks run". The reviewer's QA pass on top of the development verification rules, judging the evidence a change offers rather than re-deriving the rule behind it. Covers requiring command evidence for the format and lint gate, treating a change to the gate's own configuration as a risk to the gate itself, matching manual checks to the changed output surfaces, mapping a skipped check to residual risk, and asking whether a check that passed was ever capable of failing.
user-invocable: false
---

# Quality Assurance

Use this capability to judge whether a change has been adequately verified before merge. This is the reviewer's lens — flag missing evidence and link to the developer-facing rule rather than re-deriving it.

The severity labels used throughout (Critical, Major, Minor) are owned by the project's review severity model; consult it for each tier's definition, fixed floors, and verdict mapping.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Verification Evidence

See [verification-evidence.md](./references/verification-evidence.md) for:

- Commands run, exit status, and relevant output
- The evidence-adequacy decision flow from changed surface to covered-or-flag
- Whether a result was ever capable of coming out differently, and the fixture and harness failures that make a green or red check carry no information
- Manual checks matched to changed output surfaces
- Skipped required checks and residual risk
- Second-pass verification after fixing Critical or Major findings

**Guidelines:**

- MUST read [verification-evidence.md](./references/verification-evidence.md) before accepting `tests pass` or `tested manually` without the command or route behind it, before accepting the reason given for a skipped required check, before treating a green check as evidence for a behavior nothing else covers, and before ruling on whether a fix for a Critical or Major finding was verified a second time.

## Lint and Format Gate

See [lint-and-format-gate.md](./references/lint-and-format-gate.md) for:

- The author ran the format and lint commands per the project's code-quality rules
- A diff touching the gate's own configuration, hooks, or CI workflows, and the evidence that the gate still catches violations
- No new inline linter suppressions without an inline justification
- No new lint warnings introduced into modified files

**Guidelines:**

- MUST read [lint-and-format-gate.md](./references/lint-and-format-gate.md) before judging a diff that touches lint or format configuration, a git hook, or a CI workflow definition, and before ruling on an introduced lint error, a new warning in a modified file, or a new inline suppression or escape-hatch cast.

## Manual Verification Evidence

See [manual-verification.md](./references/manual-verification.md) for:

- The author exercised non-default content states when the change touches a data-driven surface
- The not-found UI was verified for routing changes
- The dev-server output was checked for new warnings or errors

**Guidelines:**

- MUST read [manual-verification.md](./references/manual-verification.md) before judging a change to a data-driven surface, a route, or the running app's own output, where the commands that passed exercise none of what a human would see.
