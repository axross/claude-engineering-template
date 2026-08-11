# Audience and Document Type

Apply these rules in two modes. **Author:** settle the reader and the document type before the first sentence — they fix every decision downstream about voice, depth, structure, and what to omit, so choosing them after drafting is rework. **Review:** find the named reader and the scope statement, and treat their absence as a finding; a draft that serves two incompatible readers, or mixes document types without labels, needs restructuring before line edits are worth making.

## Identify the Reader First

Naming a concrete primary reader — their role, their seniority on the topic, and the question they arrived with — anchors every downstream choice about voice and depth. A document with no nameable primary reader is still a draft, not a document.

**Examples:**

> Familiar with TypeScript generics and Zod schemas

> A frontend engineer encountering this API for the first time, asking "how do I authenticate a request?"

**Guidelines:**

- MUST name the primary reader before drafting — role (frontend engineer, SRE, product manager), seniority on the topic (first encounter vs. experienced), and the question they arrived with.
- MUST NOT try to serve two readers with incompatible needs (e.g., a beginner tutorial and a reference appendix in the same body); split into two documents and link them.
- SHOULD list the prior knowledge, tools, and access the reader is assumed to have — by name, not by adjective ("familiar with TypeScript generics and Zod schemas", not "comfortable with TypeScript").
- MUST treat the document as self-contained — assume the reader has only the document, not the surrounding repository, working checkout, related drafts, or any other local file.
- MUST NOT include references to local or in-progress artifacts (`see ../foo.md`, `the PoC PR`, `the local drafts`, `our internal wiki page`); external references SHOULD point only to durable, broadly accessible sources (merged commits in public repositories, published docs, canonical specs).
- SHOULD anticipate the _next question_ a typical reader will ask after each section, and either answer it or link to where it is answered.
- MUST keep iterating on the audience until the reader is concrete — a document with no nameable primary reader is a draft, not a document.

## State Scope and Prerequisites Up Front

Open with a short statement that tells the reader what the document covers, what they need before starting, and what is deliberately left out. Silent omissions read as oversights, so name adjacent topics and link to where they are covered.

**Example:**

> If a feature isn't documented, it doesn't exist.

**Guidelines:**

- MUST open with a short scope statement covering: what the document covers, the prerequisites the reader needs, and what is explicitly out of scope.
- SHOULD name adjacent topics readers might expect to find in the out-of-scope list, with links to where those are covered — silent omissions read as oversights.
- SHOULD enumerate prerequisites as a checklist the reader can verify before starting (concrete versions, accounts, permissions), not a vague "some experience with X".
- MUST revise scope statements when the document's content drifts; a stale scope statement misroutes readers and erodes trust in the doc set.
- MUST either document an in-scope-but-unaddressed capability or narrow the scope so the omission is honest — "if a feature isn't documented, it doesn't exist".

## The Four Document Types

Every technical document is primarily _one_ of four types (per the [Divio documentation system](https://docs.divio.com/documentation-system/)): tutorial, how-to guide, reference, and explanation. Mixing types in one document is the single most common cause of unusable docs — readers seeking instructions encounter theory; readers seeking understanding encounter procedures.

- **Tutorial** — a learning-oriented walkthrough for a beginner. Promises that following along produces a working result. Optimizes for confidence and concrete progress.
- **How-to guide** — a goal-oriented recipe for a reader who already knows the basics and has a specific task. Lists the steps in order from a sensible starting state to the achieved goal.
- **Reference** — an information-oriented description of an API, schema, configuration, or interface. Optimizes for completeness, accuracy, and predictability of layout.
- **Explanation** — an understanding-oriented discussion of why a system is the way it is — design rationale, trade-offs, history.

**Guidelines:**

- SHOULD make every technical document primarily _one_ of the four types; mixing types in one document is the single most common cause of unusable docs.
- MUST NOT let a tutorial detour into edge-case explanation or reference tables.
- MUST NOT teach concepts the reader already has inside a how-to guide; link to explanations instead.
- MUST NOT put narrative, opinion, or step-by-step instruction in a reference.
- MUST NOT make an explanation instruct the reader how to do something or try to be a complete reference.

## Mapping to Software-Engineering Doc Forms

Common software-engineering artifacts map onto the four Divio types; knowing which type an artifact really is tells you how to structure it and what to push out to linked docs.

- **Design doc / RFC** — primarily _explanation_ (the why), with a _reference_-style spec section. Decision and rationale lead; the spec is an appendix, not the lede.
- **ADR (Architectural Decision Record)** — primarily _explanation_, narrowly scoped to one decision: context, decision, consequences. Keep the format tight; ADRs are scanned, not read.
- **Runbook / playbook** — _how-to_. Steps in order, copy-pasteable commands, decision points called out explicitly. Background and rationale belong in a linked explanation, not inline.
- **README** — usually a short _tutorial_ (quick start) plus pointers into the rest of the doc set. Keep it scoped to "what is this and how do I get started"; offload depth to dedicated docs.
- **API / SDK reference** — _reference_. Predictable layout, exhaustive coverage of the surface, no narrative. Pair with a separate _tutorial_ for first-time users.
- **Post-mortem** — primarily _explanation_ (what happened, why, and what changes as a result). The timeline is evidence for the analysis, not the point of the document.

**Guidelines:**

- MUST identify which Divio type an artifact primarily is before structuring it.
- SHOULD lead a design doc or RFC with decision and rationale and treat the spec as an appendix, not the lede.
- SHOULD keep an ADR tight and scannable, scoped to a single decision.
- SHOULD push a runbook's background and rationale into a linked explanation rather than inline.
- SHOULD pair an API / SDK reference with a separate tutorial for first-time users.

## When a Document Genuinely Spans Types

Some artifacts — READMEs and design docs especially — must carry more than one type. The default response is to split into linked documents; when that is impossible, label each section with its type so the reader knows how to read it.

**Example:**

```markdown
## Quick start (tutorial)

## API reference

## Why this design (explanation)
```

**Guidelines:**

- SHOULD prefer splitting into two linked documents over keeping mixed types in one body — the cost of a second file is far smaller than the cost of confused readers.
- MUST label each section with its type when a single artifact must contain multiple types (common for READMEs and design docs), so the reader knows how to read it.
- MUST restructure before publication any document that is "a bit of all four" with no labels; the cost of leaving it ambiguous compounds with every reader.
