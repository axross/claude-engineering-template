# Implementation Worker

Apply this reference after the plan-approval gate clears and before the first Phase 2 edit, when deciding **who** implements the approved plan. Delegation is optional: it happens only when the harness already exposes a worker that qualifies, and the single-agent path stays a fully supported outcome rather than a failure.

The main actor remains the only long-lived actor. A worker is a bounded execution actor for one phase of one plan revision — never a second loop driver.

## Executor Resolution

A worker qualifies by what it can do — not by what its name suggests, and not by what its definition declares itself responsible for. Resolution runs once per phase, after approval and before any project-file edit.

Resolve in this order, taking the first that qualifies:

1. an implementation worker the project or host instructions name explicitly
2. a custom agent that can implement and whose declared purpose does not exclude implementing
3. a harness-built-in worker that can implement and whose declared purpose does not exclude implementing
4. the main actor, in single-agent fallback

Resolution terminates in one of five outcomes, and the run records which: **delegated**; fallback because no candidate can implement; fallback because the catalog could not be enumerated; fallback under an absolute policy; or fallback under a conditional policy that was not lifted. That last outcome covers a human who declined and a run that had no way to ask alike — which of the two it was is carried by the permission determination the run already records (see [run-state-and-reporting.md](./run-state-and-reporting.md)), so keeping them apart costs no sixth outcome. This is a recording requirement, not a stall condition — a run unable to tell which of the four fallback reasons applies still proceeds in single-agent fallback and records that the reason could not be determined, which is an explicit absence of a classification rather than an outcome of its own.

Screen only for what the implementation package cannot supply. The package carries the decision boundary, the verification obligation, the commit discipline, and the writer lease — that boundary is owned by the main actor and delivered per run, never expected from the worker. What the package cannot supply is execution capability and the model the worker runs. Capability is therefore what resolution checks, and a generic implementation-capable worker qualifies without a definition restating the contract it is about to be handed.

**Guidelines:**

- MUST resolve the executor after the plan-approval gate clears and before the first Phase 2 project-file edit, never earlier and never as an afterthought once editing has begun.
- MUST NOT require an agent definition to declare implementation responsibilities, and MUST NOT select an agent from a name substring.
- MUST exclude an agent only where it cannot implement — no file editing, no command execution, no commit creation, no way to report back — or where its own definition forbids implementing, as a read-only, review-only, or explicitly non-editing agent does. Failing to declare implementation is not grounds for exclusion.
- MUST break the tie rather than abandon delegation where more than one candidate qualifies: prefer the declared purpose closest to implementation, then the harness's documented default implementation worker, then single-agent fallback. Ambiguity alone must not force fallback, because the qualifying set is deliberately broad and that rule would suppress delegation in the common case.
- MUST treat an agent catalog that cannot be enumerated at all as no qualifying candidate, and fall back the same way — a harness that will not say what it exposes has not said that a worker qualifies.
- MUST treat single-agent fallback as a normal outcome that weakens no gate — planning, verification, review, and reporting are unchanged by it.
- MUST terminate resolution in one of five outcomes — delegated, fallback with no candidate able to implement, fallback with an unenumerable catalog, fallback under an absolute policy, or fallback under a conditional policy that was not lifted — and record either which one occurred or, failing that, that the fallback reason could not be determined.
- MUST NOT stall resolution trying to classify a fallback it cannot place in one of the four fallback reasons; proceed in single-agent fallback and record that the reason could not be determined.
- MUST NOT record a fallback as a declined conditional policy where no question was ever put; the outcome above is the one that covers an unasked run, and the permission determination is what distinguishes the two.

### A Spawn the Harness's Policy Blocks

Capability and permission are independent. A harness can expose a worker that qualifies on every count above and still refuse to spawn it — a policy that withholds the spawn tool, bars delegation outright, or permits it only once the human has asked for it. The candidate does not stop qualifying; the spawn stops being available.

That makes a policy block its own route to the fourth step, and neither neighbouring rule describes it. The exclusion criterion is about a candidate that cannot implement, and this one can. The unenumerable-catalog rule is about a harness that will not say what it exposes, and this one said. Reporting a policy block as either tells the reader the harness offered nothing, when what it offered was a worker the run was not permitted to start — and the reader acts on that report.

