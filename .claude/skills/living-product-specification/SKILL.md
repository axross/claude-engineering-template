---
name: living-product-specification
description: Updating a project's product documentation when a change alters what it says, and reading it before planning one — a behaviour, a domain term, or a decision that constrains future work; also placing or updating a project's conventions or operational procedures once they share one docs/ tree with that documentation. Triggers on "docs/", "spec", "domain model", "glossary", "ubiquitous language", "ADR", "supersede", "the docs are stale", "is this documented anywhere", "conventions/", "operations/". Not spec-driven development — a plan drives the change and this records what became true, so "spec-first" and "generate from the spec" route elsewhere. Covers the docs/ shape, its invariants, decision records, conventions and operations, and five single-purpose validators.
user-invocable: true
---

# Living Product Specification

Use this capability to keep a project's own description of its product — what it
is, the language its domain speaks, how it currently behaves, and the decisions
that constrain it — true as the code changes, and to read that description
before planning a change rather than discovering it afterwards.

The weight is on **upkeep**. Documentation that is only ever created is a
liability: it accumulates claims nobody re-checks, and a reader cannot tell
which of them still hold. What makes it worth keeping is a mechanism that
corrects it, tied to the change that invalidated it. That mechanism is the whole
subject here; creating documents is the small part.

Two claims this capability does **not** make. It does not promise to make an
agent better at its task — the evidence for context files improving task success
is weak, and the design below assumes a body is read only when a task needs it,
rather than loaded on every turn. And it does not drive development from a
specification: the plan drives the change, and what becomes true is recorded
here once it lands.

Everything below writes `docs/`, the conventional location for this material. A
project that already keeps it somewhere else substitutes its own path
everywhere `docs/` appears; nothing here depends on the name.

A worked instance of the shape below ships at
[docs-example/index.md](./assets/docs-example/index.md) — seven files across
two real domains, demonstrating every relational rule this skill states: the
spec-to-spec precondition link, the spec-to-decision link, a decision record's
absence of outbound links, and a convention deferring to a named capability.
Copy its structure rather than starting from a blank template.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## What This Does Not Cover

Two neighbouring bodies of documentation are always out of scope, because each
already has an owner and pulling either in is what turns `docs/` into a junk
drawer:

| Not this                                                            | Where it belongs                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| The plan for a change — what is about to be built                   | A product-requirement or plan-document capability, recorded with the change |
| How to write a clear sentence, and which document type to reach for | A technical-writing capability                                              |

The line against the plan is the one worth stating twice, because both
describe the product and only the tense differs: **a plan describes the diff, a
specification describes the steady state.** When a change merges, the part of
the plan that became true is absorbed here; the plan itself stays where it is,
as the record of a decision made at a point in time.

Two more bodies are out of scope for their **content** only, not their shape:
this capability neither writes a project's contributor documentation nor
invents its code conventions.

| Not this (its content)                                         | Where the content comes from                       |
| -------------------------------------------------------------- | -------------------------------------------------- |
| README, setup steps, how to run the tests, deployment runbooks | The project's contributor documentation            |
| What the code's layout and conventions are                     | The project's own repository-structure conventions |

