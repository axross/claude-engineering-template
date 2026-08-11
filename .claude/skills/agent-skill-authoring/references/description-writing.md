# Description Writing

Apply this reference when authoring or revising a skill's `description`. It is the only body-adjacent text every host reads during discovery, and on a host that shows a skill listing it is what the routing decision is made from.

## Lead With the Routing Decision

A host reading a large skill set does not show every description in full. It budgets the listing against its context window and truncates each entry to fit, so the opening bytes are the only ones guaranteed to arrive. Whatever decides **whether this skill applies** therefore goes first: the concrete triggers, the domain tokens a prompt would carry, and any disclaimer that routes a competing skill away. What the skill _is_ and what it _covers_ follow, and are the first things cut.

**Example:**

```yaml
description: Reviewing a code change — a pull request, a branch diff, or your own work before calling it done. Not for writing the change, only judging one that exists. Covers severity floors, file-line evidence, and the review lenses.
```

**Guidelines:**

- MUST open `description` with the text that decides whether the skill applies, before any statement of what it is or covers.
- MUST order the rest so truncation degrades gracefully: everything past the opening is genuinely optional, because on a large installed corpus it may never be read.
- MUST spend as few bytes as possible on the routing frame itself — "Apply this capability whenever you …" is scaffolding, and the trigger it introduces is the part that carries the decision.
- MUST NOT restate the skill's own name, which the host already shows beside the description.
- MUST NOT phrase the field as third-person passive prose such as "This skill provides...".
- MUST keep a disclaimer that routes a competing skill away, even under a tight budget; it is a routing decision, not coverage detail.

## Triggering Keywords

Agents match surface text as well as semantics, and only `description` carries it. Include the terms users, reviewers, and maintainers actually type.

**Guidelines:**

- SHOULD include likely user phrasings, including short prompts like "split this skill" or "audit skills".
- SHOULD include literal domain tokens such as `SKILL.md` or `MECE` when they mark the skill's territory.
- MUST include symptom-based triggers when users may describe the problem instead of the domain.
- SHOULD NOT pad with broad keywords outside the skill's actual scope.

## Length Discipline

Discovery metadata competes for context across the entire skill set. One hard cap is compared exactly by `scripts/check-skill-frontmatter.mjs`, which the parent `SKILL.md` requires you to run after editing frontmatter: `description` measured in **bytes**, because a host that applies the spec's limit byte-wise refuses to load a skill that exceeds it. The target below is judgment the validator cannot make.

**Guidelines:**

- SHOULD target roughly 512 bytes for `description`, well under the hard cap, because the cap governs whether a skill **loads** while the listing budget governs how much of it is **read**.
- SHOULD trim coverage detail and duplicated synonyms before trimming trigger text.
- MUST assume over-budget text may be truncated, ignored, or rejected by a host runtime, and write so the skill still routes when only the opening survives.

## Host Extensions Are Not a Second Home for Triggers

A host may define its own discovery field — Claude Code reads a `when_to_use` alongside `description`. Text placed only there is invisible to every host that does not define it, and nothing mechanical reports the loss.

**Guidelines:**

- MUST state the trigger in `description`, whatever host extensions the project also uses.
- MUST NOT rely on a host extension to carry routing text that `description` does not already carry.
- SHOULD prefer one field over two when the host set is not known in advance, since a single `description` is the only text every host is guaranteed to read.

## Common Failure Modes

Most discovery-metadata failures are routing failures. They either prevent the skill from loading when it should or load it for prompts it does not own.

**Failure Examples:**

> Too narrow: Use when designing the homepage.

> Too broad: Use for code.

> Buried trigger: 400 bytes of coverage before the first word about when to apply it.

**Guidelines:**

- MUST fix trigger text that fires only on the obvious happy-path phrasing.
- MUST narrow trigger text that fires on shared words unrelated to the skill's scope.
- MUST replace vague verbs such as `helps`, `handles`, or `manages` with concrete trigger verbs.
- MUST move the trigger to the front when a description states coverage first, since a truncated listing then shows nothing a router can use.
