# Escalation and Decisions

Apply these rules to decide what stays inside the review report versus what must be deferred. The review phase's only output is the report — it does not act on the codebase, and it does not delegate the review elsewhere.

## The Reviewer Reports, It Does Not Act

The review phase produces a report, not a patch — mixing edits into it destroys the separation between finding problems and fixing them, and leaves the fixes themselves unreviewed.

**Guidelines:**

- MUST NOT mutate the codebase during the review phase; apply fixes only after the report is complete and the work has switched back into implementation mode.
- MUST NOT delegate the review elsewhere; frame every finding so the caller or the later implementation phase can act on it without another reader.
- SHOULD make each Critical and Major finding specific enough — file, line, and a diff-style fix snippet — that the eventual fixer applies it without re-deriving the context.

## Make Fixes Trivially Applicable

A Critical or Major fix that lands without its verification step can silently trade the original defect for a new one.

**Guidelines:**

- MUST list, under Recommended Actions, the verification step (the lint or test command, a manual check of the affected surface) needed after each Critical or Major fix.
- SHOULD phrase each recommendation as an imperative checklist item written to the future fixer — "Apply fix #1, then run the lint command."

## Surface Recurring Gaps

A defect class that recurs with no rule to cite will keep reappearing in future changes until the guidance catches up — but the review report is not the place to change the guidance.

**Guidelines:**

- SHOULD note, as a "Guideline gap:" bullet under Recommended Actions, when the same defect class appears several times in the diff and no current rule cleanly covers it, and propose where a rule could live.
- MUST NOT report an ordinary lint failure, format failure, snapshot update, or an already-documented rule as a guideline gap; those are ordinary findings, cited against the existing rule.

## Escalate High-Risk Changes

A single-agent self-review cannot substitute for independent review on changes where a missed defect could expose private data, break production, or destroy content. Such a change may still be implemented, but the report must not call it merge-ready on self-review alone.

**Guidelines:**

- MUST mark a high-risk self-reviewed change as needing an external gate — user review, CI/PR review, or explicit user acceptance — before merge-readiness.
- MUST treat as high-risk: authentication and access control, secrets and environment-variable exposure, rendering of untrusted input, SSRF/outbound fetching, irreversible data or schema migrations, public interface contracts, production configuration, analytics/privacy capture, and broad cross-cutting refactors.
- MUST list the required external gate under Recommended Actions when the change is high-risk.
- SHOULD attach the strongest local verification evidence available before escalating, so the external reviewer checks a narrowed risk rather than the whole change.

## Defer Decisions to the Caller

Some findings are genuine trade-offs with no single right answer from inside the diff. The reviewer names the options and recommends one; it does not silently pick a side.

The reviewer MUST defer the decision back to the caller when a finding involves any of:

- A breaking change to a public interface contract (a public URL, an API response shape, or another consumer-facing contract) that already has consumers.
- A data or schema migration that becomes irreversible once applied to production, such as dropping a non-empty column.
- A cost or performance trade-off that needs production data to evaluate, such as choosing a short versus a long cache lifetime — the rule may be "cache it", but the value is a judgment call.
- Adoption of a new third-party service or API key with a budget or vendor-lock implication.

**Guidelines:**

- MUST frame a deferred item under Recommended Actions as a "Decision needed:" entry with at least two enumerated options and the reviewer's tentative recommendation.
- MUST defer a trade-off between two equally strong conventions when no hard rule breaks the tie, rather than inventing one.
