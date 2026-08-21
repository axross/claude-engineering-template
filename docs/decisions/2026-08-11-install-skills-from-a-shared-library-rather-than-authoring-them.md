---
status: accepted
---

<!-- INIT: this record is this repository's own, decided before your project
existed. Delete every file under `docs/decisions/` during adaptation — your log
starts at your own first decision — and reword `docs/index.md`'s Decisions entry
so it stops linking a directory that is no longer there. -->

# Install skills from a shared library rather than authoring them here

This template carried fourteen hand-written skills under `.claude/skills/` —
82 files and 6,320 lines — covering skill authoring, product requirements,
development, review, testing, GitHub operation, maintainability, security,
performance, observability, and QA evidence, plus two workflow entry points,
`/address` and `/handoff`. Because they were authored here, every
project-specific value in them was a `{{...}}` token and every optional
capability carried an adaptation marker: 191 of the template's 314 tokens and
57 of its 86 markers lived inside the skills. Adapting the template therefore meant
walking long per-capability deletion lists — "no e2e framework → delete this
skill, this file, and these ten inbound links" — with a dangling cross-link the
routine failure.

Replaced them with seventeen skills installed from
[axross/skills](https://github.com/axross/skills) via the
[vercel-labs/skills](https://github.com/vercel-labs/skills) CLI, pinned by
`skills-lock.json`. The installed skills carry no tokens and no markers, so
adaptation became a choice of *which* skills to install rather than a surgical
edit of their contents. Three of the fourteen were dropped outright rather than
mapped: `/address` is superseded by `loop-engineering`, `/handoff` by nothing
(the loop consults a session-handoff capability only where a project ships
one), and `performance-and-reliability-requirements` by `code-review`'s
performance lens, which already owns those rules. Five capabilities the
template never had arrived with the set — most consequentially
`professional-behavior` and `living-product-specification`.

Two costs were accepted. Refreshing skills now needs Node and network access
for `npx skills`, which weakens the template's framework-agnostic claim; the
installed skills are plain Markdown, so this is a cost at install time and not
at run time. And the library is not ours: a rule that is wrong, outdated, or
silent on a case here cannot be fixed by editing the installed copy, because
the next install discards the edit while it poses as a rule the library agrees
with. [../operations/agent-skills.md](../operations/agent-skills.md) is the
answer to that — an upstream issue plus a local register entry.

Vendoring the library's files under our own ownership was rejected: it removes
the Node dependency but also removes drift detection, so upstream improvements
arrive only when someone remembers to copy them and divergence is invisible
until it bites. Installing at adaptation time rather than committing the
installed copies was rejected too: it would leave a freshly cloned template
with no skills at all, and make Node a hard prerequisite for using the template
rather than for refreshing it.

## Project conventions live in `docs/`, not in repository-local skills

The same change retired this template's instruction to author project-specific
skills — structure, components, routing, UI, domain — during adaptation.
Project conventions, operational procedures, and product behaviour now go under
`docs/`, in the shape `living-product-specification` defines.

What this costs is discovery. A skill loads because its frontmatter matched the
surface being edited, with nobody remembering to ask; a document loads because
an instruction file said to read it. That is why `AGENTS.md` carries a Routing
a Change table naming a specific document per kind of change, and why a kind of
change the table does not yet name has nothing pointing a session at it until
someone adds a row. The trade is accepted because `AGENTS.md` is injected into
every session unconditionally while skill discovery fires only conditionally —
but it holds only as long as that routing keeps naming documents rather than
decaying into a general pointer at `docs/`.
