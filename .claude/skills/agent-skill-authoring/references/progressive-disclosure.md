# Progressive Disclosure

Apply this reference when deciding whether to split a `SKILL.md` into reference files, how to wire those files, and when a small skill should remain a single file.

## The Role Contract

`SKILL.md` states the contract itself — the three things a body carries, and the "needed before the routing decision" test for keeping a rule in it — as a rule, which is where a contract belongs; this section elaborates it rather than repeating it.

This test subsumes, rather than competes with, the load-bearing test and the unconditional-scope carve-out `SKILL.md` already states. A rule that fails the carve-out — one whose triggering condition is narrower than "every turn within the skill's scope" — is also a rule the reader does not need before every routing decision, so it moves to a reference regardless of how important it is. The two tests agree on every case in this corpus; the role contract is the frame that explains why they agree, not a third, competing rule.

### Where a Body-Resident Rule Goes

A rule that passes the contract's test takes one of two positions relative to the section's routing list, and both leave the routing list's own `**Guidelines:**` block — where one exists — carrying nothing but that reference's read obligations.

**Before the routing list**, when the rule stands on its own:

```markdown
## Topic

<prose that demonstrates the topic>

**Guidelines:**

- MUST … (a rule the reader needs before deciding what to open)

See [topic.md](./references/topic.md) for:

- what the reference covers

**Guidelines:**

- MUST read [topic.md](./references/topic.md) before <narrow condition>.
```

**After the routing list**, when the rule reads better once the reference's scope is already in view. The paragraph in between is not decoration — it is the justification the unconditional-scope carve-out already requires an author to state, saying why the rule below stands in the body rather than behind a pointer:

```markdown
See [topic.md](./references/topic.md) for:

- what the reference covers

**Guidelines:**

- MUST read [topic.md](./references/topic.md) before <narrow condition>.

<a paragraph saying why the rule below stands in the body rather than behind a pointer>

**Guidelines:**

- MUST … (the body-resident rule)
```

What both shapes rule out is the rule folded in among the read obligations themselves, where a reader looking for "what do I open, and when" finds a requirement instead:

```markdown
See [topic.md](./references/topic.md) for:

- what the reference covers

**Guidelines:**

- MUST read [topic.md](./references/topic.md) before <narrow condition>.
- MUST … (anything that is not a read obligation) ← rejected
```

A **read obligation** is an RFC-2119 bullet whose keyword is followed by `read` and a link to a reference file — the shape `MUST read [name.md](./references/name.md) before …`. Anything else inside the `**Guidelines:**` block a routing list introduces is a rejection: the body-prose validator (`check-skill-body.mjs`) checks exactly that block, and fails the build on it.

## The Load-Bearing Test

`SKILL.md` states the test itself, as a rule — which is where the test belongs, so this section elaborates it rather than repeating it. The table still sorts a topic's content into two sides, but both sides now live in the reference: a load-bearing rule's presence is what earns that reference a conditional MUST-read obligation in `SKILL.md`, worded to the condition under which missing the rule would produce wrong output.

| Load-bearing — earns a conditional MUST-read obligation in `SKILL.md` | Elaboration — stays in the reference, covered by the same obligation     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| the rule statement itself, and its RFC-2119 bullets                   | worked examples, and the code that shows the rule applied                |
| a fixed order, list, or closed set the output must match              | rationale, and what was rejected                                         |
| a constraint whose violation is not self-evident from the output      | edge cases, platform adapters, and per-option tables consulted on demand |

## The Unconditional-Scope Carve-Out

A conditional read obligation costs a read only when its condition fires. A rule whose condition is unconditional within its own skill's scope — true on every turn that skill governs, never narrower — gains nothing from moving to a reference: the pointer would fire every time, costing a read while shaking nothing that staying in `SKILL.md` would not already have shaken.

**Guidelines:**

- MUST keep a rule's own statement in `SKILL.md`, not behind a reference pointer, when the rule applies on every turn within its skill's scope rather than under some narrower condition.
- MUST still route that rule's worked examples, rationale, and edge cases into `references/`, exactly as a load-bearing rule elsewhere does; the carve-out moves where the obligation's cost falls, not the elaboration.
- MUST treat the carve-out as the exception rather than a default: an author reaching for it states, in the change that applies it, why the rule's condition is unconditional rather than merely broad.

## References Directory Pattern

Progressive disclosure keeps discovery cheap and detail available. The standard split layout is a parent `SKILL.md` plus Markdown topic files directly under a `references/` subdirectory. The parent routes agents to the right reference and carries the conditional obligation to read it; each reference carries a load-bearing rule's own statement together with what elaborates it — worked examples, edge cases, rationale — per the test above.

```
skill-name/
├── SKILL.md
└── references/
    ├── topic-one.md
    └── topic-two.md
```

**Guidelines:**

- MUST use either a single `SKILL.md` or a short `SKILL.md` plus one-level-deep topic references under `references/`.
- MUST use `references/` as the subdirectory name for split Markdown topic files unless the host project explicitly establishes a different convention.
- MUST keep reference files directly under `references/`; do not create deeper reference nesting such as `references/security/input-validation.md`.
- SHOULD keep parent `SKILL.md` focused on scope, routing, and the conditional obligation to read each reference.
- MUST move a topic's full content — both sides of the load-bearing test above — into reference files once progressive disclosure is introduced; `SKILL.md` states no rule's content of its own, only the obligation to read it, except under the carve-out above.
- SHOULD keep examples, edge cases, lengthy checklists, and topic-specific procedures in reference files rather than in the parent `SKILL.md`.

