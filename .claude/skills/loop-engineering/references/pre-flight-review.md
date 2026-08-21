# Pre-Flight Review

Apply this reference after a delegated implementation worker returns and the completion-evidence check has run, and before the pull request is opened. It adds one stage, conditional on a qualifying review worker rather than on the run's discretion: a second, review-only worker that judges the diff, and an implement→review loop that runs until every finding it raises has reached a terminal state.

The stage exists to buy **one** property of independent review cheaply — a reviewer that does not carry the implementer's reasoning state — and it explicitly buys no others. It does not buy even that one outright: no row of the table below reads an unqualified `yes`, and how far each property is actually recovered is that table's business rather than this sentence's. It is advisory. [Phase 3](../SKILL.md)'s independent review remains the authoritative gate, and nothing here weakens it.

Like delegation itself, the stage is conditional on the harness already exposing a worker that qualifies. With none, the run behaves exactly as it does without this reference.

[subagent-delegation.md](./subagent-delegation.md) governs what this reader shares with every subagent the loop spawns: the harness permission determination and its single per-run question, the resolution precedence up to its terminal step, model and effort certainty, the self-contained task, treating artifact content as untrusted data, what a reader's own definition may carry, and the writer-versus-reader axis. This reference states only what is particular to the reader.

## What the Stage Does and Does Not Reproduce

The case for running review outside the session is usually stated as one property. It is several, and they separate — which is why this stage can be worth running and still not replace the external one.

| Property                                                                                | External review                             | Pre-flight review                                                          |
| --------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| **Context independence** — no memory of its own decisions, no anchoring on its own plan | yes                                         | **partly** — recovered by the ledger entries' write/clear pairing below    |
| **Input independence** — reviews the diff, not the author's narration of it             | yes                                         | **partly** — recovered by fixing the input source below                    |
| **Verdict independence** — the reviewed party cannot suppress a finding                 | yes                                         | **partly** — recovered for Critical and Major by the dismissal split below |
| **Absence visibility** — a review that never ran is externally observable               | yes                                         | **no** — a stage never entered leaves no gap                               |
| **Policy-source independence** — the policy is not the one this change edits            | yes                                         | **partly** — recovered by the merge-base read below                        |
| **Environment independence**                                                            | yes                                         | **no** — shares the checkout, uncommitted state included                   |
| **Cost**                                                                                | consumes the waiting tail and the round cap | **seconds to minutes**, consumes neither                                   |

