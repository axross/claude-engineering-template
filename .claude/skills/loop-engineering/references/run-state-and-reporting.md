# Run State and Reporting

Apply this reference when recording the run's durable state, when the run reaches convergence and reports back, and when deciding whether a turn that only reports may end there or must carry its next step in the same turn. It expands the [Run State and Reporting](../SKILL.md) section in the parent skill.

## GitHub as Lightweight State

State lives in this running session; GitHub carries a thin breadcrumb — invisible to a human reading GitHub's rendered page, and fully visible to any agent, including this loop's own participants, that reads the raw body — so a resumed or reclaimed session can recover. The run posts no status or attention comments. It authors exactly three kinds: the dedicated review request (Phase 3), the marked review-thread replies that tie each resolved finding to its commit (Phase 4), and — only where the issue body cannot spare the room — the marked archival comment holding the original description (Phase 1, see [plan-document.md](./plan-document.md)).

**Guidelines:**

- MUST keep the run's state in a single **status block**: an HTML comment opened by the fixed token `<!-- loop-engineering` and closed by the first `-->` after it, seeded as the pull request description's **first** element — invisible in the rendered UI, present in the raw markdown. Before the pull request exists, keep the same block, under the same token and in the same first-element position, in the issue body. Record the current phase, the review-round count, what the run is waiting on, and any open question; update it in place. Both halves of that shape earn their place: an unmarked comment cannot be addressed by a reader that wants only the block, and a body carrying more than one HTML comment cannot tell them apart without one — and because the token is also this skill's own name, it will legitimately recur later in the prose of any body whose plan discusses the loop, so it is the block's _position_, not the token alone, that makes the first match the status block rather than merely the earliest occurrence of the word.
- MUST NOT post a separate status comment or @mention the maintainer for attention; convey ready-to-merge, dormancy, and non-convergence in the turn output instead. The archival comment above is not an exception to this — it carries the original description, never run state.
- MUST NOT write the literal review trigger phrase anywhere except the dedicated review request — a comment-triggered workflow fires on that phrase appearing anywhere in a body. Refer to it as "the independent review" everywhere else.
- MUST read the status block through a channel adequate to what it carries, and reconstruct from the signals that survive where no such channel exists — [github-conventions.md](./github-conventions.md) owns that rule for every body the loop reads, and states it once. The block being an HTML comment is what makes it acute here: a sanitizing read removes it whole, returning a body that looks like one carrying no state at all.
- MUST narrow a read whose object is only the status block to the block itself, at the route rather than after the fact — extracting the block from a body already pulled into context spends exactly what narrowing was meant to save. Where the byte-faithful route the session has established is a command-line one built on jq's `match` filter, the form that holds is a non-greedy, dot-matches-newline match against the response's `body` field: `match("(?s)<!-- loop-engineering.*?-->")`, with the `(?s)` embedded in the pattern itself rather than passed as a separate flag argument — that inline-group spelling is jq's; an engine that spells the same mode as a flag on the pattern instead of an inline group, such as JavaScript's `s`, needs the flag there instead. It returns the first such comment whether the block spans one line or several — the non-greedy quantifier is what stops the match running on to the last `-->` in the body, and the placement rule above is what makes that first match the status block rather than some later comment. Which route carries this form is a GitHub-operation capability's call, not this rule's — narrow whichever byte-faithful channel the session has already established; this rule mandates none of its own.
- MUST NOT extract the status block with a line-range selection such as `sed -n '/<!-- loop-engineering/,/-->/p'`: a range does not close on the line that opened it, so a single-line block runs the selection on to the next `-->` elsewhere in the body and returns unrelated text, with no error raised. It works for exactly as long as the block stays multi-line and fails silently the first time it does not.
- MUST read the whole stored body, never the narrowed block, on a turn that will write the body back and cannot compose the new body from text the run itself authored — a body write replaces the body entire, and a narrowed read cannot reconstruct what it never read. Narrowing serves only the read-only case, such as a resume recovering phase and waiting state; this is the accepted cost of keeping the status block inside the body rather than moving it into a comment of its own.
- MUST fall back to the full stored body when a narrowed read of the status block returns nothing, rather than concluding from that alone that the body carries no state — the body may predate the token, or the route may have degraded. [github-conventions.md](./github-conventions.md) states this as a general rule for every body the loop reads; this is that rule applied to the narrowed read specifically, not a second rule beside it.

