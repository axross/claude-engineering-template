# Conventions and Operations

Apply this reference when placing a new convention or operational procedure
under `docs/`, writing or reviewing one, or judging whether a `docs/`
directory that holds runbooks is an accident to leave alone or a tree to
build on. What is true of every document regardless of body —
[documentation-structure.md](./documentation-structure.md) — applies here
too; this reference states only what is true of `conventions/` and
`operations/` specifically.

## What Each Body Holds

| Body           | Holds                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| `conventions/` | The rules and habits a change must satisfy — what a reviewer cites          |
| `operations/`  | The procedures someone executes, and what to watch for while executing them |

`conventions/` and `operations/` are the two bodies
[What This Does Not Cover](../SKILL.md#what-this-does-not-cover) already
scopes out of this capability's own domain — repository-structure
conventions and contributor documentation, respectively. Adopting the shape
in [documentation-structure.md](./documentation-structure.md) gives each a
named home instead of leaving every project to invent one, without pulling
either under `specs/` or `decisions/`'s own rules: a document here earns no
spec, no glossary heading, and no decision record merely by sitting under
`docs/`.

The sibling placement itself —
[the shape documentation-structure.md names](./documentation-structure.md) —
is a shared rule, not restated here.

**Guidelines:**

- MUST NOT give a document under `conventions/` or `operations/` a spec, a
  glossary heading, or a decision record merely because it sits under
  `docs/`; those stay earned exactly as `specs/`, `glossary.md`, and
  `decisions/` already require.

## Proposing the Shape

Splitting a repository's documentation across `docs/` and a second tree buys a
reader nothing but a decision, at every write, about which tree a paragraph
belongs to.

**Guidelines:**

- SHOULD propose one `docs/` tree — this shape — as the default when
  [bootstrapping docs/](./bootstrapping.md) in a project with no established
  documentation convention.
- MUST detect and adopt an existing convention first, and MUST ask before
  relocating or restructuring anything that already exists, exactly as
  [Detect Before Proposing](./bootstrapping.md#detect-before-proposing)
  requires; the SHOULD above never overrides either.
- MUST NOT require an existing, separately-kept contributor-documentation tree
  to move under this shape; one `docs/` tree is the default for a project
  starting from nothing, not an obligation on a project that already chose
  otherwise.

## Where a Violation Appears

The two bodies are told apart by where a violation of what they state would
show up, not by the "code versus project" phrasing that fails on cases like
delivery or file placement.

A **convention**'s violation stays in the tree: the wrong thing is sitting in
a file, and a reviewer can point at the line. A directory-structure rule is a
convention for exactly this reason — a module promoted to `shared/` too
early, or a file in the wrong tier, is a diff a reviewer cites.

An **operation**'s violation exists only in an act: a step skipped, run out
of order, or run with the wrong flag, leaves no diff to point at. A
deployment procedure is an operation for exactly this reason: migrating after
the deploy instead of before produces no artefact to cite, only an outage
that already happened.

This test decides the cases a "code versus project" split cannot. A document
about how a change gets delivered — the loop it goes through, who reviews it
— is an operation, because following it wrongly leaves nothing to point at
in the tree. A document about where a file goes is a convention, because a
misplaced file is itself the evidence.

**Guidelines:**

- MUST place a document under `conventions/` when what it states, violated,
  leaves a diff a reviewer can cite, and under `operations/` when it leaves
  only an act with no artefact.
- MUST NOT decide the body by topic labels such as "code" versus "process"
  alone; apply the violation test above to the specific rule being written.

## The Format of a Document

Five rules, stated as what serves both readers this documentation has — a
contributor citing a rule, and an agent following a procedure — rather than
inherited unmodified from a `SKILL.md`'s own format. No document needs an
opening "read this when" applicability line beyond these five: `index.md`'s
one-line description of the document already carries that, so the line costs
a sentence with nothing left for it to say.

**Guidelines:**

- MUST state a rule once, next to the reasoning that justifies it, with no
  trailing block restating the prose above it. That two-part structure exists
  in a `SKILL.md` because a body is loaded wholesale and needs a citable
  bullet separate from its explanation; a document under `conventions/` or
  `operations/` is read whole, so the same structure produces two statements
  of one rule with nothing holding them together. The heading is the citable
  anchor.
- MUST make a rule's strength readable from its own sentence — binding,
  recommended, or permitted — never left for the reader to infer. Whether a
  project spells that with RFC 2119 keywords or with plain imperatives is the
  project's own choice, declared once in `index.md`'s opening prose (see
  [The Index](./documentation-structure.md#the-index)); either way, every
  sentence carries its own strength.
- MUST write one document per surface a change routes by, flat inside its
  body, named in kebab-case for that surface — the same reasoning that keeps
  `specs/` flat: `directory-structure.md`, not a file per package.
- MUST name a document for the field it already uses —
  `directory-structure.md`, not `repository-map.md`; `testing.md`, not
  `quality-gates.md`. A coined internal name is a name nobody searches for,
  and the cost lands on whoever is looking rather than on whoever named it —
  the same argument the glossary's closest-composing rule makes about terms,
  applied here to filenames.
- MUST state only the project's own answer, deferring the general practice
  to the capability that already owns it by name, wherever one exists. This
  is what keeps `conventions/testing.md` from growing into a second,
  divergent copy of a testing capability: it names the capability and states
  only what nothing outside this project could know — its own directory
  tiers, its own release order, its own on-call procedure.

## `decisions/` Beside All Four Bodies

`decisions/`'s existence condition —
[a decision constrains future work and its rationale is unrecoverable from
the code](./decision-records.md#when-a-record-exists) — never depended on
the constrained subject being the product. A decision about a convention or
a procedure meets the same test the same way: choosing to enqueue rather
than rate-limit is a product decision; choosing to keep two packages in one
repository rather than split them, or to deploy code before running a
migration rather than after, is exactly as constraining and exactly as
undocumented by the code that followed from it.

Such a decision is recorded in `decisions/`, under the same
`YYYY-MM-DD-<decision-in-kebab-case>.md` filename and the same supersede
protocol as a product decision — one log, not one per body, because the
question a reader brings to it ("why does this constrain us?") does not
change with the subject.

**Guidelines:**

- MUST record a decision about a convention or a procedure in `decisions/`,
  under the filename and supersede rules
  [decision-records.md](./decision-records.md) states in full, exactly as
  for a product decision.
- MUST NOT keep a second decision log under `conventions/` or `operations/`;
  `decisions/` is the one log every body links into.

## Upkeep for a Co-located Body

The upkeep obligation — correct what a change invalidated, in the same
change — has no reason to stop at `specs/` and `decisions/`. A change that
alters a convention or a procedure leaves `conventions/` or `operations/`
exactly as wrong as an uncorrected spec leaves the rest of `docs/`.

**Guidelines:**

- MUST correct the affected document under `conventions/` or `operations/`
  in the same change that alters the convention or the procedure it
  describes, never as follow-up work.
- SHOULD name, in the plan for such a change, which document under
  `conventions/` or `operations/` it will invalidate — the same scope signal
  [Naming the Damage in the Plan](./consulting-and-upkeep.md#naming-the-damage-in-the-plan)
  asks for a spec.

## Routing From an Instruction File

A host that reads an always-loaded instruction file — `AGENTS.md`,
`CLAUDE.md`, or similar — can route a contributor or an agent straight to the
document that answers a given kind of change, without waiting on skill
discovery to surface `index.md` first.

**Guidelines:**

- SHOULD name, in such an instruction file, the specific document under
  `conventions/` or `operations/` that governs each kind of change the
  project distinguishes, rather than pointing at `docs/` in general. This is
  a SHOULD and not a MUST: the instruction file is a project's own surface,
  outside what this capability can require, and a project without one loses
  nothing that `index.md` does not already carry.

## What the Validators See

The five validators were written for `specs/` and `decisions/`, and holding
`conventions/` and `operations/` under the same `docs/` changes nothing about
what any of them checks. Two of the five never read either body at all; the
rest walk all of `docs/` and already see whatever sits under either.

| Validator                      | Sees a document under `conventions/` or `operations/`?                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-index.mjs`              | Yes — it walks all of `docs/`, so a document left off `index.md` is reported like any unlisted spec                                            |
| `check-references.mjs`         | Yes — it is body-agnostic; a broken relative link fails wherever it is written                                                                 |
| `check-decision-supersede.mjs` | Yes — a document under either directory that still links a superseded decision is reported, the same as a stale spec reference                 |
| `check-glossary.mjs`           | No — it pairs `specs/` against `glossary.md` only; a heading with no matching spec, including one for development vocabulary, is already legal |
| `check-decision-naming.mjs`    | No — it reads only the `decisions/` directory listing                                                                                          |

**Guidelines:**

- MUST run `check-index.mjs`, `check-references.mjs`, and
  `check-decision-supersede.mjs` after a change to a document under
  `conventions/` or `operations/`, exactly as after a change to a spec.
- MUST NOT expect `check-glossary.mjs` or `check-decision-naming.mjs` to
  report anything about `conventions/` or `operations/`; neither reads those
  directories, and that is not a gap to file.