## Size Thresholds

Size thresholds are review signals, not mechanical quotas. When a skill crosses them, the reader is likely paying too much context to find the relevant rule.

**Guidelines:**

- SHOULD keep `SKILL.md` under about 500 lines and 5,000 tokens.
- SHOULD split or subdivide a skill when a section exceeds the section-length ceiling defined in [scoping-and-mece.md](./scoping-and-mece.md).
- SHOULD split when distinct subtopics emerge that an agent can load independently.
- SHOULD keep each reference file under about 500 lines.
- SHOULD split an oversized reference into sibling references instead of nesting deeper.

## When Not to Split

Splitting adds indirection. A small skill that is easy to scan should stay single-file even if neighboring skills use references.

**Guidelines:**

- MUST NOT split a compact skill purely for symmetry with other skills.
- SHOULD inline a skill that has only one tiny reference file.
- SHOULD avoid reference files shorter than about 30 lines unless the topic is unusually fragile.
- MUST treat progressive disclosure as a remedy for bloat or topic separation, not as a mandatory layout.

## Wiring Reference Files from the Index

The index should let the agent decide what to load without opening every reference. In a split skill, each reference-routing section in `SKILL.md` should use a predictable shape: a topic heading, one `See [file.md](./references/file.md) for:` line, plain descriptive bullets that name situations, practical use cases, or specific conditions, and — where the reference holds a load-bearing rule — a `**Guidelines:**` block carrying the obligation to read it.

**Example:**

```markdown
## Input Validation

See [input-validation.md](./references/input-validation.md) for:

- changing input schemas or URL decoding
- tracing untrusted input fields into metadata, UI, and links
- checking source URL protocol filtering and length limits

**Guidelines:**

- MUST read [input-validation.md](./references/input-validation.md) before changing an input schema, decoding a URL, or tracing an untrusted input field into metadata, UI, or a link.
```

**Guidelines:**

- MUST use the `## Section/Topic Name` + `See [file.md](./references/file.md) for:` + descriptive bullet-list format for reference-routing sections in `SKILL.md`.
- MUST use a stable leading-dot relative link that resolves from the parent file, such as `./references/input-validation.md`.
- MUST use the reference file name as the link label in parent routing sections, such as `[input-validation.md](./references/input-validation.md)`.
- MUST keep parent routing bullets descriptive; do not use RFC-2119-style requirement keywords such as MUST, SHOULD, MAY, REQUIRED, RECOMMENDED, or OPTIONAL in these routing bullets.
- MUST place a load-bearing rule's own statement and its RFC-2119 bullets in the reference file, never in `SKILL.md`'s routing bullet list — the `See […] for:` line and the bullets under it — nor loose in `SKILL.md` outside a `**Guidelines:**` block. `SKILL.md`'s `**Guidelines:**` block, placed after that routing list, carries the obligation to read the reference instead — one bullet per reference, naming the reference and a triggering condition narrow enough to be skippable; a condition reading "before any work" or its equivalent is a defect, not a safety margin.
- SHOULD name reference files in kebab-case.
- SHOULD order parent sections by likely consultation order.

## Triggering Conditions on Reference Links

A reference link should say when the reader needs it. Without a trigger, the agent must either load everything or guess.

A bullet that gestures at a fact — announcing that one exists without saying what it is — forces the load it was meant to make optional. The reader cannot tell whether the reference answers the question in front of them, so they open it to find out, and the routing layer has bought nothing. Naming the flag, the limit, or the rule costs the same handful of words and lets the reference stay shut.

**Bad Example:**

> what makes a route static or dynamic, and the flag that changes the model

**Good Example:**

> what makes a route static or dynamic, and how `cacheComponents` redraws that boundary

**Guidelines:**

- MUST state the condition that makes each reference relevant.
- MUST state the fact a routing bullet points at, not that a fact exists — name the flag, limit, file, or rule, rather than writing "the flag", "the limit", or "the rules that apply".
- MUST NOT use empty labels such as "details" or "more information" as the only routing clue.
- SHOULD make triggers narrow enough that the agent can skip irrelevant references.

## Anti-Patterns

Anti-patterns are useful when they name the failure mode and the cost. They should still end in concrete guidelines rather than only warnings.

**Anti-Pattern Examples:**

> Symmetry split: five tiny files created only because another skill has five files.

> Detail leakage: the same MUST rule appears in both SKILL.md and a reference file.

> Deep nesting: references/security/input-validation.md under a skill that expects one level.

**Guidelines:**

- MUST NOT split a skill for visual symmetry alone.
- MUST NOT state the same normative rule in both the index and a reference file — name which side wins rather than allowing both. A rule is stated once, in the reference that governs it; `SKILL.md`'s `**Guidelines:**` block states only the obligation to read that reference, never the rule itself. The one exception is the unconditional-scope carve-out above, where the rule is stated once in `SKILL.md` and the reference does not restate it.
- MUST NOT create nested reference directories unless the host project has explicitly adopted that structure.
- SHOULD remove or merge over-fragmented references before adding more.
