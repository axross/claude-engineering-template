# Review Scoping

Apply these rules at the start of every review to bound the work and avoid drifting into unrelated code.

## Reviewer-Mode Reset

For self-review, the same agent that wrote the change must deliberately switch roles before inspecting the diff. The reset cannot create true independence, but it creates a fresh review boundary — the reviewer looks at what the code _does_, not at what the author meant it to do.

**Guidelines:**

- MUST stop editing before beginning a review pass.
- MUST reread the original request and the acceptance criteria before inspecting implementation details.
- MUST run `git status` and inspect the relevant `git diff` before opening changed files.
- MUST treat prior implementation reasoning as unverified until the diff and verification evidence support it.
- MUST judge only the diff and its observable behavior, not the author's stated intent.
- MUST perform a second-pass re-review after fixing any Critical or Major finding, because the fix is itself new, unreviewed code.

## Search Method

The reset above corrects the reviewer's stance; it does not correct their method, and the two fail independently. A search that tests named suspicions — the phrases, symbols, or shapes the reviewer already has in mind — returns only members of the set they already imagined. An instance nobody thought to suspect stays invisible, however honest the reset was. Passing the reset is therefore not evidence that coverage was adequate.

The gap opens when a finding class is defined by a property that could hold anywhere in the changed surface — duplication, dead code, a convention applied inconsistently — rather than by a location. A property has no address to search, so its instances sit wherever nobody looked. For a defect at a known location, or a criterion checked against one named place, a targeted search is exactly the right instrument.

**Guidelines:**

- MUST treat a targeted search as evidence only about the hypotheses it tested, never as evidence that a finding class is covered.
- MUST, where a finding class is defined by a property that could hold anywhere in the changed surface, compare that surface exhaustively rather than by named suspicion — a comparison whose result does not depend on having guessed the instance in advance.

## Default Scope

A review that wanders into pre-existing code loses track of what the current change is accountable for and dilutes attention across problems the author did not introduce.

**Guidelines:**

- MUST default to **only the changed code** — the diff between the working tree (or a review branch) and the base branch. Do not review pre-existing code unless the request explicitly asks for a broader audit.
- MUST establish that diff mechanically before reading any file: `git diff <base>..HEAD` for a branch, `git diff` for an uncommitted working tree, or the PR diff for a pull request. Do not reconstruct the change set from memory.
- MUST also inspect untracked files surfaced by `git status`; a newly added file is part of the change even though no diff hunk precedes it.

## Reading Surrounding Context

Correctness lives in context: a hunk that reads correctly on its own can still break the control flow, the boundaries, or the callers that surround it.

**Guidelines:**

- MUST read the full file containing each changed hunk, not only the hunk. A line that looks safe in isolation can be unsafe in its surrounding control flow.
- MUST inspect every caller of a changed function and every callee a changed function newly calls, so a signature or contract change is checked at both ends.
- SHOULD read the surrounding modules a changed unit participates in — its parent, its siblings, and any shared entry point — because cross-module assumptions (trust boundaries, lifecycle order, concurrency) span files even when the diff touches only a leaf.
- SHOULD read the matching test for a changed unit to confirm whether existing tests still cover the changed behavior.

## Out-of-Scope Findings

Charging the current change with blocking severity for problems it did not introduce holds it hostage to unrelated work.

**Guidelines:**

- SHOULD NOT report pre-existing issues outside the diff as Critical or Major. They MAY appear as Minor or Nit observations only when the new code now depends on them (for example, a pre-existing unguarded value the change starts to rely on).
- SHOULD collect pre-existing issues under a separate "Pre-existing observations" section so the author can decide whether to address them in a follow-up rather than in this change.

## When the Diff Is Empty or Unclear

With nothing to diff, there is no defined change to review, and any files the reviewer picks on its own are a guess at the wrong target.

**Guidelines:**

- MUST ask which files, branch, or PR to review when the computed diff is empty and no explicit target was supplied.
- MUST NOT guess a target. An empty diff with no instruction means the review request is malformed, not that there is nothing to find.

## Generated and Tool-Managed Files

Style feedback on files a tool produces is noise the author cannot act on, because the fix would mean changing the generator rather than the file.

**Guidelines:**

- MUST NOT review generated or tool-managed files for code style — lockfiles, generated type definitions, build output, framework- or ORM-generated directories, and vendored code.
- SHOULD still flag a generated schema or data migration when it appears to drop or rename a field destructively without a backfill; that is a behavior risk, not a style comment.
- SHOULD confirm what the project treats as generated before excluding a path, since the set varies per project and a hand-maintained file can look generated.