A project that keeps either under `docs/` anyway — in `conventions/` or
`operations/`, beside `specs/` and `decisions/` — has this capability's own
rules for the **shape** that content takes, even though the content itself is
still decided elsewhere: see
[Conventions and Operations](#conventions-and-operations).

## The Three Modes

| Mode          | When                                     | What happens                                                                                                                                                                |
| ------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Consult**   | Before writing a plan                    | Read the index, open the one or two documents the task touches, follow their dependency and decision links, and name in the plan which documents the change will invalidate |
| **Upkeep**    | In the same change that alters behaviour | Correct what the change invalidated — restate facts, supersede decisions, add a spec for new behaviour, repoint stale references                                            |
| **Bootstrap** | A project with no `docs/` adopted yet    | Detect whatever convention already exists and follow it; propose the default shape only where there is none                                                                 |

**Guidelines:**

- MUST read `index.md` before proposing a plan for a change to a documented area, and name in that plan every document the change will invalidate.
- MUST correct what a change invalidated in the same change, never as follow-up work — a document corrected separately is wrong for the interval between the two, and the interval has a way of not ending.
- MUST NOT copy a plan's forward-looking text into a document verbatim; restate what is now true in the present tense, and drop what did not land.
- MUST run the validators this skill bundles over `docs/` whenever a change touches it, and fix what they report before calling the change done.
- SHOULD leave a document alone when a change did not alter what it claims; an edit that only restyles prose adds review surface and no truth.

## The Shape

`docs/` holds two files read across every body it has — `index.md` and
`glossary.md` — and up to four bodies beneath them: `specs/` and `decisions/`
are this capability's own; `conventions/` and `operations/` are the two
normative bodies described in
[Conventions and Operations](#conventions-and-operations). A rule stated in
[documentation-structure.md](./references/documentation-structure.md) is
**shared** — it holds for every document, whichever body it sits in. A rule
that names one body — present tense and the glossary pairing for `specs/`;
the filename and supersede protocol for `decisions/`; the format in
[Conventions and Operations](#conventions-and-operations) for `conventions/`
and `operations/` — is **body-specific**, and applies nowhere else.

See [documentation-structure.md](./references/documentation-structure.md) for:

- the shape every `docs/` tree takes, and what each of `index.md`, `glossary.md`, `specs/<domain>.md`, `decisions/`, `conventions/`, and `operations/` owns
- the shared invariants, including why a document exists only when it holds what no other document holds, and why `index.md` and `glossary.md` still earn their place under that rule
- the `index.md` layout — the opening prose naming each body, the per-body headings, and why only `index.md` is read unconditionally
- what a glossary entry holds, why a spec covers a domain rather than a model, and two rules no validator can enforce
- where a Mermaid diagram goes, and why there is no `diagrams/` directory

## Conventions and Operations

See [conventions-and-operations.md](./references/conventions-and-operations.md) for:

- what `conventions/` and `operations/` each hold, and the where-a-violation-appears test that decides between them
- the recommendation that makes one `docs/` tree the bootstrap default for a project with no established documentation convention, and why it never overrides an existing one
- the format a document under either follows — a rule stated once next to its reasoning, its strength readable from the sentence, one document per surface in kebab-case, named for the field it already uses, deferring the general practice to the capability that owns it
- why `decisions/` stands beside all four bodies rather than pairing only with `specs/`
- the same-change upkeep obligation for a convention or a procedure a change alters
- the SHOULD, not MUST, on routing a contributor or an agent to a specific document from an always-loaded instruction file
- which of the five validators see a document under either body and which do not

## Cross-References

See [cross-references.md](./references/cross-references.md) for:

- the single rule that decides every link: a reference exists only where it carries what the structure does not already encode
- the per-reference verdict table, including why the glossary links into nothing and the index links to `decisions/` once rather than per record
- the dependency condition that keeps `specs/` from becoming a link mesh
- why a decision record carries no outbound links, and what that protects

## Decision Records

See [decision-records.md](./references/decision-records.md) for:

- the existence condition — a decision constrains future work _and_ its rationale is unrecoverable from the code — and what it keeps out
- the `YYYY-MM-DD-<decision-in-kebab-case>.md` filename, why the date is the decision date and never changes, and why it beats sequential numbering under parallel branches
- the two-value `status` frontmatter and its `superseded_by` companion, and why `proposed` and `rejected` are absent
- the supersede protocol: a new record, never an edit to the old one's substance

## Consulting and Upkeep

See [consulting-and-upkeep.md](./references/consulting-and-upkeep.md) for:

- reading the index first and stopping there when nothing matches
- the invalidation table — which kind of code change puts which document in question
- absorbing a merged plan into the present tense without importing its speculation
- superseding rather than rewriting, and repointing what the supersede left stale

## Bootstrapping docs/

See [bootstrapping.md](./references/bootstrapping.md) for:

- detecting an existing convention before proposing one, and leaving an unrelated `docs/` directory alone
- the smallest `docs/` worth having, and the write order — a first spec's own boundary standing in for what a separate overview page once held
- seeding a glossary from the code's own vocabulary rather than inventing one
- what not to import — runbooks, setup steps, and anything a plan already owns

## Validators

See [validators.md](./references/validators.md) for:

- the five commands, the change each one answers for, and why there is no run-all script
- the two-level opt-in that keeps an unrelated `docs/` directory from turning red
- the boundary between "does this link resolve" and "is this file listed", so no defect is reported twice
- what these deliberately do not check, and why a spec/implementation mismatch is not among them