Reconstructing state and resuming the one pending step on an actual resume is [resuming-and-handoff.md](./resuming-and-handoff.md)'s own rule, stated there once rather than here as well.

## Delegated Run State

When the run delegates implementation, the state that matters on a resume grows: which mode the run is in, who wrote last, and how far the current attempt got. Session state carries the detail; the status block carries only what a fresh session cannot re-derive.

Session state should hold the execution mode (delegated, single-agent, or recovering), the worker-resolution source (explicit, custom, built-in, or none), implementation status, the current plan revision and task phase, the attempt number, the writer owner, any opaque continuation handle, model and effort certainty, the reason for a fallback or recovery, and the reason for any start-time model override of a role's pinned model.

The status block adds only durable recovery information: execution mode, implementation status, the approved plan revision, the latest coherent implementation HEAD where available, phase, review round, waiting state, any open question, and the delegation-permission determination together with any answer the human gave it.

Where the pre-flight review runs, its round number and waiting state join that list unconditionally. Its finding entries join it only while the run is parked on the human question that needs them there, and are cleared before the run resumes past it — durability is earned by the same reasoning the principle above gives: a fresh review worker produces a _different_ finding set, so a ledger lost mid-park cannot be re-derived by re-running the review, while one lost between parks costs nothing. [pre-flight-review.md](./pre-flight-review.md)'s Ledger Durability owns exactly when the entries are and are not written, their ceiling, and what a run does when it cannot read the block back.

**Guidelines:**

- MUST NOT duplicate the commit list into the status block; Git history and the completion receipt stay authoritative for individual commits.
- MUST keep opaque worker identifiers, transcript paths, and other ephemeral harness details in session state rather than writing them to GitHub.
- MUST treat a status-block entry that names no determination as invalid; the delegation-permission field carries one of the three results — permitted, barred, or undetermined — together with whichever of that determination's grounds it rests on, quoted or observed as [subagent-delegation.md](./subagent-delegation.md#harness-permission-determination) requires. That reference owns the set of grounds; read it there rather than from a list here, which would drift the next time it gains one.

## Reporting a Delegated Run

Execution detail belongs inside the existing report, not beside it. A separate agent-activity log competes with the summary the human actually reads.

**Guidelines:**

