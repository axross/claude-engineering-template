# Plan Document Template

Apply this reference as the starting skeleton for a product requirement document — the structure a spec or tracking-issue plan follows. It is self-contained: copy the skeleton, fill each slot per the sibling references, and delete the annotations (the italic notes) before publishing. Required sections appear in every document; a conditional section is omitted only with a one-line stated reason, never silently.

**Guidelines:**

- MUST keep the section order and nesting exactly as the skeleton shows; the structure is canonical, not a suggestion.
- MUST fill every required slot, and either fill or explicitly omit-with-reason every conditional slot; do not leave a slot silently empty.
- MUST delete the italic annotations before the document is considered final.
- SHOULD right-size the whole document to the change: a small fix keeps every section to a line or two; a cross-cutting feature earns full detail. See [problem-and-scope.md › Right-Sizing Scope](./problem-and-scope.md#right-sizing-scope).

## Skeleton

Everything in `<…>` is a slot to fill, and everything in italics is an annotation to delete.

```markdown
## Summary

<One paragraph explaining the work and its goal, readable standalone — a reader who
stops here still understands what is being done and why.>
_(See problem-and-scope.md → Summary.)_

## Todo

- <An actionable deliverable or change surface, written as an ordinary bullet.>
- <Another thing to change or create, without file, function, algorithm, completed
  behavior, or verification detail.>
  _(Static after plan approval; not a progress checklist. See problem-and-scope.md →
  Todo.)_

## Background

<Concise circumstances as bullets; add a diagram when it clarifies the situation
better than prose.>
_(See problem-and-scope.md → Background.)_

### Assumptions

- <A belief the plan relies on that the reader might dispute. An unresolved blocking
  decision is asked, never silently assumed.>
  _(See problem-and-scope.md → Assumptions vs. Open Questions.)_

## Goals and Non-goals

- Ensure <an achievable outcome that explains the work's purpose>.
- Avoid <a plausible expansion that is deliberately excluded, without merely
  negating a goal>.
  _(One flat list without `Goal:` / `Non-goal:` labels or nested sections. A
  two-column table is allowed only for directly corresponding items. See
  problem-and-scope.md → Goals and Non-goals.)_

## Functional requirements

_(Conditional — include when the work changes or adds user-observable behavior; for
behavior-preserving work, omit with a stated reason, e.g. "omitted: refactor, public
behavior unchanged".)_

- <A user-perspective requirement phrased as "what should be", not "what to do".>
  _(See functional-requirements.md.)_

### UI design

_(Conditional — include only for view-affected changes; otherwise omit with a stated
reason. When a design-exploration step ran, this section carries the durable design
record: the options considered, the one chosen, and links to the design artifacts
(wireframe, hi-fi mockup, prototype), with an inline description or embedded image as
a fallback.)_

<Hierarchy, interaction states, accessibility and responsive intent, copy
constraints — in spec terms.>
_(See ui-design-framing.md.)_

### System design

_(Conditional — include for boundary-crossing or hard-to-reverse changes, or for
intricate minor-scoped mechanics where a diagram or snippet clarifies the mechanism;
otherwise omit with a stated reason.)_

<Key architecture/structure changes or the intricate mechanism, with a diagram or
clarifying code snippet.>
_(See system-design-framing.md.)_

#### Alternatives considered

_(Conditional — include when a plausible competing approach exists.)_

- <A realistic alternative that was seriously evaluated, and why it was rejected.>
  _(See system-design-framing.md → Alternatives Considered.)_

## Non-functional requirements

_(Conditional — include when technical, architectural, or security constraints
matter beyond functional behavior; otherwise omit with a stated reason.)_

- <A measurable target, not an adjective — e.g. "at most one additional query per
  render", not "fast".>
  _(See system-design-framing.md → Non-Functional Requirements.)_

## Acceptance criteria

- <One observable happy-path behavior a reviewer can verify from the diff or the
  running product without reading implementation code.>
- <One relevant edge/disabled/empty/error-state behavior.>
- <An explicit "X is unaffected" criterion stating the property that must survive,
  when this change sits next to something that must stay untouched.>
  _(Plain bullets, not `- [ ]` checkboxes. Every criterion traces to the sections
  above. See acceptance-criteria.md.)_

## Verification strategy

1. <An ordered, executable step showing the work is done — a command to run or an
   observable check to make.>
2. <The test coverage to add or update.>
3. <The verification gates the changed surface requires — format/lint, the relevant
   test suites, build — and why any is skipped.>
   _(For a bug: open with the steps to reproduce the defect, then the post-fix
   expectation. See verification-strategy.md.)_

## Open questions

- <An unresolved, non-blocking item — TBD is legitimate here — or a known risk with
  its mitigation. "None" is a valid entry.>
  _(See problem-and-scope.md → Assumptions vs. Open Questions and → Open Questions and
  Risks.)_
```
