# Asking the Human

Apply this reference whenever the run needs the human — putting a decision with options to them through the question tool, or stating what they said or did. It expands the [Asking the Human](../SKILL.md) section in the parent skill.

## Asking Through the Question Tool

Every human-gated **decision with options** — a Phase 1 Must-ask, an ambiguous review finding, a conflict-resolution judgment call, or a take-over decision — is asked through the harness's dedicated question tool (in Claude Code, **`AskUserQuestion`**; in Codex, **`request_user_input`**): it renders your options as selectable choices and returns the answer inline, so the run continues in the same turn. Use it whenever the session exposes it — judge that from the tools actually available to you, not from an assumption about the host or the mode. Only where the session exposes no such tool at all does the decision go into the turn output instead, ending the turn; the human still decides, the round trip just costs a turn. (The plan-approval gate is **not** one of these — it is a full plan the human reads at their own pace, so it ends the turn and waits for a resume; see [Phase 1](../SKILL.md#phase-1--plan).)

How a decision is framed — concrete options, the default you would otherwise take marked recommended, never buried in prose or silently assumed — and when two decisions may share one prompt are general conduct rather than loop mechanics. Where the project ships its own question-asking practices, follow them for that detail; in their absence the first bullet below carries the whole of it. The rest are this loop's own: recovering a question that does not come back answered, and where an open question and a pure notification each belong.

**Guidelines:**

- MUST put each decision to the human as 2–4 concrete options with the **default you would otherwise take** marked recommended, and ask dependent decisions one at a time in dependency order; never bury a decision in prose or silently assume an answer.
- MUST treat a closed or errored question tool as a signal to **re-present and ask again**, never as proof the surface lacks a UI. On a remote or cloud session the permission stream can close transiently even though the human is reachable; the harness returns the same error for that case and for a genuinely headless run, so you cannot tell them apart from the error alone.
- MUST, when the question tool errors, show the decision in plain text first — background, the question, and the numbered options with the recommended default marked — then call the question tool again with those same options, in the same order, and hold for the answer. Do not route around the human or end the turn as if blocked.
- MUST, on the next turn, treat a bare answer token — an option number, a label, or free-form "Other" text — as answering the **still-open** question, reconciled against the options you presented, rather than restarting.
- MUST keep the status block current with any open question so a session reclaimed mid-wait can re-present it; this breadcrumb records state, it is not a fallback channel for answering.
- MUST convey pure notifications (ready-to-merge, a stuck-check dormancy notice, non-convergence) in the turn output and the status block, then end the turn — never as a GitHub comment or an @mention.

## Never Manufacture the Human's Side

A run parked at a gate is under pressure to move, and the cheapest way out is to narrate an approval that never arrived — an interrupted prompt plus a generic continuation retold as "they told me to proceed." That is not a misread of an ambiguous signal; it fabricates the very authorization the gate exists to require, and it costs the human their ability to trust your account of what they said. The rules below govern the human's half of the conversation: what you may state that they did.

**Guidelines:**

- MUST NOT attribute an action, instruction, approval, or utterance to the human unless it appears in an actual user turn.
- MUST describe a continuation that carries no human-authored decision as a resume signal — never as a quoted or paraphrased human instruction, and never as approval of the gate the run is parked at.
- MUST state an inference about an ambiguous signal as an inference, never as a settled report of what the human did.
- MUST re-present a question whose prompt was interrupted, cancelled, closed, or left unanswered, and MUST NOT resolve it by adopting your own recommended defaults — a default you would have taken is not an answer they gave.
- MUST NOT cite a later gate as license to pass an earlier one; that a human could still redirect at a downstream checkpoint is never a reason to pass an upstream one. This governs the rationalization itself — [Phase 1](../SKILL.md#phase-1--plan) separately governs the artifacts no later approval can retroactively supply.
- MUST, before asserting what the human said or did, confirm an actual user turn contains it — and when none does, say so plainly or ask, rather than filling the gap with a plausible narrative.
