# Implementation Worker

Apply this reference after the plan-approval gate clears and before the first Phase 2 edit, when deciding **who** implements the approved plan. Delegation is optional: it happens only when the harness already exposes a worker that qualifies, and the single-agent path stays a fully supported outcome rather than a failure.

[subagent-delegation.md](./subagent-delegation.md) states why the loop delegates at all, the harness permission determination and its single per-run question, the resolution shape's first three steps, model and effort certainty, why a worker's task is self-contained, and what a project's own worker definition may carry. This reference states only what is particular to the implementer: its own capability set and exclusion criterion, its fourth resolution step and the five outcomes, the compatibility preflight, and Phase 4 delegation.

## Executor Resolution

Resolution runs once per phase, after approval and before any project-file edit. [subagent-delegation.md](./subagent-delegation.md#resolution-precedence) states the qualify-by-capability principle and the shared order's first three steps; resolution here adds a fourth:

4. the main actor, in single-agent fallback

Resolution terminates in one of five outcomes, and the run records which: **delegated**; fallback because no candidate can implement; fallback because the catalog could not be enumerated; fallback under an absolute policy; or fallback under a conditional policy that was not lifted. That last outcome covers a human who declined and a run that had no way to ask alike — which of the two it was is carried by the permission determination the run already records (see [run-state-and-reporting.md](./run-state-and-reporting.md)), so keeping them apart costs no sixth outcome. This is a recording requirement, not a stall condition — a run unable to tell which of the four fallback reasons applies still proceeds in single-agent fallback and records that the reason could not be determined, which is an explicit absence of a classification rather than an outcome of its own.

Screen only for what the implementation package cannot supply. The package carries the decision boundary, the verification obligation, the commit discipline, and the writer lease — that boundary is owned by the main actor and delivered per run, never expected from the worker. What the package cannot supply is execution capability and the model the worker runs. Capability is therefore what resolution checks, and a generic implementation-capable worker qualifies without a definition restating the contract it is about to be handed.

**Guidelines:**

- MUST resolve the executor after the plan-approval gate clears and before the first Phase 2 project-file edit, never earlier and never as an afterthought once editing has begun.
- MUST exclude an agent only where it cannot implement — no file editing, no command execution, no commit creation, no way to report back — or where its own definition forbids implementing, as a read-only, review-only, or explicitly non-editing agent does. Failing to declare implementation is not grounds for exclusion.
- MUST break the tie rather than abandon delegation where more than one candidate qualifies: prefer the declared purpose closest to implementation, then the harness's documented default implementation worker, then single-agent fallback. Ambiguity alone must not force fallback, because the qualifying set is deliberately broad and that rule would suppress delegation in the common case.
- MUST treat an agent catalog that cannot be enumerated at all as no qualifying candidate, and fall back the same way — a harness that will not say what it exposes has not said that a worker qualifies.
- MUST treat single-agent fallback as a normal outcome that weakens no gate — planning, verification, review, and reporting are unchanged by it.
- MUST terminate resolution in one of five outcomes — delegated, fallback with no candidate able to implement, fallback with an unenumerable catalog, fallback under an absolute policy, or fallback under a conditional policy that was not lifted — and record either which one occurred or, failing that, that the fallback reason could not be determined; MUST NOT stall resolution trying to classify a fallback it cannot place in one of the four, and proceed in single-agent fallback recording that instead.
- MUST NOT record a fallback as a declined conditional policy where no question was ever put; the outcome above is the one that covers an unasked run, and the permission determination is what distinguishes the two.

## Compatibility Preflight

A worker that cannot finish is worse than no worker, because it fails after editing. Establish capability before granting the writer lease, and prefer metadata the harness already exposes over a spawn spent discovering it.

Before granting writer ownership, establish that the worker is resolvable under the current harness, can read the checkout, edit project files, run the required commands, inspect Git state, create local commits, and report completion or escalation to the parent — and that it is not already running as a conflicting writer. Whether policy permits the spawn at all is settled before this point, by [subagent-delegation.md](./subagent-delegation.md#harness-permission-determination); what this preflight establishes is capability.

**Guidelines:**

- MUST establish every capability above before granting the writer lease, using trustworthy harness role and tool metadata where it exists instead of spending a model turn on preflight.
- MUST begin the task with a no-edit workspace-and-artifact validation stage where runtime availability cannot be established without spawning, and fall back before any edit if that stage fails.
- MUST establish, for every entry the artifact manifest marks required, that the worker holds a channel adequate to its declared fidelity class before granting the writer lease — a `visual` entry specifically as a tool that returns it as an image the model itself views, since a tool returning only a textual description does not satisfy that case — and MUST resolve a gap to [implementation-package.md](./implementation-package.md#artifact-manifest-and-fidelity)'s in-package carriage where the main actor can reach the entry, or to fallback otherwise, before the spawn rather than discovering the gap at read time.

## Phase 4 Delegation

Mechanical CI failures and unambiguous review findings are delegable; judgment is not. Resume the same worker where the harness supports it and its context is still valid, otherwise resolve a fresh compatible worker, otherwise fall back to the main actor.

**Guidelines:**

- MUST give a fresh worker the complete self-contained package again, plus current branch and pull-request state, the prior receipt, the findings, and a recovery supplement — a reference to the prior conversation or package is not sufficient context.
- MUST keep ambiguous product or architecture findings with the main actor rather than delegating the judgment.
- MUST follow the plan-revision flow, with fresh approval and a fresh worker, when addressing a finding would change the approved plan.
