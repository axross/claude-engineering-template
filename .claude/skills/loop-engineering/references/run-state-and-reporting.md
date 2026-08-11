# Run State and Reporting

Apply this reference when recording the run's durable state, and when the run reaches convergence and reports back. It expands the [Run State and Reporting](../SKILL.md) section in the parent skill.

## GitHub as Lightweight State

State lives in this running session; GitHub carries a thin breadcrumb — invisible to a human reading GitHub's rendered page, and fully visible to any agent, including this loop's own participants, that reads the raw body — so a resumed or reclaimed session can recover. The run posts no status or attention comments. It authors exactly three kinds: the dedicated review request (Phase 3), the marked review-thread replies that tie each resolved finding to its commit (Phase 4), and — only where the issue body cannot spare the room — the marked archival comment holding the original description (Phase 1, see [plan-document.md](./plan-document.md)).

**Guidelines:**

- MUST keep the run's state in a single **status block**: an HTML comment (`<!-- ... -->`) embedded in the pull request description — invisible in the rendered UI, present in the raw markdown. Before the pull request exists, keep the same block in the issue body. Record the current phase, the review-round count, what the run is waiting on, and any open question; update it in place.
- MUST NOT post a separate status comment or @mention the maintainer for attention; convey ready-to-merge, dormancy, and non-convergence in the turn output instead. The archival comment above is not an exception to this — it carries the original description, never run state.
- MUST NOT write the literal review trigger phrase anywhere except the dedicated review request — a comment-triggered workflow fires on that phrase appearing anywhere in a body. Refer to it as "the independent review" everywhere else.
- MUST reconstruct state from GitHub before acting on a resume, and resume the one pending step the block names rather than restarting from Plan.
- MUST read the status block through a channel adequate to what it carries, and reconstruct from the signals that survive where no such channel exists — [github-conventions.md](./github-conventions.md) owns that rule for every body the loop reads, and states it once. The block being an HTML comment is what makes it acute here: a sanitizing read removes it whole, returning a body that looks like one carrying no state at all.

## Delegated Run State

When the run delegates implementation, the state that matters on a resume grows: which mode the run is in, who wrote last, and how far the current attempt got. Session state carries the detail; the status block carries only what a fresh session cannot re-derive.

Session state should hold the execution mode (delegated, single-agent, or recovering), the worker-resolution source (explicit, custom, built-in, or none), implementation status, the current plan revision and task phase, the attempt number, the writer owner, any opaque continuation handle, model and effort certainty, and the reason for a fallback or recovery.

The status block adds only durable recovery information: execution mode, implementation status, the approved plan revision, the latest coherent implementation HEAD where available, phase, review round, waiting state, any open question, and the delegation-permission determination together with any answer the human gave it.

Where the pre-flight review runs, its round number and waiting state join that list unconditionally. Its finding entries join it only while the run is parked on the human question that needs them there, and are cleared before the run resumes past it — durability is earned by the same reasoning the principle above gives: a fresh review worker produces a _different_ finding set, so a ledger lost mid-park cannot be re-derived by re-running the review, while one lost between parks costs nothing. [pre-flight-review.md](./pre-flight-review.md)'s Ledger Durability owns exactly when the entries are and are not written, their ceiling, and what a run does when it cannot read the block back.

**Guidelines:**

- MUST NOT duplicate the commit list into the status block; Git history and the completion receipt stay authoritative for individual commits.
- MUST keep opaque worker identifiers, transcript paths, and other ephemeral harness details in session state rather than writing them to GitHub.
- MUST treat a status-block entry that names no determination as invalid; the delegation-permission field carries one of the three results — permitted, barred, or undetermined — together with the policy text quoted or the no-restricting-policy observation from [implementation-worker.md](./implementation-worker.md#a-spawn-the-harnesss-policy-blocks).

## Reporting a Delegated Run

Execution detail belongs inside the existing report, not beside it. A separate agent-activity log competes with the summary the human actually reads.

**Guidelines:**

- MUST fold into the completion summary and the ready-to-merge handoff: whether the run was delegated, fell back to single-agent, or recovered; the worker-resolution source; the delegation-permission determination and, where a question was put, the human's answer; model and effort as verified, declared, or unknown; the fallback or recovery reason; whether the intended implementation-model saving was actually achieved; any skipped or unavailable verification; and residual worker or routing risk.
- MUST NOT duplicate that information into a separate verbose activity log.
- MUST report, where the pre-flight review ran, how many findings it raised and how many were fixed, dismissed, or deferred — and, once the independent review lands, how many of its findings pre-flight had not raised. The second figure is what answers whether the stage earns its cost: a pre-flight that consistently misses what the external review then finds is not working.
- MUST report a review worker's disclosure that it read run state — its own status block or another run's — while judging the diff (see [pre-flight-review.md](./pre-flight-review.md)'s Run State Is Not Input), so an exposure the write/clear pairing failed to prevent does not go unrecorded.

## Ready-to-Merge Handoff

When a run flips its pull request to ready, that same chat turn doubles as a **verification brief**: hand the human everything they need to exercise the change before merging. Deliver it in the session's chat turn output only — never as a GitHub comment.

**Guidelines:**

- MUST name, in the handoff and in any completion claim, the tracking issue, the pull request, the approved plan revision the work implements, and the independent review's outcome (round count and verdict), with links where they exist — a completion report that cannot cite its pull request, its plan revision, and its review is reporting work that is not ready.
- MUST judge whether the change is human-observable first. Write the brief only when the change alters something a human can see or operate — a route, a rendered surface, a command, an admin view. For a purely internal change (build, refactor, non-visible logic) with nothing to walk through, say so in one line and stop.
- MUST spell out what to exercise and how, derived from the plan's acceptance criteria and the changed surfaces: the specific routes, pages, or commands to open, and the states to exercise (loading, empty, error, responsive widths, theme, locale) where they apply.
- SHOULD hand over a per-PR preview URL when the project deploys one — sourced from the newest preview-deploy comment and verified against the branch-head SHA, never constructed from memory. When there is no usable preview, give the local verification steps instead; never fabricate a URL.
