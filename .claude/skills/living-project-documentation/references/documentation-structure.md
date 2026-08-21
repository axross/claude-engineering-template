# Documentation Structure

Apply this reference when creating a document under `docs/`, deciding which
document a fact belongs in, or judging whether an existing `docs/` tree is
shaped correctly. It states what is true of **every** document in the tree,
whichever of the four bodies holds it; what is true of `conventions/` and
`operations/` alone is in
[conventions-and-operations.md](./conventions-and-operations.md).

## The Shape

```text
docs/
  index.md                # the only entry point read unconditionally
  glossary.md              # the vocabulary, grouped by domain
  specs/<domain>.md        # how the product behaves now, one file per domain
  decisions/YYYY-MM-DD-<decision-in-kebab-case>.md
  conventions/<surface>.md # the rules and habits a change must satisfy
  operations/<surface>.md  # the procedures someone executes
```

| Document                   | Owns                                                                                                                                                                  | Does not own                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `index.md`                 | One line per document, naming what it covers, and which body answers which question                                                                                   | Any fact of its own                |
| `glossary.md`              | What each term means and how it relates to the others                                                                                                                 | Cardinality, invariants, lifecycle |
| `specs/<domain>.md`        | Triggers, rules, state transitions, error and edge behaviour, for one product domain                                                                                  | Vocabulary definitions; rationale  |
| `decisions/…`              | Why a constraint exists, and what was traded away                                                                                                                     | What currently is                  |
| `conventions/<surface>.md` | The rules and habits a change must satisfy — see [conventions-and-operations.md](./conventions-and-operations.md#what-each-body-holds)                                | —                                  |
| `operations/<surface>.md`  | The procedures someone executes, and what to watch for while running them — see [conventions-and-operations.md](./conventions-and-operations.md#what-each-body-holds) | —                                  |

`conventions/` and `operations/` sit beside `specs/` and `decisions/` as
siblings, never nested inside either, and — like every other document here —
are written only when there is something to put in them: a `docs/` tree with
only `specs/` and `decisions/` is exactly as valid as one with all four.

**Guidelines:**

- MUST keep `specs/` flat. A nested `specs/billing/invoices.md` has no single
  domain heading to pair with, and the pairing is what keeps vocabulary and
  behaviour findable from each other.
- MUST require no document but `index.md`. Every other file is written when
  there is something to put in it, so a `docs/` tree can be adopted
  incrementally rather than as a template to fill.
- MUST put a fact in exactly one document. When two could hold it, the more
  specific one wins and the other refers to it in prose.
- MUST write every spec in the **present tense**, describing what the product
  does — not what it will do, should do, or once did.
- MUST hold `conventions/` and `operations/`, wherever a project keeps either,
  as siblings of `specs/` and `decisions/` rather than nested inside one —
  the directory itself is what marks a fact's placement, not a judgment
  remade at every write.

## The Invariants

1. **A document exists because it holds what no other document holds.** A
   document assembled from what other documents already say costs a reader —
   and an agent's context — a second pass over facts it already has, and
   gives one fact two homes that drift.
2. **One fact lives in exactly one document.** Two copies diverge; the
   reader cannot tell which is current, and neither can a reviewer.
3. **What is not reachable from `index.md` does not exist** — every document
   except an individual decision record, which the log itself carries.
4. **A decision is superseded by a new record, never rewritten in place.**
   The old rationale is what makes the new one legible.
5. **The diff belongs to the plan; the steady state belongs here.**
6. **Only `index.md` is read unconditionally.** Every other document is
   fetched because a task touched it.

Invariant 6 is why the index carries one line per document and nothing else.
It is also why an individual decision record is not indexed: the log is
append-only, so a `docs/` tree that listed each record would grow the one
file that is always read, without bound, until reading it cost more than it
saved.

Invariant 1 is why only two documents sit above the four bodies rather than
three. `index.md` carries reachability, which is written nowhere else — the
one fact no other document holds. `glossary.md` carries meaning — what a term
means — where a spec, a convention, or a procedure carries behaviour; the
existing rule against stating cardinality, invariants, or lifecycle in the
glossary is what keeps that division real rather than nominal. A document
that only collects what its neighbours already say — a product's purpose and
audience the README already states, a boundary a spec already bounds, a
cross-domain map `index.md`'s own listing already is — fails invariant 1 and
is not written; what such a document would have held is rehomed to the
document that already owns it.

**Guidelines:**

- MUST link each document from `index.md` with a one-line statement of what
  it covers, so a reader can decide not to open it.
- MUST NOT index individual decision records; `index.md` links `decisions/`
  once, as a directory.
- MUST NOT create a document whose content is entirely restated from
  elsewhere in `docs/` or from the README — that is invariant 1, and no
  validator can see it violated.
- MUST NOT copy a document's content into an agent instruction file. It is
  pulled through `index.md` when a task needs it; embedding it makes every
  turn pay for text almost every turn ignores.

## The Index

`index.md` opens with prose naming which body answers which question — what
the product does, how the code is written, how the project is built and
run, whichever of those a `docs/` tree actually holds — and links
`glossary.md` from that same opening prose, since the vocabulary every body
uses belongs to no single one of them. After the opening, `index.md` lists
every document under one heading per body it holds, in this order:
`## Specifications`, `## Conventions`, `## Operations`, `## Decisions` —
present only for a body the tree actually has — with `decisions/` linked
once under its heading, as a directory, never one line per record.

Where a project spells rule strength with a keyword vocabulary — RFC 2119 or
its own plain imperatives — `index.md` is where that choice is declared,
because it is the one document every session reads regardless of what the
task touches.

**Guidelines:**

- MUST open `index.md` with prose naming which body answers which question,
  before the first document link.
- MUST link `glossary.md` from that opening prose rather than under a
  heading of its own.
- MUST list a document under the heading for the body it belongs to —
  `## Specifications`, `## Conventions`, `## Operations`, `## Decisions` —
  and MUST NOT add a heading for a body the tree does not hold.
- SHOULD declare, in `index.md`'s own prose, whichever rule-strength
  vocabulary the project's documents under `conventions/` and `operations/`
  use, once, rather than leaving it to be inferred document by document.

## The Glossary

An entry defines the term and states, in one sentence, how it stands to the
others. Detail lives in the spec that owns the behaviour.

```markdown
## Scheduling

**Job Template** — the reusable definition a **Job** is created from. It
holds the work to be run and, optionally, the schedule that creates
**Jobs** from it without anyone asking.

**Job** — one execution of a **Job Template**, created when the template's
schedule fires or when someone runs the template by hand.
```

Headings are domains, named for the spec that details them: the
`## Scheduling` heading above pairs with `specs/scheduling.md`. That pairing
is what makes the glossary navigable without a single link — the section a
term sits in already says which spec owns it.

**A spec covers a domain, not a model.** A domain is a coherent area of
product behaviour, and it normally rests on several models or entities —
scheduling alone rests on five: Job Template, Schedule, Job, Attempt, and Job
output. The spec covers the whole domain, and the glossary heading paired
with it holds every one of that domain's terms, not one heading per entity.
Splitting per entity produces a `specs/` directory shaped like a schema,
where each file states a fragment of behaviour no reader can act on without
opening its siblings — a `## Job Templates` heading pairing with
`specs/job-templates.md` alone, holding nothing about the **Job** it
schedules, is the shape this rule rules out.

**A term costs the reader whatever it takes to reach the right meaning, and
the words it is made of set that cost.** A glossary is not read front to
back; it is read by someone meeting a term in a sentence who decides, in
that moment, whether they already know it. Where a candidate's words compose
to the definition exactly, that decision costs nothing. A reader meeting
`Template` knows the English word and moves on with the wrong meaning; one
meeting **Job Template**, as the example above has it, already knows what it
holds before reaching the entry.

Where nothing composes exactly, the remaining candidates are not equally
priced. One that visibly does not compose costs a lookup: paid once, and
knowingly. One that composes to something _nearly_ right costs more, and
invisibly, because the reader never stops, and every sentence built on the
term inherits the meaning they brought to it. Naming the stretch between a
**Job** stopping and its record being written, `Job window` sends the reader
to the entry: they can see it names some span and not which one. `Job end`
sends them nowhere, because it composes to the moment the job stopped —
where the stretch begins, not what it is. So the visibly incomplete term
costs less than the plausibly wrong one, and a bare word whose ordinary
meaning is wider, narrower, or merely adjacent to what the entry says is
plausibly wrong by construction.

A qualifier earns its place only when the compound composes to the thing
itself. Say scheduling needs a term for what one **Job** produced, kept
after the job itself is gone: **Job output** composes to exactly that, and
three near-misses each miss along one axis.

| Candidate        | Composes to                  | Axis it misses                                                               |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `Output record`  | a record of some output      | **which** — the qualifier says what kind of record, never whose output it is |
| `Failure output` | what the failures produced   | **how much** — narrower than the thing, which covers successful **Jobs** too |
| `Completed job`  | the execution, once finished | **what kind** — the execution itself, where the thing is what it left behind |

One case sits outside all of this: seeding a glossary from the code and from
a team's own usage, which the Seeding the Glossary section of
[bootstrapping.md](./bootstrapping.md#seeding-the-glossary) governs in full.
The closest-composing guideline below governs the rename that may follow the
capture, not the capture itself.

Once a `docs/` tree also holds `conventions/` or `operations/`, `glossary.md`
may carry a second half for development vocabulary — the words a
contributor needs rather than a reader of the product — under its own
top-level `# Development vocabulary` heading, with `# Product vocabulary`
naming the first. The split sits at the `#` level rather than `##`, because
`##` is the level `check-glossary.mjs` pairs against `specs/`; a `##`
heading in either half still pairs the same way, so a
`## Directory Structure` heading under the second half costs nothing at the
level the checker reads.

**Guidelines:**

- MUST group the glossary by domain, with each heading named for a spec —
  or, for vocabulary no single domain owns, named for the concept it
  collects.
- MUST cover a domain, not a model: a heading holds every entity its domain
  rests on, never one heading per entity.
- MUST keep an entry **self-sufficient**: after reading it, a reader knows
  what the term means and where it sits without opening anything else. An
  entry that only redirects has stopped paying for itself, and no check can
  see that.
- MUST choose the term whose words' ordinary meaning composes closest to
  what the entry says, wherever a term is being chosen rather than seeded
  from the code or the team's own usage — so a bare word already meaning
  exactly that stays bare, and one meaning something wider, narrower, or
  adjacent takes the qualifier that closes the gap; where no candidate
  composes exactly, prefer the term a reader can see they do not know to one
  they will mistake for a word they do, and no check can see this either.
- MUST mark a defined term where it appears in another entry — bold is
  enough — rather than linking to it. The file is small by construction, so
  an in-file anchor buys navigation nobody needed.
- MUST NOT state cardinality, invariants, or lifecycle in the glossary;
  those are behaviour, and behaviour lives in the spec.
- MUST split `glossary.md` at the `#` level, into `# Product vocabulary` and
  `# Development vocabulary`, once it carries both; never split at `##`,
  which is the level the spec pairing runs on.
- SHOULD name each development-vocabulary heading for the document that owns
  it, exactly as a product domain heading is named for its spec.
- SHOULD add a term the moment a spec uses a word whose meaning a newcomer
  would have to infer.

## Diagrams

A diagram separated from the text it describes rots independently of it, so
placement follows ownership rather than medium.

**Guidelines:**

- MUST place a diagram inline in the document that owns what it depicts: a
  within-domain structure diagram in that domain's spec, a cross-domain
  diagram in the spec whose domain the map is centred on — never in
  `index.md`, which every session reads, and never in a document written
  only to hold it, which invariant 1 rules out.
- MUST NOT create a `diagrams/` directory, or any other home that separates
  a diagram from its prose.
- SHOULD write diagrams as Mermaid in a fenced block, so a change to one
  shows up as a readable diff rather than a replaced binary.
- SHOULD leave the glossary without diagrams; an entry that needs one is
  carrying structure that belongs in a spec.
