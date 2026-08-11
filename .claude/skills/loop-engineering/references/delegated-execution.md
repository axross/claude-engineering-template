# Delegated Execution

Apply this reference while a delegated worker is running — from the moment the writer lease is granted until the worker returns — and when deciding whether a Phase 4 fix is delegable. It covers what the main actor may and may not do during that window.

## Waiting While a Worker Runs

A harness may run the worker in the background, which makes the main actor _look_ free. It is not: the worker holds the only writer lease, and anything the main actor does to the checkout races it.

After spawning, the main actor waits for completion, a decision escalation, a permission request, an interruption, or an explicit failure.

**Guidelines:**

- MUST NOT, while the worker runs, edit project files, run competing mutating commands, run a verification that can itself alter artifacts, switch branches, create commits, or spawn a second implementation worker.
- MAY, while the worker runs, process its status, permission requests, and decision escalations, and answer a pure status question from the human.
- MUST NOT treat a completion indicator as sole evidence that no process remains; the receipt's background-process report is what settles it.
- MUST NOT read the second-implementation-worker prohibition above as reaching a read-only reviewer — it does not, and the pre-flight stage that spawns one runs only once this window has closed, never inside it (see [pre-flight-review.md](./pre-flight-review.md)).

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

When user input may change scope or requirements, the main actor interrupts the worker, confirms it has stopped editing, collects partial progress, stops or accounts for write-capable background processes, reclaims writer ownership, and only then classifies the input — returning to Phase 1 and fresh approval when the plan changes.

**Guidelines:**

- MUST NOT forward a scope-changing user message to a running worker without first evaluating its effect on the approved plan.
- MAY answer a pure status question without changing writer ownership, provided the worker's task is neither interrupted nor redirected.
- MUST, where the running worker is a read-only reviewer rather than an editor, take the plan-revision path directly instead of the interrupt sequence above: nothing is mid-edit, so there is no partial progress to collect and no lease to reclaim — discard the round's findings and re-review after the plan is re-approved.

## Phase 4 Delegation

Mechanical CI failures and unambiguous review findings are delegable; judgment is not. Resume the same worker where the harness supports it and its context is still valid, otherwise resolve a fresh compatible worker, otherwise fall back to the main actor.

**Guidelines:**

- MUST give a fresh worker the complete self-contained package again, plus current branch and pull-request state, the prior receipt, the findings, and a recovery supplement — a reference to the prior conversation or package is not sufficient context.
- MUST keep ambiguous product or architecture findings with the main actor rather than delegating the judgment.
- MUST follow the plan-revision flow, with fresh approval and a fresh worker, when addressing a finding would change the approved plan.
