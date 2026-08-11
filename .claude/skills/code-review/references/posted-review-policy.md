# Posted and CI Reviews

Apply this reference when the review's output is **posted** to a pull request — by an automated CI reviewer or a managed review product — rather than kept as an internal self-review report. A posted review is read by the change's author and teammates, so it trades the internal four-tier vocabulary for a tighter, lower-noise shape. When these rules conflict with the internal report format, the posted rules win for posted output only; the internal triage still runs underneath.

## Posted vs Internal

The internal review (the four-tier report in evidence-and-reporting.md) is the reviewer's own working triage. The posted review is a communication to the author. The same findings drive both, but they are labeled and grouped differently.

**Guidelines:**

- MUST keep using the internal Critical/Major/Minor/Nit triage and the Approve / Approve with Nits / Request Changes verdict to _decide_ what to report; they never appear in posted output.
- MUST switch to the posted shape below whenever the review is written to a pull-request thread rather than returned as a self-review report.
- SHOULD adopt any repository-provided posted-review policy on top of these defaults, and let that policy win where it is stricter or more specific.

## Two-Label Severity

A posted review uses exactly two labels, so the author can sort must-fix from nice-to-have at a glance.

- **Important** — must be addressed before merge: a finding that breaks behavior, corrupts persisted state, leaks data, regresses accessibility, violates a hard project rule, or leaves an acceptance criterion unmet or unverifiable from the diff.
- **Nit** — safe to defer: style, naming, and refactoring suggestions.

**Guidelines:**

- MUST label every posted finding exactly **Important** or **Nit** — no other labels appear.
- MUST map every internal Critical or Major to Important, and every internal Minor or Nit to Nit.
- MUST label as Important any acceptance criterion the diff leaves unmet or that cannot be confirmed from the diff.

## Mandatory Checks

A posted review is strict: it runs a fixed set of checks every time and raises a finding for each miss, rather than reviewing only what happens to catch the eye.

**Guidelines:**

- MUST verify the change against every project rule that matches the changed files and raise an Important finding for each violated hard rule, citing the rule.
- MUST verify the diff against every acceptance criterion of the linked issue, name each unmet or unverifiable one as Important in the summary, and state plainly when the pull request links no issue.
- MUST give each finding a label, `file:line` evidence, and a concrete fix, exactly as an internal finding.

## Do Not Report

Findings the project's CI already enforces mechanically are noise in a posted review: CI blocks the merge regardless, so restating them spends the author's attention without adding a gate. This exclusion governs posted output only — internal self-review still flags these.

**Guidelines:**

- MUST NOT post a finding for anything the project's CI already enforces (for example its lint, type-check, and test gates), even where a severity floor would otherwise rate it Critical.
- MUST NOT post style findings on lockfiles or generated files.
- MUST still apply these same checks in internal self-review, where CI is not a substitute.

## Reporting Shape

A posted review is two shapes and no more: inline comments anchored to the diff, and one summary comment that opens with a tally. Scattering findings across separate top-level comments makes the review hard to read and hard to resolve.

**Guidelines:**

- MUST anchor each finding as an inline comment on the relevant diff line, and post one summary comment opening with a one-line tally (e.g., `2 important, 7 nits`).
- MUST report every finding; the same nit repeated across the diff MAY share one inline comment that lists each occurrence, and nothing is summarized away — the tally counts every finding.
- MUST post the review as a plain **comment**, never as a formal approving or change-requesting review, when the reviewer is advisory and does not gate merges.

## Running a Reviewer Safely in CI

An automated reviewer triggered from pull-request activity is an attack surface: an untrusted contributor's branch must never gain the reviewer's privileges. These properties keep an automated reviewer safe, independent of any specific CI system.

**Guidelines:**

- MUST run the reviewer against the diff read through the platform API and check out the **base** ref for context, never execute the untrusted head branch's code on the runner.
- MUST scope the reviewer's credentials to the least privilege it needs — read code, write review comments — and never grant it write access to repository contents.
- MUST gate the trigger on a trusted author association (owner, member, or collaborator) so an untrusted commenter cannot spend the reviewer's budget or steer it.
- MUST complete the whole review synchronously within the single triggered run and post before it ends; work deferred to a background task is lost when the run terminates.
