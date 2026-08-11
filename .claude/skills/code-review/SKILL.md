---
name: code-review
description: Reviewing a code change — a pull request, a branch or commit-range diff, or a post-implementation self-review of your own work before calling it done. Not for writing the change, only for judging one that already exists. Covers the reviewer-mode reset and diff scoping, a four-tier severity scale with fixed floors, evidence-based reporting with file-line citations and fix snippets, escalation for high-risk changes, a posted/CI overlay that collapses to Important/Nit, and lenses for correctness, maintainability, security, testing, and performance. Self-contained, so it works installed on its own.
user-invocable: false
---

# Code Review

Use this capability whenever you review a code change — a pull request, a branch or commit-range diff, or your own work before you call it done — whatever the change type, language, or domain. The skill is self-contained: every rule it needs lives here, so it stays correct when installed on its own without any companion skill. When the host project ships its own code-review guideline or posted-review policy, defer to it for project-specific rules and precedence; the methodology here still applies in full wherever that project guidance is silent.

A review has one job — decide whether a change is safe to merge and say why, with evidence — and one output: a report. It does not rewrite the code. Keep finding problems separate from fixing them.

**Review target.** The target is the change already under review: the working tree against the base branch by default, or a specific pull-request reference, branch name, or commit range when one is named. Establish the diff for that target before reading anything else (see [scoping.md](./references/scoping.md)).

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## The Review Loop

Every review runs the same loop: reset into reviewer mode, scope the change from its diff, assess that diff through the review lenses, classify each finding by severity, report with evidence, and escalate anything too risky to self-approve. The reset is what makes the rest trustworthy — the reviewer inspects what the code _does_, as if someone else wrote it, instead of re-affirming the reasoning that produced it; this matters most in self-review, where the author and reviewer are the same agent. Do not read any code before the reset — it is the first normative step, owned by [scoping.md](./references/scoping.md). The sections below route to the reference that owns each step, ordered as a review applies them.

## Review Scoping

See [scoping.md](./references/scoping.md) for:

- performing the reviewer-mode reset and establishing scope from `git status` / `git diff` / a PR diff
- distinguishing in-scope (the diff) from out-of-scope (pre-existing) code
- reading the full file and every caller/callee around a changed hunk
- handling untracked files, an empty or unclear diff, and generated / tool-managed files

## Severity Classification

See [severity.md](./references/severity.md) for:

- the Critical / Major / Minor / Nit definitions, each pairing a merge impact with a defect class
- the fixed severity floors for categories such as committed secrets, missing access control, unsanitized input, and introduced test or lint failures
- mapping severity counts to an Approve / Approve with Nits / Request Changes verdict
- resolving uncertain severity by escalating upward and stating the assumption

## What to Flag: Review Lenses

See [review-lenses.md](./references/review-lenses.md) for:

- the correctness lens: logic errors, edge cases, error and async handling, contract changes
- the maintainability lens: naming, organization, abstraction boundaries, complexity, dead code, scope discipline
- the security and privacy lens: secrets, input validation, access control, injection, SSRF, auth, data exposure, supply chain
- the testing and verification lens: coverage, stable test hooks, snapshots, flakiness, manual checks
- the performance and reliability lens: data-access cost, concurrency, caching, asset and bundle weight, failure modes

## Evidence and Reporting

See [evidence-and-reporting.md](./references/evidence-and-reporting.md) for:

- the mandatory `file:line` citation on every finding and quoting the offending code
- diff-style (`-`/`+`) fix snippets for every Critical and Major finding
- the exact review-report section order, from Summary through Recommended Actions
- what counts as evidence versus assertion, and how to mark findings the reviewer could not verify

## Review Tone

See [tone.md](./references/tone.md) for:

- addressing the code, not the author, and stating the concrete risk behind each finding
- acknowledging real strengths without inflating trivial ones
- keeping style and preference out of blocking severities
- flagging assumptions explicitly and leaving human-authored copy to its authors

## Escalation and Decisions

See [escalation.md](./references/escalation.md) for:

- keeping the review reporting-only — no code mutation, no delegating the review away
- making each fix trivially applicable and pairing it with its verification step
- escalating high-risk changes to an external gate instead of self-approving them
- deferring genuine trade-offs back to the caller as enumerated Decision-needed entries

## Posted and CI Reviews

See [posted-review-policy.md](./references/posted-review-policy.md) for:

- when a review is _posted_ to a pull request (a CI reviewer or a managed review product) rather than kept as internal self-review
- collapsing the internal four-tier triage to a two-label Important / Nit report with a one-line tally
- running the repository's mandatory checks and honoring its do-not-report exclusions
- keeping a posted review advisory: comment-only, never an approving or blocking formal review