The obligation below is a determination the run makes on every run, not a recognition it has to happen to notice. A policy's own wording — whether it reads as absolute or as conditional on the human's request — is not always where the run can see it, but the absence of established permission is observable every time; so the run establishes whether the spawn is permitted rather than waiting to spot language that would excuse asking. Where that determination settles neither way, putting the decision to the human is what unblocks a conditional policy in the first place: an affirmative answer **is** the request such a policy conditions the spawn on, which is what makes asking the thing that unblocks the spawn rather than a courtesy.

The determination lands on one of three results, and only the last of them asks anything:

- **Permitted** — by a policy that permits the spawn unconditionally, by **the absence of any policy restricting or conditioning it**, or by an affirmative answer this run already holds. The middle route is the one that decides how the rule behaves on the ordinary host, and leaving it out would invert the intent — a harness that simply never speaks about delegation permits it, so treating silence as unestablished would put a question in front of every run everywhere and turn an optimization into a tax. What the determination looks for is a restriction, not a permission slip.
- **Barred** — by a policy that stops the spawn outright, with no exception a request could satisfy. This is as settled as permission is, and it takes the absolute-policy outcome. Asking here would be the courtesy this section disclaims, since no answer the human could give changes anything.
- **Undetermined** — anything else, which is the ordinary case a conditional policy produces and the one the question exists for.

**Guidelines:**

- MUST treat a policy that forbids, withholds, or conditions the spawn as a branch to single-agent fallback distinct from a candidate excluded on capability and from a catalog that cannot be enumerated; a policy block leaves a qualifying candidate qualified.
- MUST record and report that branch as itself, and MUST NOT report it as no candidate qualifying or as a catalog that could not be enumerated; it lands in the fallback reason the run already carries (see [run-state-and-reporting.md](./run-state-and-reporting.md)).
- MUST run the determination before the first project-file edit — on every run, regardless of whether a policy statement was noticed — and land it on permitted, barred, or undetermined.
- MUST default to **undetermined** wherever the run cannot read the policy as unambiguously absolute; **barred** requires positive evidence that no request could lift the restriction, and a policy naming the human's request as its own condition — in any wording — is the canonical **undetermined** case, never **barred**.
- SHOULD weigh host or harness configuration that governs _how_ delegation behaves — rather than _whether_ it is allowed at all — as evidence against a **barred** classification; a harness that configures the shape of a capability is not thereby shown to be withholding it outright.
- MUST record, for every determination, the policy text it rests on, quoted, or — where no restricting policy exists — the observation that none was found; a determination recording neither is incomplete.

#### Putting the Decision to the Human

Only the undetermined result asks anything. The ask has its own small set of rules: when it fires, when it must not, and how a run without a question tool proceeds instead.

**Guidelines:**

- MUST, where that determination comes out **undetermined** and the session exposes a question tool, put the decision to the human through that tool before the first project-file edit; an affirmative answer **is** the request a conditional policy conditions on.
- MUST NOT ask that question where the determination already settled, either way. Permitted settles it by an unconditional policy, by the absence of any policy restricting or conditioning the spawn, or by this run's own earlier affirmative answer — a harness that says nothing about delegation has not withheld it, and a decline is not an answer that settles it this way. Barred settles it too, and takes the absolute-policy outcome without a question, because no answer could lift it.
- MUST ask that question once per run and let it cover delegation as a whole, this worker and the review reader together, so a later executor resolution in the same run does not re-ask; a decline falls back to single-agent and is not revisited.
- MUST fall back to single-agent without asking and without ending the turn where the session exposes no question tool. This departs deliberately from the default that sends a decision with nowhere to ask into the turn output and stops (see [asking-the-human.md](./asking-the-human.md)), and is not an oversight: delegation is an optimization rather than a gate, so a run that cannot ask has a supported outcome already available and stalling it trades that outcome for a stop. Such a run records the outcome matching the determination that produced it — the absolute-policy outcome where the spawn was barred, and the conditional-policy-not-lifted one where it was undetermined — with its permission determination showing that no question was put. Never a decline, which would claim an answer nobody gave.
- MUST NOT re-present that question on a resume; the execution mode the status block already carries records which way the run went.

