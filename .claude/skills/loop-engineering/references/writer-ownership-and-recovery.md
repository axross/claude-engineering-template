# Writer Ownership and Recovery

Apply this reference when granting or reclaiming the right to write project files, when a worker escalates, and when an attempt fails. One checkout tolerates exactly one writer; everything here follows from that.

## Branch and Writer Lease

The main actor selects where the work happens and who may write there. The worker verifies that it landed where the package said it would, because a mismatch discovered after editing is far more expensive than one discovered before.

Before resolving or spawning a worker, the main actor selects the checkout or worktree, creates or checks out the agent-namespaced branch, records the base revision and branch in the package, and confirms both that no implementation edit preceded approval and that no conflicting worker is active.

The run tracks exactly one writer at a time: no writer, the main actor, or one worker instance. [subagent-delegation.md](./subagent-delegation.md#writer-versus-reader) states how a participant that writes nothing — the pre-flight reviewer today — relates to that accounting.

**Guidelines:**

- MUST NOT modify any project file during planning, and MUST NOT let the main actor and a worker hold the lease at once.
- MUST require the worker to verify the expected branch before editing and return `workspace_mismatch` before editing when the branch or base revision differs materially from the package.
- MUST NOT let the worker create, switch, merge, rebase, or delete branches unless the package explicitly delegates that operation, and MUST NOT let it push.
- MUST reclaim the lease only after the worker has completed, stopped, or been interrupted; no competing worker remains; write-capable background processes are stopped or accounted for; partial commits and uncommitted changes are known; and the receipt has been compared against actual Git state.
- MUST describe the lease as a behavioral contract rather than an enforced lock unless the harness actually enforces one — claiming mechanical enforcement that does not exist invites exactly the concurrency it is meant to prevent.

## Waiting While a Worker Runs

A harness may run the worker in the background, which makes the main actor _look_ free. It is not: the worker holds the only writer lease, and anything the main actor does to the checkout races it.

After spawning, the main actor waits for completion, a decision escalation, a permission request, an interruption, or an explicit failure. [subagent-delegation.md](./subagent-delegation.md#writer-versus-reader) states why a read-only reviewer is not the second implementation worker this window's prohibition reaches, and why the pre-flight stage that spawns one runs only once this window has closed.

**Guidelines:**

- MUST NOT, while the worker runs, edit project files, run competing mutating commands, run a verification that can itself alter artifacts, switch branches, create commits, or spawn a second implementation worker.
- MAY, while the worker runs, process its status, permission requests, and decision escalations, and answer a pure status question from the human.
- MUST NOT treat a completion indicator as sole evidence that no process remains; the receipt's background-process report is what settles it.

## Permission Requests

A worker commonly inherits the parent permission mode while individual prompts surface to the main session. Which of three kinds a request is decides who answers it.

| Request                                                                                                     | Handling                                                |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Approved-scope normal operation — a documented test command, the package manager, a local commit            | Apply the current host permission policy                |
| Unexpected or out-of-scope — unrelated directories, destructive Git operations, unexpected network, secrets | Deny, and ask the worker for a safe alternative         |
| A product, security, privacy, or platform decision                                                          | Return it to the human through the normal decision path |

**Guidelines:**

- MUST surface a required human authorization rather than manufacturing one, and MUST leave the writer lease with the worker while a permission request is pending.
- MUST NOT report a permission denial as successful verification; when required verification stays impossible after a safe alternative is tried, the worker returns a blocked receipt instead of silently narrowing scope or claiming success.

## User Input Mid-Run

A message that changes scope while a worker is editing cannot simply be forwarded — the worker would apply it against a plan the human has not re-approved.

When user input may change scope or requirements, the main actor interrupts the worker, confirms it has stopped editing, collects partial progress, stops or accounts for write-capable background processes, reclaims writer ownership, and only then classifies the input — returning to Phase 1 and fresh approval when the plan changes. [pre-flight-review.md](./pre-flight-review.md#the-reviewer-is-a-reader) states the corresponding path where the running participant is a read-only reviewer rather than an editor.

**Guidelines:**

- MUST NOT forward a scope-changing user message to a running worker without first evaluating its effect on the approved plan.
- MAY answer a pure status question without changing writer ownership, provided the worker's task is neither interrupted nor redirected.

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
