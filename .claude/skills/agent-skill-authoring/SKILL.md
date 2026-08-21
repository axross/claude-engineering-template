---
name: agent-skill-authoring
description: Creating, refining, splitting, consolidating, renaming, or auditing an agent skill — the authoring rules for the agentskills.io format, and the validators that enforce them. Triggers on drafting a `SKILL.md`, editing frontmatter, tightening a `description`, deciding where a new rule belongs, "add a skill", "split this skill", "audit skills", "recast this skill as a capability", and any change to a `SKILL.md` or its `references/`. Covers capability framing, discovery metadata that survives a host's listing truncation, section anatomy, progressive disclosure, cross-references, and three bundled validators, one per kind of edit.
user-invocable: false
---

# Agent Skill Authoring

Use this capability whenever you create, refine, split, consolidate, rename, or audit an agent skill under the host project's skill root. It is what turns a durable convention into a well-formed, discoverable skill and keeps the skill tree coherent as it grows.

Skills authored here follow the agentskills.io format. For the host project's active skill inventory and topic-to-skill routing, defer to each skill's own `description` discovery metadata and the directory listing under the skill root; where a host also maintains a written index (e.g. `AGENTS.md`), keep it in sync too.

**Guidelines:**

- MUST run the bundled validator that owns what a change touched — `scripts/check-skill-frontmatter.mjs` after editing frontmatter, `scripts/check-skill-body.mjs` after editing prose, `scripts/check-skill-references.mjs` after adding, moving, or renaming a reference file — and all three when unsure; together they are the enforcement path for the frontmatter, naming, discovery length-cap, and reference-linkage rules this skill states nowhere else (see [audit-checklist.md](./references/audit-checklist.md)).
- SHOULD propose or implement a skill update when any task exposes a reusable convention, outdated guidance, a recurring review issue, or a missing project rule — skill maintenance happens when work reveals durable learning, not after every narrow fix.
- SHOULD skip skill maintenance when the work produced no generalizable learning, and state that it was skipped.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Scoping and MECE

See [scoping-and-mece.md](./references/scoping-and-mece.md) for:

- choosing a coherent skill boundary, skill name, split, consolidation, or source-of-truth location
- checking overlap with neighboring skills before adding new guidance
- classifying every section as mechanism or judgment when a vendor- or runner-specific skill sits beneath a tool-agnostic owner
- using section length and topic growth as signals for restructuring

## Capability Framing

See [capability-framing.md](./references/capability-framing.md) for:

- framing a skill as an ability the agent gains rather than a document it reads
- naming the activity a skill enables, and the document-style suffixes to avoid
- the voice of the `description` opening clause, the H1, and the opening paragraph
- recasting an existing guideline-style skill in a fixed order, without changing what it requires

## Frontmatter and Naming

See [frontmatter-and-naming.md](./references/frontmatter-and-naming.md) for:

- creating or editing discovery-critical `SKILL.md` frontmatter
- setting the invocation-control fields (`argument-hint`, `arguments`, `user-invocable`, `disable-model-invocation`) by skill archetype — guideline skill vs workflow entry point
- choosing the skill directory name and keeping it aligned with the `name` field
- porting or preserving host-project harness fields

## Description Writing

See [description-writing.md](./references/description-writing.md) for:

- drafting, trimming, or auditing the `description` field against its byte cap
- the four-slot contract — trigger, identity, boundary, coverage — and why only the last may be sacrificed to a host's listing truncation
- fusing the trigger and the identity into one opening clause, and the two half-clauses that fail on their own: a bare token list, and "The ability to …"
- stating the surfaces a skill refuses to serve, alongside the hand-offs that route a competing skill away
- adding likely user phrasings and symptom-based triggers without over-broadening the skill
- the ~640-byte corpus mean the target names, and why it is a centre of gravity rather than a per-skill ceiling

## Body Content Style

See [body-content-style.md](./references/body-content-style.md) for:

