# Verification Strategy Craft

Apply this reference when drafting or reviewing the **Verification strategy** section of a spec — the ordered list describing how to confirm the work is done. It follows Acceptance criteria: the criteria say _what_ done means; the strategy says _how_ a person or pipeline checks it. Sourced from test-planning and bug-reporting practice: the [ISTQB glossary on test strategy](https://glossary.istqb.org/en_US/term/test-strategy) and [test plan](https://glossary.istqb.org/en_US/term/test-plan), the [Kubernetes KEP template's test plan](https://github.com/kubernetes/enhancements/blob/master/keps/NNNN-kep-template/README.md), and [Mozilla's bug-writing guidelines](https://bugzilla.mozilla.org/page.cgi?id=bug-writing.html).

## Ordered, Executable Steps

A verification strategy is a numbered sequence a reviewer can follow without improvising: each step names a command to run or an observable check to make, in the order that catches failures earliest. "Run the e2e suite" is a step; "make sure it works" is not. The ordered form is what separates this section from the acceptance criteria it verifies — criteria are judged, steps are executed.

**Guidelines:**

- MUST write the section as an ordered list; each step names a concrete command or an observable check with its expected outcome.
- MUST order steps so the cheapest, most failure-prone checks run first.
- MUST keep every step traceable to an acceptance criterion or a verification gate; a step that verifies nothing the spec states is scope creep in disguise.

## Steps to Reproduce for Bug Work

For a bug, verification starts before the fix: the strategy opens with the steps that reproduce the defect — the same discipline Mozilla's bug-writing guidelines mandate for reports — followed by the post-fix expectation over those same steps. A fix whose defect was never reproduced verifies nothing; the repro is what turns "it seems fixed" into "the observed failure no longer occurs".

**Guidelines:**

- MUST, for bug work, open with numbered steps to reproduce the defect and the currently observed (broken) result.
- MUST state the post-fix expectation over the same steps — what running them shows once the fix lands.
- SHOULD note the environment specifics (route, data state, viewport, platform) when the defect only reproduces under them.

## Verification Gates

"Done" includes passing your project's own gates, not only the feature behavior. The gates the changed surface requires — typically format/lint, the relevant test suites (unit, integration, and end-to-end as applicable), and a build — are defined by your project's own development and verification conventions; this section names which of them apply to the change and why any is skipped. Keep the gate names at the level the spec's reader can run them, and defer the exact command syntax to your project's tooling docs.

**Guidelines:**

- MUST list the verification gates the changed surface requires as trailing steps, drawn from your project's own verification conventions.
- MUST state why a normally-expected gate is skipped (e.g., "docs-only change — test suites and build are unaffected"), never skip one silently.
- SHOULD name the gate by what it verifies rather than reproducing its full command line, so the spec stays readable and does not drift when the command changes.

## Coverage to Add or Update

The spec names the test coverage the work adds or updates — which suites, which behaviors — so the reviewer can check the coverage landed, not just that existing tests still pass. How those tests are written belongs to your project's own testing conventions; this section only names the coverage at spec level.

**Guidelines:**

- MUST name the test coverage to add or update as verification steps — the suite (unit, integration, e2e) and the behavior each addition pins down.
- MUST defer test-writing mechanics (naming, structure, locators, fixtures) to your project's own testing conventions rather than restating them here.
- SHOULD state when no new coverage is warranted and why (e.g., existing suites already pin the behavior; the surface is documentation-only).
