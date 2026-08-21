# Consulting and Upkeep

Apply this reference when planning a change to a documented area, and when
correcting `docs/` in the change that invalidated it.

## Consulting Before a Plan

Reading `docs/` is cheap when it is done through the index and expensive when
it is done by opening everything. The index exists to make the second
unnecessary.

**Guidelines:**

- MUST read `index.md` first, and open only the documents whose one-line
  descriptions match the area the change touches.
- MUST follow a spec's dependency and decision links when the change alters
  behaviour that spec describes. A decision the change would violate is the
  single most expensive thing to discover after implementation.
- MUST stop after the index when nothing matches, and say so. A `docs/` tree
  that covers none of the change is a fact worth stating in the plan, not a
  reason to read it all.
- MUST NOT load `docs/` wholesale into context "for background". Almost all of
  it is irrelevant to any one change, and the cost is paid on every turn.

## Naming the Damage in the Plan

A plan for a change to a documented area names the documents that change will
invalidate. The list is cheap to write and it is what makes the upkeep visible
at the point a human reviews scope — rather than at the end, where it is the
first thing dropped under time pressure.

**Guidelines:**

- MUST name, in the plan, every document under `docs/` the change will
  invalidate, or state that it invalidates none.
- MUST treat that list as provisional. Implementation reveals invalidations the
  plan could not see; the list is a scope signal, not a contract.
- SHOULD name a decision the change would overturn as a decision to supersede,
  which is a scope question a human should answer before implementation, not
  after.

## What a Change Invalidates

| The change…                                               | Puts in question                                         |
| --------------------------------------------------------- | -------------------------------------------------------- |
| Alters an observable behaviour, rule, or state transition | That domain's `specs/<domain>.md`                        |
| Adds, renames, or retires a domain concept                | `glossary.md`, and the spec that owns it                 |
| Adds a whole area of behaviour                            | A new spec, its glossary heading, and an `index.md` line |
| Changes what the product is for, or its boundary          | The spec that bounds it, and the README                  |
| Overturns a constraint a record established               | A new decision record, and the old one's status          |
| Adds a dependency between domains                         | The depending spec's cross-reference                     |
| Renames or moves a document                               | Every inbound reference, and `index.md`                  |

This table stops at `specs/` and `decisions/`. A change that alters a
convention or a procedure invalidates its document under `conventions/` or
`operations/` the same way, once a project has adopted
[this shape](./conventions-and-operations.md#upkeep-for-a-co-located-body),
which states that obligation in full.

**Guidelines:**

- MUST correct what the change invalidated **in the same change**. Correcting
  it separately leaves `docs/` wrong for the interval between them, and the
  interval has a way of not ending.
- MUST leave a document alone when the change did not alter what it claims. An
  edit that only restyles prose costs review attention and adds no truth.
- SHOULD delete a spec whose behaviour was removed, along with its index line
  and glossary heading, rather than leaving it to describe something absent.

## Absorbing a Merged Plan

A plan and a spec describe the same product in different tenses. Absorbing one
into the other is a rewrite, never a copy.

**Guidelines:**

- MUST restate what is now true in the **present tense**, and drop the plan's
  motivation, alternatives, and acceptance criteria — the plan keeps those.
- MUST drop anything the change did not actually land. A plan is a statement of
  intent, and intent that did not survive implementation is not a fact about the
  product.
- MUST NOT link `docs/` back to the plan, the issue, or the change that
  produced it. Those are the history of how the product got here; `docs/` is
  what it is now, and the two decay on different schedules.
- SHOULD write a decision record for a trade-off the plan resolved whose
  rationale would otherwise be lost, applying the existence condition rather
  than recording every choice the plan made.

## After a Change to docs/

Two of the corrections above leave nothing visibly wrong behind: a renamed
document breaks references in files nobody opened, and a supersede leaves links
that still resolve. Both are caught mechanically. The two qualities that are not
checkable are checked by re-reading.

**Guidelines:**

- MUST run the bundled validators over `docs/` and fix what they report
  before calling the change done.
- MUST repoint every reference a rename or supersede left stale, in the same
  change; a resolving link to superseded rationale is invisible to everything
  except the check written for it.
- SHOULD re-read the changed document once as a reader who does not know the
  change, since the self-sufficiency of a glossary entry and the present tense of
  a spec are the two things nothing mechanical can check.
