# Acceptance Criteria Craft

Apply this reference when drafting or reviewing the **Acceptance criteria** section — the checklist a reviewer uses to judge a finished change against a spec. It sits after the requirements sections (Functional and Non-functional requirements), so every criterion has something earlier in the document to trace to, and is followed by the Verification strategy section that describes how to check it (see [verification-strategy.md](./verification-strategy.md)). Sourced from INVEST-adjacent testability practice and BDD/Gherkin acceptance-criteria craft: [LogRocket's INVEST guide](https://blog.logrocket.com/product-management/writing-meaningful-user-stories-invest-principle/), [Agile Alliance's INVEST glossary entry](https://agilealliance.org/glossary/invest/), [AltexSoft's acceptance-criteria guide](https://www.altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/), [Adaptive US on acceptance criteria](https://www.adaptiveus.com/blog/how-to-leverage-nfrs-to-develop-acceptance-criteria), and [Cucumber's Gherkin style guide](https://cucumber.io/docs/bdd/better-gherkin/).

## Independent Verifiability

A criterion earns its place only if a reviewer can judge it from the diff or the running product without reading implementation code to know whether it passed. INVEST's "Testable" dimension exists for exactly this reason — a story without explicit conditions of satisfaction cannot be confirmed done. Given/When/Then framing keeps each criterion phrased as observable behavior rather than implementation, and independent of other criteria so a single failure is easy to isolate.

**Guidelines:**

- MUST phrase each criterion as one observable behavior a reviewer can check from the diff or the running product.
- MUST NOT require the reviewer to read implementation code to judge whether a criterion passed.
- SHOULD write each criterion so it can be judged independently of the others.

## Concrete Over Adjectival

"Works correctly" and "looks good" are not verifiable; a stated copy string, attribute, threshold, or state transition is. This mirrors the same requirements-smell finding that governs problem-statement language (see [problem-and-scope.md](./problem-and-scope.md)) applied to the checklist itself.

**Guidelines:**

- MUST make each criterion verifiable from the diff or running product — not adjectival ("works correctly", "looks good") — applying [problem-and-scope.md › Concrete, Checkable Language](./problem-and-scope.md#concrete-checkable-language) to the checklist rather than restating its rule here.
- SHOULD prefer a concrete number or threshold over a relative claim ("under 3 seconds" rather than "fast").

## Coverage: Happy Path, Edge Cases, Non-Effects

Most defects live outside the primary flow, so a criteria set that only covers the happy path leaves the riskiest behavior unverified. Boundary-value analysis — testing at and just past a limit — is the standard technique for surfacing these cases. When a change sits next to something that must stay untouched, an explicit "X is unaffected" criterion closes the gap a happy-path-only checklist would leave open.

**Guidelines:**

- MUST cover the happy path.
- MUST cover the relevant edge, disabled, empty, and error states.
- MUST include an explicit "X is unaffected" criterion when the change sits next to a surface that must stay untouched.

## Unaffected Criteria: Property, Not Proxy

An "X is unaffected" criterion is easiest to reach for as a mechanical proxy — matching this file's own push toward concrete, checkable phrasing, "these paragraphs stay byte-identical" reads as strictly verifiable. But a proxy is satisfied or violated on its own terms, not the reason the surface must stay untouched: it cannot separate a change that breaks that reason from a repair the change under review made unavoidable, and it forbids both alike. Name the property the surface must keep instead, so the criterion can still tell the two apart when they diverge.

**Example:**

- **As a proxy** — "The three paragraphs following the list are byte-identical to their prior state."
- **What it was protecting** — that those paragraphs still make the claims they made, and every reference inside them still resolves to something that exists.
- **As a property** — "The three paragraphs following the list still make the same claims, and every reference in them still resolves to something that exists; any edit to them is confined to what removing the list made unavoidable."

Both forms are judged from the diff — the property form asks a reviewer to check something more specific there, not to stop checking the diff at all.

**Guidelines:**

- MUST name, in an unaffected criterion, the property that must survive rather than a mechanical equivalence standing in for it.
- MUST keep that named property judgable from the diff, so stating intent does not cost the diff-checkability every criterion in this file already requires.
- MUST reconcile the criterion, not the work, when the two diverge, and record the reconciliation rather than applying it silently.

## Right-Sized Checklists

A checklist that needs far more than a handful of criteria is usually a sign the underlying story should split; too few leaves testable gaps that surface as bugs later. Practitioner guidance converges on roughly three to seven or eight criteria as a starting rubric, not a hard ceiling. Verification gates — your project's format/lint/test/build commands — are part of "done" but not part of this checklist: they live in the Verification strategy section, keeping the criteria purely about the change's observable outcomes.

**Guidelines:**

- SHOULD right-size the checklist to roughly three to seven criteria; treat materially more as a signal to reconsider the change's scope rather than padding restatements of the same behavior.
- MUST keep verification gates (format/lint, test suites, build) out of the criteria checklist; they belong in the Verification strategy section per [verification-strategy.md](./verification-strategy.md).
- MUST NOT restate the same observable behavior across multiple bullets.
- MUST write each criterion as a plain bullet (`-`), not a task-list checkbox (`- [ ]`) — unless the target process actually checks the boxes, an unchecked box reads as perpetually incomplete.

## Traceability

An acceptance criterion that names a behavior the rest of the spec never mentioned is either a hidden scope addition or a sign the spec is incomplete. Definition of Done and acceptance criteria are complementary, not interchangeable — DoD is the fixed, cross-cutting bar every change must clear, while acceptance criteria are the criteria specific to this change's stated requirement.

**Guidelines:**

- MUST trace every criterion back to something the spec's other sections actually specify.
- MUST NOT introduce net-new scope only in the acceptance criteria.