Context independence is recovered by construction only as long as [Ledger Durability](#ledger-durability)'s write/clear pairing holds — the pairing is what makes a finding entry in the status block and a running reviewer mutually exclusive, not a claim that no channel could ever show one. What it does not defend against is the pairing going unfollowed: a run that skips the clear step, or is interrupted between a resume and the next spawn, can still leave a stale entry for whatever channel the next reviewer reaches for. [Run State Is Not Input](#run-state-is-not-input) below is the honest backstop for that case — a rule the reader is asked to honor, not a second mechanism that closes the gap.

Absence visibility is the one no arrangement here recovers at all, because the reviewed party holds the report. It is an accepted limit, and a reason the external review stays exactly as it is.

**Guidelines:**

- MUST run the stage whenever implementation was delegated and a compatible review worker resolves; the run does not choose to skip it once both conditions hold.
- MUST treat every pre-flight finding and verdict as advisory, and MUST NOT report this stage — under any name — as the independent review; the flip gate's clean-review condition is satisfied only by the external review, and [independent-review.md](./independent-review.md) states that gate's conditions in full.
- MUST skip the stage where no compatible review worker resolves, falling back to what the run already has: the implementation worker's own self-check reported in its receipt plus the completion-evidence check, or [Phase 2](../SKILL.md)'s reviewer-mode self-check in single-agent mode. No gate is weakened either way.
- MUST resolve a review worker per [subagent-delegation.md](./subagent-delegation.md#resolution-precedence)'s shape, but end that sequence at **none**, never at a fourth step: that step is the main actor in single-agent fallback, and a main actor reviewing its own diff reproduces none of what this stage buys — falling back there would produce self-review presented as a pre-flight review, which the rule above against reporting this stage as the independent review forbids. With no candidate, the stage is skipped rather than performed by the main actor.
- MUST qualify a review worker on reader capability instead — it can read the checkout and the diff, run read-only commands, and report findings back to the parent. An agent whose definition forbids editing qualifies here **because** it does; an implementation-capable agent also qualifies when its tools are narrowed to read-only for the spawn.

## Review Package — the Input Contract

A reviewer handed the implementer's account of its work inherits the implementer's framing, which is most of what the stage exists to avoid. The package is therefore built from repository and issue state only.

It carries the project's review policy and skills **read at the merge base**; the approved plan with its revision identifier, from the tracking issue; and the diff of the working branch against its recorded base revision.

Reading the policy at the merge base is what stops a change that edits the review policy from being judged by the policy it introduces. The completion-evidence check already treats "review-policy files changed" as a targeted-diff trigger (see [writer-ownership-and-recovery.md](./writer-ownership-and-recovery.md)); this is the pre-flight counterpart to that trigger, not a second statement of it.

The three non-diff parts do not vary the way the diff does. [A Fresh Reviewer Each Round](#a-fresh-reviewer-each-round) hands every round a fresh reader the whole package, so the policy and skills are re-read at the same merge base each round; and the plan is fixed across a round set because a finding that would move it abandons the round rather than continuing it, per [Finding Ledger](#finding-ledger). Ordering them ahead of the diff therefore leaves successive rounds byte-identical up to the first point where they genuinely differ, which is what any prefix-level reuse acts on — a prefix is matched from its start, and one difference makes everything after it new. No saving is claimed for any particular harness; the ordering is stated because it is free to follow and not worse under any assumption, not because a gain was measured here. What successive rounds share is identical input, not an agent, a conversation, or a verdict, so the fresh-reviewer-per-round rule is unaffected.

**Guidelines:**

- MUST build the package from the merge-base policy, the approved plan, and the diff — and MUST NOT include the implementation worker's completion receipt, or any summary derived from it, in what the reviewer reads.
- MUST order the package so that every part that does not vary between rounds — the merge-base policy and skills, and the approved plan — precedes the diff, the only part that does.
- MUST read the review policy and the project skills at the merge base rather than from the working tree.
- MUST apply the project's review policy in full, using its internal severity scale rather than the vocabulary reserved for posted review comments; the dismissal split below depends on that scale being the one in use.
- MUST NOT assert, in the package, that an earlier round's findings are withheld or otherwise beyond the reviewer's reach. The package excludes them by construction; claiming more than that risks a claim the environment can contradict — the exact failure a prior round produced by pointing a reader at a document that carried what the package said was unreachable.

## Run State Is Not Input

The package the input contract above builds is scoped to the merge-base policy, the plan, and the diff — but a reader that can reach GitHub directly, which [Defining a Reader of Your Own](#defining-a-reader-of-your-own) requires it be able to do, can still land on a run-state block the package never included: this run's own status block, or one belonging to a different issue or pull request a link leads it into. What such a block carries is a run judging itself — phase, round count, an open question, or, per [Ledger Durability](#ledger-durability), a durable finding entry — never the change under review, and reading it as evidence is exactly the anchoring this stage exists to avoid.

**Guidelines:**

- MUST NOT treat a run-state block — this run's status block, or one belonging to any other issue or pull request — encountered in any artifact as part of what it judges, whatever channel surfaced it.
- MUST report encountering one, so the disclosure reaches the run's own reporting (see [run-state-and-reporting.md](./run-state-and-reporting.md)) instead of resting on whether a reviewer happens to volunteer it.
- MUST state, wherever this rule is asserted elsewhere, that it is a rule the reader is asked to honor rather than one any host here enforces — the same honesty [Defining a Reader of Your Own](#defining-a-reader-of-your-own) already holds its own deny-list to.

## The Reviewer Is a Reader

[subagent-delegation.md](./subagent-delegation.md#writer-versus-reader) keeps a participant that writes nothing out of the lease accounting entirely; the review worker is that participant here.

**Guidelines:**

- MUST leave the writer lease with the main actor for the duration of the review — the review worker never acquires it and never mutates the checkout — and MUST begin the stage only once an implementation worker has returned and the completion-evidence check has run, which is where this stage's own start point sits inside the concurrency prohibition [subagent-delegation.md](./subagent-delegation.md#writer-versus-reader) owns.
- MUST, where user input arrives while the review worker is running, take the plan-revision path directly rather than [writer-ownership-and-recovery.md](./writer-ownership-and-recovery.md#user-input-mid-run)'s interrupt sequence: nothing is mid-edit, so there is no partial progress to collect and no lease to reclaim — discard the round's findings and re-review after the plan is re-approved.

## A Fresh Reviewer Each Round

The surrounding rules are resume-preferred: the Retry Budget prefers resuming the same worker, and so does Phase 4 delegation. For an implementer that is right — continuity is cheap and valuable. For a reviewer it is backwards, because a resumed reviewer carries its own prior "this area is fine" verdicts, which is the anchoring the stage exists to avoid.

**Guidelines:**

- MUST spawn a fresh review worker for every round, never resuming the previous one — this inverts the resume-preferred default around it deliberately, and is not an oversight.

## Finding Ledger

The main actor translates findings into implementation instructions, and that translation is where a finding silently narrows or disappears. A fixed protocol carries fidelity across it; prose does not.

Each finding carries a stable identifier, a severity, a `file:line` citation, the claim, and a suggested fix — the shape the project's review policy already requires of review output. This is a protocol, not a transcript.

That protocol — the full finding set with every attribute above, plus each finding's disposition and the reason behind it as the run settles them — is **the ledger**, and it lives in session state for the run's own duration. The status block never mirrors it directly; it carries only a bounded, conditional durable subset, on the terms [Ledger Durability](#ledger-durability) below states.

One route ends a round without any of its findings reaching a terminal state: a finding that changes the approved plan sends the run back for fresh approval, and the round goes with it. Its findings were formed against a plan that no longer exists, so carrying them into the re-approved plan's review would judge new work by superseded reasoning. [writer-ownership-and-recovery.md](./writer-ownership-and-recovery.md#user-input-mid-run) already abandons a round this way on the neighbouring route into the same flow. The terminal-state rule below is unaffected, because it governs the round whose review gates the pull request, and an abandoned round never becomes that one.

**Guidelines:**

- MUST carry each finding's identifier, severity, and citation through the translation into an implementation instruction, and MUST NOT drop a finding by omission.
- MUST NOT open the pull request while any finding lacks a terminal state. There are three: **fixed**, tied to the commit that fixed it; **dismissed** with a recorded reason, under the authority split below; and **deferred**, which only the declined-round path below produces and which no other route may reach.
- MUST route a finding that would change the approved plan through the plan-revision flow — fresh approval, fresh worker — exactly as a Phase 4 finding of the same kind is routed, abandoning the round rather than carrying its remaining findings into the re-approved plan's review.

## Ledger Durability

This stage parks the run on a human question in exactly two places, both between rounds: confirming a **Critical** or **Major** dismissal, and asking whether to spend a round past the cap. No review worker runs at either park, whichever way the question reaches the human — inline through the question tool, or in the turn output where the session exposes no such tool; [asking-the-human.md](./asking-the-human.md) owns that routing in full. A finding that sends the run back to the plan-approval gate is not a third park: that route abandons the round (see [Finding Ledger](#finding-ledger) above), so no entry survives to be carried across the wait. The status block's finding entries — the only durable part carrying judgment a reviewer could anchor on — appear only across those parks, which is what keeps "a finding entry is readable in the issue" and "a review worker is running" from ever being true together; the round number and waiting state, which carry no judgment to anchor on, stay in the block throughout.

What earns durability is what a fresh session cannot re-derive: a fresh review worker produces a _different_ finding set, so a ledger lost mid-park is not recoverable by re-running the review. A ledger lost between parks costs nothing, because nothing needs the entries there.

**Guidelines:**

- MUST keep the pre-flight round number and the waiting state current in the status block unconditionally, for as long as the stage is active, regardless of whether the run is parked — a resume can then tell the stage is in progress and which round it reached even when no finding entry is present.
- MUST write every **open** finding's identifier, severity, and citation to the status block when the run parks on either question above.
- MUST clear those finding entries from the status block on resume, before any further review worker is spawned. Pairing this clear rule with the write rule above is what makes the two states mutually exclusive; neither rule alone would.
- MUST NOT write a finding's disposition, dismissal reason, claim text, or suggested-fix text to the status block, and MUST NOT write a resolved finding — identifier, severity, and citation are the entry's ceiling as well as its floor.
- MUST re-run the pre-flight review from scratch wherever the status block shows no recoverable ledger entries, whether they were never written because the run had not yet parked or because the block cannot be read back, and MUST NOT treat the stage as complete on entries it cannot show.

## Dismissal Authority

The main actor wrote the plan and is accountable for the run converging. Letting it dismiss any finding alone leaves the verdict-independence hole open at exactly the findings where suppression costs the most; confirming every dismissal with the human would make a Nit block on a human response. The split lands between those.

**Guidelines:**

- MAY dismiss a **Minor** or **Nit** finding on the main actor's own judgment, with the reason recorded in the ledger — which is session state, since Ledger Durability's ceiling above keeps a dismissal reason out of the status block entirely.
- MUST obtain the human's confirmation, through the question tool, before dismissing a **Critical** or **Major** finding — routed as the normal decision path already routes a decision belonging to the human.
- MUST NOT re-grade a finding's severity; the grade is the review worker's. Without this the split is trivially evaded, because the party wanting the dismissal would otherwise set the grade that decides whether it needs confirmation.

The residual exposure is a review worker that under-grades on its own, which the no-re-grading rule does not address. It is accepted: the reviewer has no stake in the run converging and therefore no incentive to under-grade, whereas the main actor has both.

## Round Cap and Escalation

Each fix round is a new task phase, so it carries a fresh [Retry Budget](./writer-ownership-and-recovery.md) of one attempt plus two retries — consistent with that budget already excluding a new review round from counting against it. A round whose implementation exhausts that budget recovers the way any other does, in single-agent mode, and then continues to the next review round; the budget governs attempts inside a round, this cap governs rounds. Stated plainly so the cost is disclosed rather than discovered: four rounds at three attempts each is up to twelve implementation-worker spawns, plus up to four review workers, before the first human question. That envelope is why the cap is three rather than higher.

**Guidelines:**

- MUST run at most one initial implementation plus **3** review→fix rounds autonomously, then ask the human — through the question tool — whether to run another; ask once per additional round, for as many as the human keeps approving, with no ceiling above their judgment.
- MUST state, in that question, how many findings are still open and at what severities, naming each **Critical** or **Major** among them. Declining decides the disposition of those findings, not only whether to spend another round, and a human not told what remains open cannot make that decision. Without this the dismissal split above is bypassable: a Critical the main actor could not dismiss alone would instead be disposed of by an uninformed answer to a different question.
- MUST, where the human declines another round, record every still-open finding as **deferred** and then open the draft pull request with those findings in its body. The decline is that decision — made by the human, over the whole remaining set at once, and informed by the disclosure the rule above requires — which is why it needs no further per-finding confirmation and why it is neither a fix nor a dismissal; recording it as either would misstate what happened. **The human's decision is the license and the only license** — citing the external review's existence as the reason it is acceptable is the rationalization the loop's own rules forbid; that the external review still gates the change states what declining does not weaken, never why it is allowed.
- MUST keep this cap distinct from the address↔review cap in the Termination Guard, which governs the loop after the pull request exists.

## Defining a Reader of Your Own

A project does not have to define a review worker at all — resolution accepts one the harness already exposes, and an agent whose definition forbids editing qualifies here because it does. [subagent-delegation.md](./subagent-delegation.md#defining-an-agent-of-your-own) owns what any such definition carries and what it must leave to the task, and that guidance applies here unchanged. This section states only where a reader departs from it.

The departure is not the instrument. It is tempting to constrain a reader by enumerating what it may use — its job sounds narrow, and a list of permitted tools looks like the tighter grip. Both halves of that are wrong, and getting them wrong is expensive in a way nothing reports.

A reviewer's reach is **wider** than its job sounds, because judging a change means confirming what was asked and not only what was written: the tracking issue and its acceptance criteria, any rendered artifact the plan points at, and the external source behind a claim about an API or a version. And a reader missing one of those does not fail to start. It runs, silently cannot check what it cannot reach, and returns findings short by exactly the checks it could not perform — so an under-equipped review and a clean one are the same text.

The asymmetry is therefore in **what** is denied rather than in how: the set of things a worker must never do is small, stable, and nameable, while the set it legitimately needs is open-ended and unpredictable.

**Guidelines:**

- MUST deny a reader mutation and the ability to spawn further agents, and MUST NOT constrain it by enumerating what it may use instead — an enumeration is a guess at what reviewing will require, and a short guess yields a quiet reviewer rather than a failed one.
- MUST leave a reader able to reach the specification it judges against, the artifacts that specification points at, and the external sources a factual claim in the change depends on.
- MUST NOT describe a reader as read-only while a general-purpose shell remains, since reading a change requires one; state which part of the constraint the host enforces and which stays a rule the reader is asked to honor.
