# Description Writing

Apply this reference when authoring or revising a skill's `description`. It is the only body-adjacent text every host reads during discovery, and on a host that shows a skill listing it is what the routing decision is made from.

## The Four-Slot Contract

A host reading a large skill set does not show every description in full. It budgets the listing against its context window and truncates each entry to fit, so the opening bytes are the only ones guaranteed to arrive. But surviving truncation is only half the job: a description that arrives intact still has to let a reader **judge** that this skill, and not the neighbour beside it in the listing, is the one the prompt calls for.

Both jobs are served by composing every `description` from four slots in one fixed order:

| #   | Slot         | Carries                                                                                                           | Cut order |
| --- | ------------ | ----------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | **Trigger**  | The activity or situation in the phrasing a user would actually type, plus the most discriminating literal tokens | never     |
| 2   | **Identity** | One clause naming the layer this capability owns — what it _is_, not what it is about                             | never     |
| 3   | **Boundary** | Hand-offs routing a competing skill away, and any surface the skill explicitly refuses to serve                   | never     |
| 4   | **Coverage** | The enumeration of what is inside                                                                                 | cut first |

The order is fixed because a reader comparing many catalog entries side by side judges far better when every entry answers the same questions in the same places. Slot 4 is the only one that may be sacrificed: everything before it decides routing, and everything in it merely describes what routing will find.

**Example:**

```yaml
description: Reviewing a code change — a pull request, a branch diff, or your own work before calling it done. The methodology for judging whether a change already written is safe to merge. Not for writing the change. Covers severity floors, file-line evidence, and the review lenses.
```

**Guidelines:**

- MUST compose `description` from the four slots above, in that order.
- MUST order the rest so truncation degrades gracefully: only slot 4 is genuinely optional, because on a large installed corpus it may never be read.
- MUST spend as few bytes as possible on the routing frame itself — "Apply this capability whenever you …" is scaffolding, and the trigger it introduces is the part that carries the decision.
- MUST NOT restate the skill's own name, which the host already shows beside the description.
- MUST NOT phrase the field as third-person passive prose such as "This skill provides...".
- MUST keep slot 3 even under a tight budget; a hand-off and a refused surface are routing decisions, not coverage detail.

## Fuse the Trigger and the Identity

Slots 1 and 2 are written as **one opening clause** wherever the language allows it, because the two failure modes a description falls into are each half of that clause missing.

A bare list of literal tokens is a trigger with no identity: it routes a prompt that happens to carry one of those tokens and nothing else, and it tells a reader nothing about what the skill would do once loaded. A vendor skill opening this way is routinely mistaken for the vendor-neutral one beside it, and the reverse. An opener like "The ability to …" is the opposite defect — an identity with no trigger, which describes the skill accurately to someone who has already decided to read it and helps no one decide.

Fused, the same bytes do both jobs at once. "Wiring or reviewing a Sentry integration" names an activity a prompt would carry **and** the layer the skill owns. "Deciding what a system should report about itself, independent of the SDK that carries it out" does the same for the vendor-neutral neighbour, and the two are now told apart in their opening words rather than eleven tokens later.

**Failure Examples:**

> Trigger with no identity: A change touching Zod — `z.object`, `z.infer`, `safeParse`, `z.codec`, `z.coerce`, `z.brand`, …

> Identity with no trigger: The ability to model and validate data structures with confidence.

**Guidelines:**

- MUST make the opening clause name both an activity or situation **and** the layer the capability owns, fusing slots 1 and 2 into one clause wherever the language allows it.
- MUST NOT open `description` with a bare list of literal tokens; the tokens follow the fused clause as evidence for it.
- MUST place the identity clause before the token list even where the two cannot be fused into one clause.

## Triggering Keywords

Agents match surface text as well as semantics, and only `description` carries it. Include the terms users, reviewers, and maintainers actually type — but as support for the opening clause rather than in place of it.

**Guidelines:**

- SHOULD include likely user phrasings, including short prompts like "split this skill" or "audit skills".
- SHOULD include literal domain tokens such as `SKILL.md` or `MECE` when they mark the skill's territory.
- SHOULD prune a token list to the roughly ten most discriminating entries — a token that appears in no other skill in the corpus earns its bytes; a near-synonym of one already listed does not.
- MUST include symptom-based triggers when users may describe the problem instead of the domain.
- SHOULD NOT pad with broad keywords outside the skill's actual scope.

## State What the Skill Refuses to Serve

Slot 3 holds two different things, and only one of them is obvious. A hand-off to a competing skill is the familiar case. The other is a surface the skill's own body explicitly derives no rules for while sitting squarely inside the territory the trigger claims — a framework skill that covers an app's routing but deliberately says nothing about its server output, for instance.

Left unstated, such a surface routes a prompt to a skill that then cannot serve it. That is worse than a miss: a miss leaves the agent looking further, and a wrong load leaves it working from a skill that does not cover the question. Both belong in `description` however tight the budget, because the cost of omitting them is paid at every prompt that lands on them.

**Guidelines:**

- MUST state in `description` every surface the skill's body explicitly declines to derive rules for, whenever that surface falls inside the territory the trigger claims.
- MUST state each hand-off by the capability that owns the excluded work, not by a bare "not for X", so a reader learns where to go instead.
- MUST keep a mutual disclaimer in every skill that participates in it; a disclaimer present on one side only routes in one direction.

## Length Discipline

Discovery metadata competes for context across the entire skill set. One hard cap is compared exactly by `scripts/check-skill-frontmatter.mjs`, which the parent `SKILL.md` requires you to run after editing frontmatter: `description` measured in **bytes**, because a host that applies the spec's limit byte-wise refuses to load a skill that exceeds it. The target below is judgment the validator cannot make.

The target is a **centre of gravity for the corpus, not a per-skill ceiling**. A skill whose body carries genuine breadth, or one participating in several mutual disclaimers, legitimately sits above it; a narrow single-library skill should sit below. What the target governs is the whole set: a corpus whose mean drifts upward is one where slot 4 has been allowed to grow, and trimming coverage is what brings it back.

**Guidelines:**

- SHOULD target roughly 640 bytes for `description` as a corpus mean, well under the hard cap, because the cap governs whether a skill **loads** while the listing budget governs how much of it is **read**.
- SHOULD keep any single `description` under about 800 bytes; past that, the enumeration in slot 4 has almost always outgrown what a router reads.
- MUST trim slot 4 and duplicated synonyms before trimming any of slots 1 through 3.
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

> Buried identity: eleven literal API tokens before any statement of what the skill is, so a paraphrased prompt matches nothing.

**Guidelines:**

- MUST fix trigger text that fires only on the obvious happy-path phrasing.
- MUST narrow trigger text that fires on shared words unrelated to the skill's scope.
- MUST replace vague verbs such as `helps`, `handles`, or `manages` with concrete trigger verbs.
- MUST move the trigger to the front when a description states coverage first, since a truncated listing then shows nothing a router can use.
- MUST move the identity clause ahead of the token list when a description opens with tokens, since a prompt carrying none of them then matches nothing at all.