- writing or revising substantive skill-body or reference-file sections
- balancing concise topic explanation, examples, and guideline bullets
- citing the upstream documentation URL in a section that pins a version or mirrors a vendor's option surface
- placing normative RFC-2119 requirement bullets in detailed reference content rather than parent routing sections

## Progressive Disclosure

A rule is **load-bearing** when an agent that loads `SKILL.md` and opens no reference would produce wrong output for want of it — held before the work starts, not looked up once the reader already knows the question exists. That test still sorts a skill's material, but its consequence is a conditional read obligation rather than a relocation: a load-bearing rule's own statement stays in its reference, and `SKILL.md` carries an RFC-2119 obligation to read that reference before the work its rule governs. A reference nobody is told to read never gets read; a `SKILL.md` that states every rule directly cannot be tree-shaken by the sessions that will never touch most of them. This test is itself load-bearing for a skill's author, so it is stated here as a rule rather than left behind the pointer below.

See [progressive-disclosure.md](./references/progressive-disclosure.md) for:

- deciding when a skill should stay single-file or split into `references/`
- the load-bearing test's full sorting table, and how it decides whether a reference earns a conditional read obligation
- the size thresholds that signal a skill or reference file has grown too large
- using the parent routing-section format: `## Topic`, `See [file.md](./references/file.md) for:`, descriptive situation bullets, then a `**Guidelines:**` block carrying the read obligation
- wording a read obligation's triggering condition narrowly enough to be skippable
- stating the fact a routing bullet points at — the flag, limit, or rule by name — instead of announcing that one exists
- keeping parent routing bullets free of RFC-2119-style requirement keywords so they remain routing cues, not duplicated rules
- the one case where a rule's own statement stays in `SKILL.md` instead of moving to its reference

**Guidelines:**

- MUST treat a rule as load-bearing when an agent that loads `SKILL.md` alone would produce wrong output for want of it — a fixed order, a closed set, or a constraint whose violation is not self-evident from the output — and as elaboration otherwise.
- MUST place a load-bearing rule's own statement, its RFC-2119 bullets, and everything that elaborates it in the reference file that governs it, not in `SKILL.md`.
- MUST give `SKILL.md` a `**Guidelines:**` block, placed after a reference's routing list, carrying one RFC-2119 bullet per reference that names the reference and states the condition — narrow enough to be skippable — under which it MUST be read.
- MUST NOT restate a load-bearing rule's statement or its RFC-2119 bullets in `SKILL.md` once its reference states them, except under the carve-out below.
- MUST keep a rule's own statement in `SKILL.md`, never moved to a reference, when the rule's triggering condition is unconditional within its own skill's scope — a pointer that would fire on every turn costs a read and shakes nothing.

## Cross-Referencing and Discovery

See [cross-referencing.md](./references/cross-referencing.md) for:

- adding, renaming, moving, deleting, or linking skills and reference files
- choosing one source of truth instead of copying detailed rules across skills
- using topic-based cross-skill references, verifying intra-skill relative links, and keeping skill discovery current (plus any written index a host maintains)

## Project Skill Archetypes

See [project-skill-archetypes.md](./references/project-skill-archetypes.md) for:

- creating the project-specific skills a scaffolding pass calls for: structure, component, and UI/design
- the three-way ownership triangle and each archetype's skeleton, topics checklist, or table patterns
- growing archetype skeletons with worked examples and mechanical boundary checks

## Auditing and Validation

See [audit-checklist.md](./references/audit-checklist.md) for:

- auditing multiple skills or reporting skill-tree quality
- running the three bundled structure validators — `check-skill-frontmatter.mjs`, `check-skill-body.mjs`, and `check-skill-references.mjs` — and which kind of edit each one answers for
- running the bundled link-freshness audit (`scripts/link-freshness/check.mjs`) on a schedule to catch a cited vendor URL that has gone 404, why only a confirmed-dead link fails it, and why a `pull_request` trigger on it is a request-forgery primitive
- checking inventory, skill discovery, section anatomy, RFC-2119 bullets, topic-based cross-skill references, and relative links
- identifying overlap, stale assumptions, orphan references, and missing source-of-truth links
