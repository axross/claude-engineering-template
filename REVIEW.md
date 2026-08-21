# Review Instructions

<!-- INIT:OPTIONAL key=INDEPENDENT_REVIEW — Fixed: INIT KEEPS this file (the independent-review channel is fixed infrastructure, see INIT.md Step 4). Just delete this marker and the italic note below, then configure it — enumerate the do-not-report list from the checks CI actually enforces. A project that wants no automated review loop disables the workflow triggers rather than deleting this file. -->
*Configure this policy during INIT: enumerate the do-not-report list from the project's CI-enforced checks.*

Review **policy** for this repository — the highest-priority, review-only
instructions. Every reviewer entry point reads this file: a managed review
product (e.g. Claude Code's managed Code Review) natively, and the CI
reviewer ([`claude-review.yaml`](.github/workflows/claude-review.yaml)) via a
system-prompt bootstrap. This file overrides reviewer defaults and complements
the review
**methodology** in
[Code Review](.claude/skills/code-review/SKILL.md); where
the two differ about what a posted review reports, this file wins (see that
skill's [Posted and CI Reviews](.claude/skills/code-review/SKILL.md#posted-and-ci-reviews)).

This is a **strict** review: run every mandatory check below, verify the linked
issue's acceptance criteria, and report every finding — do not wave anything
through.

## Severity Vocabulary for Posted Reviews

A posted review uses exactly two labels. The internal Critical/Major/Minor/Nit
triage and the Approve / Request-Changes verdict vocabulary stay out of posted
output — they exist for self-review, not for the pull-request thread.

- **Important** — MUST be addressed before merge: a finding that breaks
  behavior, corrupts persisted state, leaks data, regresses accessibility,
  violates a MUST rule of a matching skill (discovered by its `description`),
  or leaves an acceptance criterion unmet or unverifiable from the diff.
- **Nit** — safe to defer: style, naming, and refactoring suggestions.

**Guidelines:**

- MUST label every posted finding exactly **Important** or **Nit** — no other
  labels appear in a posted review.
- MUST label as Important every violated MUST rule of a matching
  skill, every acceptance criterion that is unmet or cannot
  be confirmed from the diff, and every mandatory-check miss that breaks a hard
  requirement.
- MUST label style, naming, and refactoring suggestions Nit at most.

## Mandatory Checks

Run both checks on every review and raise a finding for each miss — they are
not skippable. Grade each miss by its real impact: a miss that breaks a hard
requirement is **Important**, a gap that does not is a **Nit**. Cite the owning
skill in the finding.

- **Skill conformance** — verify the change conforms to **every** skill whose
  discovery condition (`description`) matches the changed files, and flag any
  deviation from a skill's stated rule, citing the skill and the rule. A
  violated skill **MUST** rule is Important.
- **Acceptance criteria** — verify the diff against **every** acceptance
  criterion in the linked issue (the pull request body's `Closes #<n>`), when
  the pull request links one. Each criterion that is unmet, or that cannot be
  confirmed from the diff, is an **Important** finding named explicitly in the
  summary. If the pull request links no issue, say so in the summary.

**Guidelines:**

- MUST run both mandatory checks on every review and raise a finding for each
  miss.
- MUST give each finding a severity label, `file:line` evidence, and a concrete
  fix, per
  [Code Review](.claude/skills/code-review/SKILL.md).

## Reading Beyond the Diff

A change makes claims about its own boundaries — the module, document, or
capability it names as owning a rule it defers to rather than restates. Those
claims are checkable only against what it names, which by construction is not in
the diff. A review confined to the changed files can confirm that a deferral was
written; it cannot confirm the deferral is true, and it cannot see the places
that should have carried one and do not.

**Guidelines:**

- MUST open whatever the change names as the owner of a rule it defers to, and
  compare the change against what that owner actually states.
- MUST additionally open anything whose declared scope overlaps the change's
  topic, whether or not the change names it; a change that duplicates without
  deferring names no owner to follow, and is the case this check most needs to
  reach.
- MUST treat a file being outside the diff as no exemption from reading it;
  opening a neighbour is the cost of checking a boundary claim, not extra scope.
- MUST NOT generalize from one compliant instance to the whole change — a single
  correct deferral is evidence about that section and no other.

## What Is Not Evidence

The author's own account of a change cannot corroborate it. A verification
table, a criteria checklist, and a disclosed figure are all products of the
same loop that produced the diff, so agreement between them and the change is
self-consistency, not correctness. A review that re-runs the author's checks
and confirms the author's numbers has audited the arithmetic, not the change.

Self-authored acceptance criteria carry a specific blind spot worth naming.
Criteria asserting that something is **present** are monotone in content:
adding text or code can satisfy them but never violate them. A change can
therefore meet every criterion and still be substantially duplication and
bloat.

**Guidelines:**

- MUST NOT treat the pull request body's verification table as evidence of
  correctness; that the diff matches the numbers in the description is a
  consistency check the author already ran.
- MUST NOT treat "all acceptance criteria met" as sufficient when the criteria
  were authored in the same loop as the change; search separately for what
  presence-only criteria cannot detect — duplication, bloat, and content that
  should have been cut.
- MUST compare the actual against any expected numeric band stated in a linked
  issue or plan, and raise a finding when it falls outside; the author having
  disclosed the miss does not discharge it.
- SHOULD re-derive a figure the review relies on rather than quoting the
  author's, and say so in the summary when it could not be re-derived.
- MUST treat a fired tripwire as a finding wherever the expectation was recorded
  — a band that lived only in issue prose still binds the review.

## Do Not Report

Findings the project's CI already enforces mechanically are noise in a posted
review — CI blocks the merge regardless, so restating them costs the author's
attention without adding a gate. This exclusion governs **posted** reviews
only; internal self-review triage still flags these findings.

The list is **enumerated, not generalized**, and deliberately so. A blanket
"anything CI enforces" silently widens every time a check joins the merge-checks
workflow, removing categories from this reviewer's scope without anyone
deciding to. Each entry names a check that is **coextensive** with the finding
it excludes — the mechanical check and the finding are the same thing. A check
that is only a narrow proxy for a broader prose rule does **not** silence the
reviewer on that rule.

<!-- INIT: replace the bullets below with one entry per check this project's CI actually enforces (the jobs in .github/workflows/merge-checks.yaml). Name the check, not the category — and add an entry only when the check and the finding it would silence are the same thing. -->

- The lint check run by the project's merge-checks workflow.
- The unit-test run by the project's merge-checks workflow — a test that fails
  there, not a test that is missing.
- Lockfiles and generated files, including any installed skill directory under
  `.claude/skills/`, which is generated from `skills-lock.json`.

**Guidelines:**

- MUST NOT report, in a posted review, any finding on the do-not-report list
  above.
- MUST keep reporting a finding whose CI check is only a narrow proxy for a
  broader rule; a partial mechanical check never removes a prose rule from this
  reviewer's scope.
- MUST add an entry to the list above only when a new CI check is coextensive
  with the category it would silence, and MUST NOT restore a blanket "anything
  CI enforces" clause in its place.

## Reporting

Anchor each finding as an inline comment on the diff, and post one summary that
opens with a one-line tally (e.g. `2 important, 7 nits`). There is no nit cap
and nothing is summarized away — the tally counts every finding.

**Guidelines:**

- MUST report **every** finding; the same nit repeated across the diff MAY
  share one inline comment that lists each occurrence.
- MUST keep reporting to two shapes — inline comments for the findings, one
  comment for the summary — and MUST NOT scatter individual findings across
  separate top-level conversation comments.
- MUST post any pull-request review as a **COMMENT**-type review — never
  APPROVE or REQUEST_CHANGES — per
  [GitHub Operation](.claude/skills/github-operation/SKILL.md); this reviewer
  is advisory and does not gate merges.
