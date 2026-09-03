# Context Ownership

Apply this reference when the main actor decides whether to read something itself or hand it to an investigator instead, and when reading back what an investigator returns. [subagent-delegation.md](./subagent-delegation.md) governs what this role shares with every subagent the loop spawns: the writer-versus-reader axis places it as a reader alongside the pre-flight reviewer, and that reference's harness permission determination, resolution precedence, model-and-effort certainty, self-contained task, and untrusted-artifact-content rules all apply to it unchanged. This reference states only what is particular to context ownership — the boundary the main actor itself keeps, and the task it hands across that boundary.

## The Investigator Role

An investigator is defined by nothing except what it is given to read and what it returns. It has no capability set of its own to qualify by, no exclusion criterion, and no fourth resolution step: it is a reader in exactly the sense [subagent-delegation.md](./subagent-delegation.md#writer-versus-reader) already states, and every rule that reference states for a reader governs it without restatement here. Resolving one follows the same shared precedence as any other role; where none resolves, the main actor reads the payload itself, the same way it would any other read it owns. That is a per-read fallback, not a stage entered or skipped as a whole the way [pre-flight-review.md](./pre-flight-review.md) is.

## The Boundary

Not every read belongs in the main actor's own context. Some reads are the object of the judgment the main actor is about to make — the exact wording is what the judgment is about, and no summary of it would do the same work. Other reads are inputs to a judgment the main actor makes about something else entirely — a large payload it needs one conclusion from, not the text itself, and carrying the whole payload into context to extract that one conclusion spends exactly the budget delegating an investigator exists to save.

What stays with the main actor: a body it is about to write back — the plan, the status block, a comment — because writing it back correctly depends on its current exact text; a plan revision it is comparing against another, where the comparison is the judgment; a diff it is judging, for the same reason; and the rules it is itself obeying, which it cannot follow by conclusion alone. What goes to an investigator instead: a log, a long thread, a wide search across files or history, or a file tree the main actor is only locating something in — every one of these is read for what it implies, not for its own wording, which is what makes handing it off lose nothing the main actor needed.

A third case fits neither of those. Sometimes fidelity is the requirement, but only part of the payload is wanted — the exact bytes of a slice, not a conclusion about the whole. Delegation cannot serve that read: an investigator is a summarizing intermediary by construction, and a summary is exactly what a fidelity requirement rules out. So the narrowing has to happen in the tool call itself — the read is neither carried whole into the main actor's context nor handed to an investigator, but scoped down to the slice that is wanted before it is read at all.

| Category                      | What happens                                                        | Examples                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| main reads it                 | The read is the object of the judgment being made                   | the diff under review, two plan revisions being compared, the rules the main actor is itself obeying      |
| an investigator reads it      | Large material needed for one conclusion, not for its own text      | CI logs, long threads, wide searches across files or history, file trees, a dependency investigation      |
| narrowed at the tool boundary | Fidelity is the requirement, but only part of the payload is wanted | a single failing assertion line, field selection on a structured response, a bounded line range of a file |

Issue and pull-request bodies split the same way, but along the write/read axis rather than the size axis. A write is the main actor's own and needs no investigator, because what it writes is text it authored rather than anything read back; what a write may be composed from is [plan-document.md](./plan-document.md)'s rule, and the reads a write depends on route by the rows below like any other read. A read that needs only a piece of what a body says is a conclusion, not the text, and goes to an investigator; a read that needs the body's own bytes stays with the main actor, narrowed to the part that matters.

| Operation                                                     | Who                                                | Why                                                                    |
| ------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| write or rewrite a body                                       | main, from text it authored; never an investigator | composing it is `plan-document.md`'s rule, not this one                |
| pull acceptance criteria or decisions out of an existing body | an investigator, in `list` form                    | the full text is not needed                                            |
| read a status block byte-faithfully                           | main, but narrowed                                 | fidelity is the requirement, so no summarizing intermediary is allowed |

**Guidelines:**

- MUST keep, in the main actor's own context, any read whose exact text is the object of the judgment being made — a body about to be written back, a plan revision under comparison, a diff under review — and the rules the main actor is itself obeying.
- MUST hand any other large payload needed only for a conclusion, never for its own text, to an investigator instead of reading it directly wherever a qualifying investigator resolves, and read it directly otherwise.
- MUST narrow the read at the tool boundary, rather than delegating it or reading it whole, wherever fidelity is the requirement but only part of the payload is wanted.
- MUST keep an issue or pull-request body write with the main actor rather than an investigator, composing it per [plan-document.md](./plan-document.md)'s own rule rather than any restatement of it here; MUST route pulling acceptance criteria or decisions out of an existing body to an investigator in `list` form; and MUST keep a byte-faithful status-block read with the main actor, narrowed, rather than through a summarizing investigator.

## The Investigator Task

An investigator earns its place only by returning what the main actor actually needs next: a conclusion, and a locator the main actor can follow if the conclusion turns out not to be enough. Returning the source text instead — the whole log, the whole thread, the file it searched — puts back into the main actor's context exactly what sending the read to an investigator existed to keep out, and produces no saving at all. What that means for the shape of the task is fixed below: three inputs the main actor gives it, and three shapes its answer may take.

1. **Target** — a locator. This is the starting point; widen it if the answer requires it.
2. **Question** — one. Answerable as an enumeration or a yes/no.
3. **Return as** — `verdict`, `list`, or `extract`.

| Shape     | Contents                                                                                            | Used for                           |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `verdict` | a one-sentence conclusion, a locator, and a confidence marking of established, inferred, or unknown | a question like why a check failed |
| `list`    | entries of an id, a locator, and one line each                                                      | enumerating findings               |
| `extract` | the minimum quotation the claim needs, plus a locator                                               | the exact wording of a rule        |

Do not give the investigator a read budget. The task tells it to read as much as it takes to settle the answer and not to come back with a partial one. The reason is a round trip: asking again costs the main actor a turn, and that turn's answer is then re-read by every turn after it — more than an order of magnitude what the investigator spends reading further to avoid it. The one permitted stop short of an answer is returning `unresolved`, when the material turns out not to answer the question at all.

The output is the sole channel back into the main actor's context, which is why only the output side is worth constraining. Nothing above bounds what the investigator reads to get there — only what it hands back once it has.

**Guidelines:**

- MUST give an investigator exactly a target it may widen if the answer requires it, one question answerable as an enumeration or a yes/no, and the return shape its answer must take.
- MUST require that investigator to return a conclusion and a locator rather than the source text, substituting a quotation bounded to what the conclusion needs, alongside the locator, only where the conclusion cannot stand without one — never the payload standing in for the conclusion.
- MUST NOT impose a read budget, a token cap, or a tool-call cap on an investigator; instruct it instead to read as much as it takes to settle the answer, stopping short only by returning `unresolved` where the material does not answer the question.
- MUST prohibit an investigator from pasting the source back, returning a full summary, proposing further investigation, or exploring outside the target beyond what the question requires — the four constraints that belong on its output, the one channel that reaches the main actor's context.
