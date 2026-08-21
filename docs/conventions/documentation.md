# Documentation

How this project's own documentation is kept true: where a fact goes, what a
change owes the documents it invalidated, and how a new document becomes
reachable at all.

The general practice is not restated here. The installed
[`living-project-documentation`](../../.claude/skills/living-project-documentation/SKILL.md)
capability owns the shape of `docs/`, the format each document takes, the
decision-record protocol, and the validators — load it before writing or
restructuring anything under `docs/`. What follows is only this project's own
answer within it, which is the part nothing outside this repository can know.

## A Document Is Corrected by the Change That Made It Wrong

A change that alters a behaviour, a convention, or a procedure MUST correct the
document describing it in the same change, never as follow-up work. Documentation
that is only ever written accumulates claims nobody re-checks, and a reader
cannot tell which of them still hold; the correction is what makes the rest of
the tree worth trusting.

The plan for such a change SHOULD name which document it will invalidate, so the
correction is scoped work rather than something remembered at review time.

## A New Document Earns Two Entries

Nothing surfaces a document automatically. A skill loads because its own
`description` matched what is being edited; a document is read only because
something told a session to read it. So adding a document under `docs/` MUST add
both of the following in the same change:

- a one-line entry in [`index.md`](../index.md) saying what the document covers,
  so a reader can decide not to open it;
- a row in [`AGENTS.md`](../../AGENTS.md)'s **Routing a Change** table naming the
  kind of change the document governs.

The index entry makes the document reachable to anyone reading `docs/`; the
routing row is what points a session at it without anyone having to remember the
document exists. A kind of change the table does not name has nothing pointing at
it, which is the standing cost of keeping conventions in documents rather than in
skills — and adding the row is how that cost is paid. Link from `AGENTS.md`;
never copy a document's content into it.

Renaming or removing a document MUST update both entries in that same change,
for the same reason.

## The Decision Log Is This Project's Own

`docs/decisions/` holds the decisions **this** project made, and it starts empty:
a record is written when a decision is taken here, never backfilled to explain a
constraint inherited from somewhere else. A decision is replaced by a new record
rather than by editing the old one — the superseded record stays readable exactly
as it was, because the reasoning it holds is what makes its replacement legible.

No document outside `docs/decisions/` may depend on a record existing. A
rationale a document actually needs MUST be stated in that document, not linked
out to a record that may never have been written. This is what keeps the rest of
`docs/` readable in a repository whose log is still empty, and it is why an
operational document states the costs it asks a reader to accept rather than
citing the decision that accepted them.

## Checking a Documentation Change

A documentation change is not finished until its checks pass. Run, from the
repository root:

```bash
node .claude/skills/agent-skill-authoring/scripts/check-links.mjs
for check in .claude/skills/living-project-documentation/scripts/check-*.mjs; do
  node "$check"
done
```

The first resolves every relative link in the tree, including the ones inside
`.claude/` that a `docs/`-only sweep would miss. The five `docs/` validators
check what a reader cannot see: a document `index.md` links from nowhere, a spec
with no matching glossary heading, a decision filename or `status` that does not
conform, and a document still citing replaced rationale. All of them exit 0 while
`docs/index.md` is absent, so they stay quiet until the tree exists.

They are deliberately separate commands, one per kind of change, so an author who
touched one document reads only its findings. What they cannot see stays a
reviewer's job: whether a fact sits in the one document that owns it, whether a
document says anything the tree does not already say, and whether a decision
record was owed at all.