- MUST fold into the completion summary and the ready-to-merge handoff: whether the run was delegated, fell back to single-agent, or recovered; the worker-resolution source; the delegation-permission determination and, where a question was put, the human's answer; model and effort as verified, declared, or unknown for every role the run spawned, including a pre-flight review worker where the stage ran; the fallback or recovery reason; the reason for any start-time model override of a role's pinned model; any skipped or unavailable verification; and residual worker or routing risk.
- MUST NOT duplicate that information into a separate verbose activity log.
- MUST report a review worker's disclosure that it read run state — its own status block or another run's — while judging the diff (see [pre-flight-review.md](./pre-flight-review.md)'s Run State Is Not Input), so an exposure the write/clear pairing failed to prevent does not go unrecorded.

## Ready-to-Merge Handoff

When a run flips its pull request to ready, that same chat turn doubles as a **verification brief**: hand the human everything they need to exercise the change before merging. Deliver it in the session's chat turn output only — never as a GitHub comment.

**Guidelines:**

- MUST name, in the handoff and in any completion claim, the tracking issue, the pull request, the approved plan revision the work implements, and the independent review's outcome (round count and verdict), with links where they exist — a completion report that cannot cite its pull request, its plan revision, and its review is reporting work that is not ready.
- MUST judge whether the change is human-observable first. Write the brief only when the change alters something a human can see or operate — a route, a rendered surface, a command, an admin view. For a purely internal change (build, refactor, non-visible logic) with nothing to walk through, say so in one line and stop.
- MUST spell out what to exercise and how, derived from the plan's acceptance criteria and the changed surfaces: the specific routes, pages, or commands to open, and the states to exercise (loading, empty, error, responsive widths, theme, locale) where they apply.
- SHOULD hand over a per-PR preview URL when the project deploys one — sourced from the newest preview-deploy comment and verified against the branch-head SHA, never constructed from memory. When there is no usable preview, give the local verification steps instead; never fabricate a URL.

## Why a Report-Only Turn Costs the Same as an Acting One

Elaborates the turn-boundary rule the parent section states: the reasoning behind it, the worked line separating a forbidden turn from each of its three exceptions, and both boundaries in full.

A run is billed per turn, and what a turn costs is set by how large its context is, not by what the turn does — a turn that emits one paragraph and calls no tool costs about the same as a turn that reads a file, edits it, and runs the test suite. When the run has not stopped — the next request already knows what it wants and arrives regardless — a text-only turn has produced nothing an acting turn would not also have produced, at the same price; it has only delayed the action by one turn's worth of cost. In an interactive terminal a human watching the stream might read that paragraph as it appears, but in a cloud or mobile session the turn's text has no reader until the run stops and a summary is wanted, so the report bought nothing and merely cost.

### The Forbidden Turn Against Each Exception

The rule turns on one question: does the run stop after this turn? A text-only turn that answers no — the work continues, the next request already follows — is the forbidden case: nothing needed the pause, so the turn's whole product is cost with nothing to show for it. Each of the three exceptions answers yes, and that is what earns it the exception:

- **Ending the turn at a gate.** The plan-approval gate and an escalated stuck machine event both stop the run on a human decision nothing else can supply. The action the turn's observation justifies is stopping — no tool call substitutes for waiting on a decision only the human can make, so the turn's product being text is not a shortfall; it is the correct shape for that turn.
- **Recording state before going dormant.** Once a dormancy cap is reached, the run persists what a resumed session cannot otherwise reconstruct — phase, waiting state, open questions — before it stops. The state write is the action; the turn ending afterward is not a separate report bolted onto the front of a turn that still had work to do, since going dormant is itself the point the run stops.
- **The completion report.** The run has reached ready or non-convergence and has nothing further to do this turn; the report is the deliverable the run was building toward, not a preamble to one.

A forbidden turn shares none of this shape: it reports, calls no tool, and the very next turn goes on to do the thing the report described. Nothing structural required the split, so the split bought nothing.

### The Asynchronous-Wait Boundary

A progress note posted while CI, the independent review, or a delegated worker's run is still outstanding sits outside the rule entirely, and deliberately so. That turn is not deferring a next step — no action is due until the awaited event resolves, so there is nothing the turn could have done instead of reporting. Suppressing it would not recover any cost, since the run still waits either way; it would only take away the one place a human on a cloud or mobile session can see that the run is alive and what it is doing while nothing else does. The rule leaves this band alone on purpose — read the prohibition as reaching forward to the turn that has a next step and stops short of taking it, never as reaching backward to cover a note written while the run waits on something else.

### The Prose-Beside-a-Tool-Call Boundary

The rule forbids breaking a turn in two — ending one turn on text alone and picking the action back up in the next — not writing an explanation in the same turn that also acts. A turn that states why it is about to edit a file, then edits it, has not produced a report-only turn; it has produced one turn that both explains and acts, which is exactly what the rule asks for. Nothing here is a word budget, a cap on tool calls per turn, or a prohibition on explanation — a turn may carry as much reasoning as it needs, as long as the action that reasoning justifies is not left for the turn after it.
