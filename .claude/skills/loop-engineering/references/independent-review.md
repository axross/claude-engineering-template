# Independent Review

Apply this reference for the machine-event tail after you push and request review, and for addressing what the review and CI return. The review request itself (opening the draft pull request, the trigger phrase) is covered in the loop-engineering skill's Phase 3; this reference owns the waiting tail and the addressing mechanics.

## CI and Review Tail

After you push and request review, machine events run on their own: the merge-checks CI and the independent review, plus a per-PR preview deploy where the project has one. Two mechanisms can tell you one finished, and they are not interchangeable — resolve which of them you have before choosing any interval.

**Event delivery** is a harness pushing pull-request activity into the running session (in Claude Code, a pull-request activity subscription; in Codex, whatever equivalent its harness exposes). Where it exists it is the first choice, because it costs nothing while nothing is happening. It is also **incomplete**: such a subscription carries review comments and failing checks, while the _success_ transitions — CI going green, a push landing, a conflict clearing — arrive late or not at all. Green CI is one of the three flip conditions below, so a subscription on its own can leave a finished change waiting forever.

**A scheduled self-wake** is therefore kept as the backstop even while a subscription is active, and is the whole mechanism where no subscription exists (in Claude Code, `send_later`, which delivers a message back into this same session and survives container reclaim; in Codex, whatever equivalent its harness exposes). A subscription changes what that wake is _for_ — from detection to a backstop — never whether there is one. A harness offering delivery but no scheduler leans on delivery alone, which is worth recording, because a success transition missed there strands the run rather than merely delaying it. The wake's interval is not a property of the clock, the session, or the harness — it is a property of the check being waited on.

Derive each wake from the checks still pending, not from a fixed ladder: place the first one just past where the fastest pending check should already have decided, then step across the slowest pending check's median-to-maximum band, then treat a check still pending beyond that band as anomalous rather than as more of the same wait. Worked example, from the reference project's own recent runs — its merge-checks CI has a median around 30 seconds and a maximum under a minute, while its independent review runs a median near 9 minutes against a 30-minute timeout declared in the workflow. That profile puts the first wake about a minute out, where CI is already decided and a red result can start the addressing loop immediately; the next near 9 minutes; one more around 13, where the review's observed maximum sits; and anything past that onto the anomaly path rather than into a standing cadence. Reproduce the derivation against your own checks — the numbers themselves do not travel.

The flip out of draft turns on **three** conditions: green CI, a clean independent review with no blocking findings, and the approved plan revision still being the one the work implements. The third is the one a waiting tail forgets, because it is not a machine event and nothing in the tail moves it: a plan revised mid-flight — [writer-ownership-and-recovery.md](./writer-ownership-and-recovery.md)'s Case B — leaves CI green and the review clean, so a run checking only the two machine outcomes would flip work ready against a plan nobody approved. The condition holds when the canonical plan content has not moved since the approval the work was built against and no revision is awaiting approval; [plan-document.md](./plan-document.md)'s Plan Revision Identity owns how that revision is derived and compared.

The machinery armed above cannot outlive the tail it was armed for. Three stops end the tail: the ready flip once all three conditions above hold, and — both in the skill's Termination Guard — non-convergence at the round cap and the dormancy cap. None of them leaves a machine event this tail is still waiting on. What follows the first two is one of the human waits [waiting-and-dormancy.md](./waiting-and-dormancy.md) classifies as ending the turn — a human's comment after work has been handed back once, and a loop that has stopped converging with no further round available — and that reference's account of what such a wait costs, and of why nothing is scheduled against one, governs from there. The third stop is that reference's machine wait having spent the outer cap bounding it, and stopping for exactly that reason. So an armed subscription or self-wake left standing past any of the three buys nothing toward what comes next: it only spends against a pull request the tail has already finished with, since every unrelated event that still fires on it afterward, a base-branch push, a bot comment, a check re-run among them, wakes the session for nothing and pays the context rebuild.

**Guidelines:**

