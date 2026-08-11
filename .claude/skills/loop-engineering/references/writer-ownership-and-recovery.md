# Writer Ownership and Recovery

Apply this reference when granting or reclaiming the right to write project files, when a worker escalates, and when an attempt fails. One checkout tolerates exactly one writer; everything here follows from that.

## Branch and Writer Lease

The main actor selects where the work happens and who may write there. The worker verifies that it landed where the package said it would, because a mismatch discovered after editing is far more expensive than one discovered before.

Before resolving or spawning a worker, the main actor selects the checkout or worktree, creates or checks out the agent-namespaced branch, records the base revision and branch in the package, and confirms both that no implementation edit preceded approval and that no conflicting worker is active.

The run tracks exactly one writer at a time: no writer, the main actor, or one worker instance.

A participant that writes nothing does not appear in that accounting at all. The pre-flight reviewer is the one such participant the loop defines (see [pre-flight-review.md](./pre-flight-review.md)): it reads the diff and returns findings, so the lease stays wherever it already was while it runs.

**Guidelines:**

- MUST NOT modify any project file during planning, and MUST NOT let the main actor and a worker hold the lease at once.
- MUST require the worker to verify the expected branch before editing and return `workspace_mismatch` before editing when the branch or base revision differs materially from the package.
- MUST NOT let the worker create, switch, merge, rebase, or delete branches unless the package explicitly delegates that operation, and MUST NOT let it push.
- MUST reclaim the lease only after the worker has completed, stopped, or been interrupted; no competing worker remains; write-capable background processes are stopped or accounted for; partial commits and uncommitted changes are known; and the receipt has been compared against actual Git state.
- MUST describe the lease as a behavioral contract rather than an enforced lock unless the harness actually enforces one — claiming mechanical enforcement that does not exist invites exactly the concurrency it is meant to prevent.
- MUST NOT grant, transfer, or reclaim the lease on account of a read-only participant; a reader neither holds it nor displaces whoever does.

## Cohesive Local Commits

The worker's commits are the branch's transition log. Collapsing distinct stages into one commit to produce a tidy return value destroys the trace a reviewer and a resume both read.

**Guidelines:**

- MUST let the worker create as many cohesive local commits as the change warrants — one implementation unit with its tests, a mechanical correction from verification, one coherent fix batch — following the repository's commit-message convention.
- MUST NOT amend an existing commit, squash distinct implementation stages merely to return one commit, or force-push; history stays append-only.
- MUST return every created commit hash and summary in the receipt, and push only after the main actor has reclaimed the lease and completed the evidence check.

## Clarification versus Plan Revision

Every worker escalation is one of two things, and the difference decides whether the same worker continues or the run returns to the plan gate.

**Case A — clarification without plan change.** Locating a repository convention, choosing detail already implied by the plan, resolving a verification-command locator, or settling an ambiguity that alters no scope, non-goal, artifact, or acceptance criterion. The main actor answers and resumes the same worker.

**Case B — approved-plan change.** Changed compatibility behavior, new migration or persistence work, changed acceptance criteria, changed privacy or security behavior, additional UI states, a changed data model, moving an item into or out of scope, or replacing an approved design artifact. The run stops the worker at a coherent boundary, collects partial progress, reclaims the lease, returns to Phase 1, revises the plan and artifacts, records a new plan revision, returns to `awaiting plan approval`, obtains fresh approval, builds a new package, and spawns a fresh worker.

**Guidelines:**

- MUST NOT resume the previous worker across an approved-plan revision; its context still holds the superseded acceptance criteria, artifacts, non-goals, and decisions.
- MUST give the fresh package the new plan revision and approval locator, the updated manifest, the still-valid commits, the potentially obsolete commits and partial changes, the previous receipt, and why the plan changed.
- MUST require the fresh worker to audit existing implementation against the new plan and correct obsolete work through append-only commits rather than rewriting history.
- MUST, when a worker checkpoints before a plan revision, commit only work that stays valid independently of the unresolved decision, leave decision-dependent work uncommitted, create no misleading checkpoint commit merely to clean the tree, and distinguish the three categories in the escalation receipt.

## Retry Budget

Each approved plan revision and task phase carries one initial attempt plus two retries. After the third failed attempt, the main actor recovers in single-agent mode.

Runtime failure, transient API failure, an unexplained stall, a lost completion response, a recoverable tool failure, and an unexpected worker disappearance all count against the budget. A newly approved plan revision, a human-requested scope change, a new review round, and a separate Phase 4 task for an already-completed worker do not.

**Guidelines:**

- MUST scope the budget to the approved plan revision and task phase together, and start a fresh budget with a fresh worker on a new plan revision.
- MUST prefer resuming the same worker on retry where the harness supports it and its context is still valid, and otherwise spawn a fresh compatible worker with the same package plus a recovery supplement naming the previous attempt, partial commits, uncommitted changes, the failed operation, background processes, and whether the previous worker is confirmed stopped.
- MUST, when a worker fails after editing, confirm whether it is still active, stop or account for write-capable background processes, inspect Git status and commits and partial changes, and collect the last receipt before retrying — and on exhaustion continue from the current state rather than destructively resetting it.

## Completion-Evidence Check

The receipt is the worker's account of its own work. The main actor does not repeat the worker's full diff review, but it does check that account against the repository.

Inspect at least the worker's stopped state, Git status, branch and HEAD, the commit list, diff stat, the changed-file list, unexpected paths, verification results, acceptance-criteria status, residual risks, unresolved decisions, and background processes.

**Guidelines:**

- MUST NOT accept a receipt without checking repository state against it, and MUST perform targeted diff inspection when files fall outside the expected surface; build, dependency, lock, CI, security, or review-policy files changed; required verification failed or was skipped; the receipt and Git state disagree; acceptance evidence is thin; the worker reported uncertainty; or the change is materially larger than planned.
- MUST leave the authoritative judgment to the external independent review; this check exists to catch a receipt that does not match reality, not to certify the change.