## Compatibility Preflight

A worker that cannot finish is worse than no worker, because it fails after editing. Establish capability before granting the writer lease, and prefer metadata the harness already exposes over a spawn spent discovering it.

Before granting writer ownership, establish that the worker is resolvable under the current harness, can read the checkout, edit project files, run the required commands, inspect Git state, create local commits, and report completion or escalation to the parent — and that it is not already running as a conflicting writer. Whether policy permits the spawn at all is settled before this point, by [A Spawn the Harness's Policy Blocks](#a-spawn-the-harnesss-policy-blocks); what this preflight establishes is capability.

**Guidelines:**

- MUST establish every capability above before granting the writer lease, using trustworthy harness role and tool metadata where it exists instead of spending a model turn on preflight.
- MUST begin the task with a no-edit workspace-and-artifact validation stage where runtime availability cannot be established without spawning, and fall back before any edit if that stage fails.
- MUST establish, for every entry the artifact manifest marks required, that the worker holds a channel adequate to its declared fidelity class before granting the writer lease — a `visual` entry specifically as a tool that returns it as an image the model itself views, since a tool returning only a textual description does not satisfy that case — and MUST resolve a gap to [implementation-package.md](./implementation-package.md#artifact-manifest-and-fidelity)'s in-package carriage where the main actor can reach the entry, or to fallback otherwise, before the spawn rather than discovering the gap at read time.

## Model and Effort Certainty

Whether a worker is _capable_ and which model it _runs_ are separate questions, and a harness may answer the second only partially. Reporting a configured value as a confirmed one turns an unverified assumption into a claim the human cannot audit.

Classify model and effort independently as:

- `verified` — runtime, transcript, or telemetry confirms the actual value
- `declared` — configuration or spawn input states the value, but runtime execution could not be independently confirmed
- `unknown` — the host exposes too little to say

**Guidelines:**

- MUST classify model and effort with one of the three values above and MUST NOT report a declared value as verified.
- MUST NOT require runtime-verified model and effort before delegating; that stricter policy belongs to a project or host that wants it, not to the portable loop.
- SHOULD honor host or project configuration that selects an implementation model and reasoning effort, without hard-coding any model identifier into the loop's own rules.

## Defining a Worker of Your Own

A project does not have to define a worker at all — resolution accepts what a harness already exposes, and a generic implementation-capable agent qualifies. What a definition adds is narrower than it first appears, and worth being clear about before writing one:

- It pins the model and effort the worker runs at. A harness that offers this commonly defaults to inheriting the session's, which means the worker runs at the main actor's cost and the saving that motivated delegating disappears without anything reporting it.
- It places the worker at an explicit step in the resolution order rather than a discovered one.
- It can withdraw tools, which is the one place a boundary the package states in prose becomes a boundary the host enforces — short of a channel carrying what the worker must read, which the rule below keeps open regardless of what else a definition withdraws.

Everything else belongs in the package. A definition that also carried the decision boundary, the escalation list, the verification obligation, the commit rules, or the receipt shape would restate per agent what already arrives per run — and would drift from it the first time the package changed.

**Guidelines:**

- MUST keep a worker definition to properties of the agent — model, effort, tool limits, and a short framing — and MUST NOT restate anything the package supplies.
- SHOULD write that framing without assuming this loop: state what an implementation agent is, that it works from the prompt it was given, and that a decision it was not given goes back to whoever asked. A definition written around this loop's package stops being usable by any other caller, and stops being worth copying.
- MUST NOT preload this skill into a worker where the host offers that, since the package is self-contained by contract and preloading spends the worker's context on rules it is handed anyway.
- MUST NOT give a worker its own isolated checkout where the host offers that: the package names the branch and base revision the worker must verify, and an isolated copy will not match them.
- MUST NOT withdraw a channel from a worker definition where that channel carries what the worker must read — the tracking issue being the case, since withdrawing it wholesale takes the specification with it — and MUST NOT partition such a channel by enumerating its write operations, since the enumeration drifts with the channel's surface while still reading as enforcement. Name the delivery boundary as prose instead, stating which part a withdrawn tool actually closes and which stays available through a shell as a rule the worker is asked to honor rather than one the host enforces.