- MUST resolve the waiting mechanism before the first wake: subscribe where the harness delivers pull-request activity, and schedule a self-wake where it provides one. Where it provides neither, end the turn and wait for the human to resume.
- MUST keep that self-wake scheduled wherever the harness provides one, even while a subscription is active, and record in the status block when only delivery is available.
- SHOULD derive each wake from the pending checks' own completion profiles as above, measuring them from the project's recent runs rather than carrying another project's figures over.
- MUST consult [waiting-and-dormancy.md](./waiting-and-dormancy.md) for how the wake interval derived above interacts with the harness's prompt-cache TTL, and let that reference's mechanism choice — poll inside the boundary, or collapse to a single dormancy — decide the wait's shape rather than tuning the interval by feel.
- MUST flip the pull request to ready once all three conditions above hold and not before, then update the status block, deliver the Ready-to-Merge Handoff in the turn output, and end the turn.
- MUST, on review findings or red CI, enter the addressing mechanics below; on only some checks resolved, keep waiting for the rest.
- MUST stop waiting at the dormancy cap in the skill's Termination Guard and go dormant with a status-block note rather than wait indefinitely.
- MUST tear down, in the same turn as the stop, whichever waiting mechanism was armed for the tail — cancel the scheduled self-wake and end the pull-request activity subscription, wherever the harness provides either — at each of the three stops above: the ready flip, non-convergence at the round cap, and the dormancy cap. This holds with no exception, including where post-merge follow-up work on the same change is already anticipated.
- MUST NOT keep either mechanism armed to catch a human's comment on a pull request the tail has already flipped ready; such a comment reaches the run through the human's own resume, per the loop-engineering skill's Phase 4 guideline for that case, never through a subscription or self-wake left standing for it.

## Addressing Findings

When the independent review's comments land, read them (their author is the review bot, not you and not a human) together with the CI status. Address blocking findings and unmet acceptance criteria, then tie each resolution to the commit that fixed it.

**Guidelines:**

- MUST address and resolve each blocking finding (whatever the posted-review policy marks merge-blocking) and every unmet acceptance criterion, pushing fixes to the same branch and re-running the relevant verification after each batch.
- MUST, for every review comment a commit resolves, reply on that comment's thread with a marked comment — the project's agent-comment marker line, then a line beginning **`Resolved in <short-hash>`** (the 7-character hash of the fixing commit) and a summary sized per [Resolution Reply Length](#resolution-reply-length) below — then resolve the thread. Reference the same hash on each comment one commit resolves.
- MUST re-request review by posting the review trigger phrase again after a batch of fixes, and repeat up to the round cap in the skill's Termination Guard; on non-convergence, record what still fails and end the turn.
- MUST escalate through the question UI when a finding or human comment is ambiguous or needs a product or architecture decision, rather than guessing.
- MUST NOT gate the ready flip on your own assessment — only the three conditions stated above flip draft→ready.

## Resolution Reply Length

The one-sentence summary in a resolution reply is a default, not a floor: for most fixes the hash and the diff at that commit already show what happened, and nothing more is needed. More is warranted only when the hash alone would leave the commenter unable to tell what happened from it — the fix diverges from what the comment proposed, the finding was addressed only in part, or the fix landed away from the line the comment anchors to, so the hash does not lead to it.

**Guidelines:**

- SHOULD keep the resolution reply to the marker line, the `Resolved in <short-hash>` line, and one sentence, by default.
- SHOULD extend the reply past one sentence when the fix diverges from what the comment proposed, when the finding was addressed only in part, or when the fix landed away from the line the comment anchors to.
- MUST NOT use that extra room to restate the finding, re-explain why it mattered, or recount verification the pull request already records.

## Keeping the Branch Mergeable

When the base branch moves and the pull request conflicts, the branch must be brought back to mergeable before the ready flip.

**Guidelines:**

- MUST bring the base branch into the branch and resolve the conflicts when GitHub marks the pull request not mergeable or an update/rebase fails, then re-run the verification the touched surface requires and note it in the pull request.
- MUST resolve mechanical conflicts yourself — imports, independent or adjacent edits, regenerated lockfiles — but ask the human how to reconcile a genuine judgment call (both sides changed the same logic on purpose) rather than guessing.
- MUST NOT force-push to resolve a conflict; merge the base in and add the resolution as a commit, preserving history.
