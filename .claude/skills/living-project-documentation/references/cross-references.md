# Cross-References

Apply this reference when deciding whether one document should link to another,
or when reviewing a `docs/` tree whose links have multiplied.

## The Rule

A link is a cross-reference that rots independently of the prose around it: the
sentence stays true while the target moves, is renamed, or stops being current.
That cost buys navigation, so it is worth paying only where navigation is not
already free.

> **A link exists only where it carries information the structure does not
> already encode.**

One test, applied to every reference `docs/` can contain:

| Reference                  | Does structure already encode it?                               | Verdict                                                  |
| -------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| `index.md` → each document | No — reachability lives nowhere else                            | **Link.** This is how the index invariant is implemented |
| `index.md` → `decisions/`  | —                                                               | **One link to the directory**, never one per record      |
| `glossary.md` → `specs/`   | Yes — the heading a term sits under names its spec              | No link                                                  |
| Within `glossary.md`       | The file is small enough to read whole                          | No link; bold marks a defined term                       |
| `specs/` → `specs/`        | No — a dependency between domains is written nowhere else       | **Link**, for a genuine dependency                       |
| `specs/` → `decisions/`    | No — a decision exists only when its rationale is unrecoverable | **Link**                                                 |
| `decisions/` → anything    | —                                                               | No outbound links                                        |

The two cases that earn a link are the two the structure genuinely cannot
express. A dependency between domains appears in no directory listing and in no
index line. And a behaviour's rationale is, by the existence condition for a
decision record, unrecoverable from the code — which is precisely why the record
was written, and why the behaviour must be able to point at it.

**Guidelines:**

- MUST apply the rule above before adding any cross-reference, and leave the
  link out when the answer is that structure already says it.
- MUST use a relative path from the linking document, so `docs/` stays
  correct when read from a checkout rather than a rendered site.
- MUST NOT link to a heading with a fragment. An agent reads whole files rather
  than navigating to anchors, so the fragment is never consumed, while it
  couples the link to heading text that a rewording silently breaks.

## Between Specs

A dependency is the condition, and it is narrower than a mention. Two domains
that merely use the same noun are related through the glossary, which is what
the glossary is for.

**Guidelines:**

- MUST link one spec to another only where the other domain's behaviour is a
  **precondition** for this one — the rule here cannot be stated or verified
  without it.
- MUST NOT link because a term appears in the prose; define the term in the
  glossary instead.
- SHOULD state the dependency in the sentence rather than leaving a bare link,
  so a reader learns what the other domain contributes without opening it.

## From a Spec to a Decision

This is the most durable reference in `docs/` and the one most worth having.
The target filename never changes, so the link does not break — and that
stability is what lets a check find the failure that matters: a link that
still resolves while the rationale behind it has been replaced.

**Guidelines:**

- MUST link the behaviour to the decision that constrains it wherever a reader
  would otherwise ask "why is it done this way?" and find no answer in the code.
- MUST repoint such a link when its target is superseded, as part of the change
  that supersedes it.

## Co-located Bodies

Once `docs/` also holds `conventions/` or `operations/` —
[the shape documentation-structure.md names](./documentation-structure.md) —
a link can point into either without changing the rule that decides whether
one belongs. The no-outbound-links rule in
[Out of a Decision](#out-of-a-decision) is unaffected: a decision record still
links nothing, whichever body would have received it.

| Reference                                                  | Does structure already encode it?                                                                 | Verdict                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `specs/` or `decisions/` → `conventions/` or `operations/` | —                                                                                                 | Governed by [The Rule](#the-rule) alone; this capability adds no dependency condition for a body it does not own |
| `conventions/` or `operations/` → `decisions/`             | No — a decision exists only when its rationale is unrecoverable from the code, same as for a spec | **Link**, under the same condition as [From a Spec to a Decision](#from-a-spec-to-a-decision)                    |

**Guidelines:**

- MUST apply the condition in
  [From a Spec to a Decision](#from-a-spec-to-a-decision) to a document under
  `conventions/` or `operations/` exactly as to a spec, when it cites the
  decision that constrains it.
- MUST NOT state a dependency condition for a link from `specs/` or
  `decisions/` into `conventions/` or `operations/`; [The Rule](#the-rule)
  alone decides it, and this capability owns no further condition for a body
  it does not own.

## Out of a Decision

A decision record carries no outbound links at all.

A record is append-only: it is superseded rather than rewritten, so that the
reasoning available at the time stays legible. A link out of one would create a
standing obligation to edit it — every time a spec is renamed, split, or
retired — which is exactly the editing the append-only rule exists to prevent.
Adding a supersede pointer is the single sanctioned change to an existing
record.

**Guidelines:**

- MUST NOT link from a decision record to a spec, to the index, or to another
  document; the reference runs from the behaviour to the decision, never back.
- MAY name a related decision in prose by its filename, which is stable, rather
  than as a link.
- MUST NOT edit an existing record's substance to reflect a later change; write
  a new record and mark the old one superseded.
