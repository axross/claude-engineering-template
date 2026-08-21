# Asking the Human

Apply this reference whenever you are about to put a decision to the human — a single question mid-task, or every question in a clarifying interview. The triage decides _that_ a decision is theirs, and [clarifying-interview.md](./clarifying-interview.md) decides _which_ questions to ask and in what order; this covers the mechanics of actually asking one, which is where an otherwise-correct interview quietly fails. The prompt itself, its options, and their consequences are written in the language the human's most recent message set; see [reporting.md](./reporting.md#response-language) for the term-handling rule and its edge cases.

## Asking Through the Question Tool

A decision counts as asked only when the human can see that a decision is being put to them. A harness with a dedicated question tool renders your options as selectable choices and returns the answer inline, so the question is unmissable and the work continues in the same turn. The same decision written into a paragraph, a plan's **Open questions** section, or a "let me know if you'd prefer otherwise" appended to a summary is indistinguishable from commentary: it gets read past, and the work proceeds on whatever you would have chosen anyway.

That is the failure this section exists to prevent. It is not a refusal to ask — it looks diligent, because the decision was written down somewhere — but the human never got a choice, so the outcome is identical to having assumed one.

**Bad Example:**

> The plan lists under **Open questions**: "Whether the export includes archived rows is still undecided." The run then implements the inclusive version.

**Good Example:**

> A question-tool prompt: _"Should the export include archived rows?"_ — offering **Include them (Recommended)** — "matches the current report, and the archive is small" — and **Exclude them** — "smaller file, but the totals stop reconciling with the report" — alongside the tool's own "Other". The answer arrives before anything is built.

**Guidelines:**

- MUST put every decision the triage assigned to the human through the harness's dedicated question tool (in Claude Code, `AskUserQuestion`; in Codex, `request_user_input`) whenever the session exposes one, so it renders as a selectable choice and returns an answer inline. Judge that from the tools actually available to you rather than assuming from the host or the mode, and never skip the tool because you expect it to be absent.
- MUST put the same options in the turn output and end the turn, rather than deciding, only where the session exposes no question tool at all.
- MUST frame the decision as 2–4 concrete options, state the **default you would otherwise take** and mark it recommended, and rely on the tool's built-in "Other" choice for anything you did not anticipate.
- MUST give each option the consequence of choosing it, so the human is choosing between outcomes rather than between labels.
- MUST NOT bury a decision in prose, in a document section, or in a question appended to the end of a summary — a decision the human has to find is one you took for them.
- MUST NOT silently assume an answer, and MUST NOT record a decision you made on the human's behalf as a stated assumption, per [uncertainty-triage.md](./uncertainty-triage.md).
- SHOULD use the most interruptive channel the harness does offer when it provides no dedicated question tool, rather than treating that absence as license to decide.

## One Decision Per Prompt

A question tool that accepts several questions at once invites batching them, and batching is safe only between decisions that do not touch. When one answer would delete another question, narrow its options, or change what it means, asking both at once yields an answer to a question that no longer exists — and the human cannot tell you so, because they answered what you showed them.

> Asking _"is this surface public or authenticated?"_ alongside _"what does a stranger see when the list is empty?"_ gets an answer to the second that the first may have just invalidated. Asked in order, the second either becomes "what does a signed-in user with no data see?" or disappears.

**Guidelines:**

- MUST NOT put two decisions in one prompt when the answer to one would change, prune, or reframe the other; ask those one at a time, in dependency order.
- MUST re-derive the remaining prompts after each answer, rather than sending a batch composed before the first answer arrived, per [clarifying-interview.md](./clarifying-interview.md).
- MAY share one prompt between decisions that are genuinely independent, where no answer to either touches the other.
