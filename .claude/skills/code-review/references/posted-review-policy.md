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
- MUST verify the diff against every acceptance criterion of the linked issue and raise an Important finding for each one unmet or unverifiable — anchored inline where it attaches to a diff line, and carried by the summary's no-line entry otherwise — and state plainly when the pull request links no issue.
- MUST give each finding a label, `file:line` evidence, and a concrete fix, exactly as an internal finding.

## Do Not Report

Findings a project's CI already enforces mechanically are noise in a posted review: CI blocks the merge regardless, so restating them spends the author's attention without adding a gate. This exclusion governs posted output only — internal self-review still flags these.

A do-not-report list earns its silence one check at a time, never as a category. Build or adopt one as an **enumerated** list of specific mechanical checks, never a generalized clause such as "anything CI enforces" — a blanket clause silently widens every time a check joins CI, removing categories from the reviewer's scope without anyone deciding to. Each entry MUST be **coextensive** with the finding it excludes: the mechanical check and the finding it silences are the same thing, so confirming the check ran is confirming the finding does not apply. A check that is only a **narrow proxy** for a broader prose rule — for example a check that verifies presence, naming, or a length cap while the rule it stands in for also governs meaning or content — does not meet that test, and silences the reviewer on nothing beyond exactly what it checks; the broader rule stays fully in scope and keeps being reported.

**Guidelines:**

- MUST NOT post a finding for a check named on the host project's do-not-report list, when that list is enumerated and each entry is coextensive with the finding it excludes.
- MUST NOT post style findings on lockfiles or generated files.
- MUST NOT adopt, or fall back to, a blanket exclusion of "anything CI enforces" in place of an enumerated list; add an entry only when a specific new check is coextensive with the category it would silence.
- MUST keep reporting a finding whose only mechanical check is a narrow proxy for a broader prose rule; a partial check never removes the prose rule from the reviewer's scope.
- MUST still apply these same checks in internal self-review, where CI is not a substitute.

## Reporting Shape

A posted review is one submission of the platform's review mechanism — the one that can carry diff-anchored comments — never a set of loose thread comments standing in for it. An anchored comment exists only inside a review submission, so the container has to be chosen before the diff is read, not after the finding count is known; a round with no findings uses the same container as a round with many, or an empty review and a review whose findings were lost become indistinguishable from the outside. Scattering findings across separate top-level comments makes the review hard to read and hard to resolve.

**Guidelines:**

- MUST post the whole review as one submission of the platform's review mechanism able to carry diff-anchored comments, chosen before the diff is read and never replaced by loose thread comments.
- MUST anchor each finding that has a diff line as an inline comment on that line, and post exactly one summary comment opening with a one-line tally (e.g., `2 important, 7 nits`).
- MUST report every finding; the same nit repeated across the diff MAY share one inline comment that lists each occurrence, and nothing is summarized away — the tally counts every finding.
- MUST set the submission's verdict to non-gating when the reviewer is advisory and does not gate merges; this is a decision about the verdict alone, and a non-gating verdict is never a reason to fall back to a looser container.
- MUST post a review with no findings through the same container, with a zero tally and no inline comments.

## Summary Scope

The summary is read again on every round it stays open, and, where an agent drives the change, re-enters that agent's context on every wake — so every line in it that is not a finding or a gap is paid for repeatedly and carries no information. That scarcity is also what a reader can hold a summary to: a summary that characterizes something as a defect while no inline comment carries it is either a finding left unanchored or a finding reported twice, once inline and once in the summary — and both are defects in the review itself, not a matter of taste.

What the summary keeps, exhaustively:

- The tally [Reporting Shape](#reporting-shape) requires the summary to open with.
- Anything that could not be checked, and why.
- A finding that attaches to no single line, and why it has none — an unmet or unverifiable acceptance criterion is the standing case, since what is missing has no line to anchor to.

**Guidelines:**

- MAY carry, as the summary's one exception to every prohibition below, a per-round enumeration a host policy mandates — a standing requirement rather than a re-listing habit, carried in full every round, with each entry held to one line naming the item and its outcome: an explicit "nothing" when the item found nothing, or a pointer to the item's inline comment — never a restated description of it — when it found something. Naming the item and recording that outcome satisfies the enumeration without violating any guideline below.
- MUST NOT put anything in the summary outside the three entries above and the enumeration above; a finding an inline comment already explains and a finding a previous round already resolved both fall outside them, so neither is restated in the summary.
- MUST NOT name in the summary a defect that also carries an inline comment; outside the enumeration above, the only defect the summary may name is one with no line to anchor to, and it MUST state why.
- MUST NOT narrate process in the summary — which files were opened, which checks ran and passed, which of the author's figures were independently re-derived — since a check that passed and produced no finding is reported by the tally alone, or, where a host policy mandates the enumeration above, by that entry's one line, and by nothing else.
- MUST NOT restate in the summary a requirement the project's own standing policy already carries; the reader of the review is subject to that policy too.

## Running a Reviewer Safely in CI

An automated reviewer triggered from pull-request activity is an attack surface: an untrusted contributor's branch must never gain the reviewer's privileges. These properties keep an automated reviewer safe, independent of any specific CI system.

**Guidelines:**

- MUST run the reviewer against the diff read through the platform API and check out the **base** ref for context, never execute the untrusted head branch's code on the runner.
- MUST scope the reviewer's credentials to the least privilege it needs — read code, write review comments — and never grant it write access to repository contents.
- MUST gate the trigger on a trusted author association (owner, member, or collaborator) so an untrusted commenter cannot spend the reviewer's budget or steer it.
- MUST complete the whole review synchronously within the single triggered run and post before it ends; work deferred to a background task is lost when the run terminates.
