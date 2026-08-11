---
name: product-requirement-document-authoring
description: Writing, refining, or reviewing a PRD, feature spec, plan document, RFC, design doc, or issue description — including the plan-writing or issue-drafting step of any delivery workflow. Triggers on "write a PRD", "draft a spec", "refine this issue", "structure this plan", "write acceptance criteria", "how do I verify this is done", "is this requirement testable". Not for writing the code, only the document that specifies it. A canonical tool-agnostic section structure and the craft behind each section.
user-invocable: false
---

# Product Requirement Document Authoring

Use this capability whenever you draft or review a product requirement document, feature spec, plan document, or issue description — the parts that describe **what** is needed and **how completion is verified**, not how it is built. It is general-purpose and self-contained: any requirement, spec, RFC, or plan benefits from it, regardless of the codebase, stack, or delivery workflow it feeds.

This skill owns one canonical document structure, in this order. **Required** sections appear in every document; **conditional** sections are included when their trigger applies and omitted only with a one-line stated reason, never dropped silently.

1. **Summary** _(required)_ — one standalone paragraph.
2. **Todo** _(required)_ — a static, actionable list of the deliverables or change surfaces.
3. **Background** _(required)_ — with an **Assumptions** subsection.
4. **Goals and Non-goals** _(required)_ — one section, standardly a flat list whose opening verbs distinguish intended outcomes from deliberate exclusions.
5. **Functional requirements** _(conditional)_ — with **UI design** _(conditional)_ and **System design** _(conditional, carrying **Alternatives considered** when a plausible competing approach exists)_ nested under it.
6. **Non-functional requirements** _(conditional)_.
7. **Acceptance criteria** _(required)_.
8. **Verification strategy** _(required)_.
9. **Open questions** _(required, may be "None")_.

This skill deliberately does not own everything a spec touches. It owns the document structure, problem framing, scope boundaries, requirement and criteria craft, and the spec-level framing of the UI design and System design sections — how to _describe_ what a change must do and how it is verified. It does not own the implementation mechanics behind those descriptions:

- **UI component structure, styling, and markup.** The spec states hierarchy, states, accessibility, and responsive intent; how the interface is built stays with your project's own UI and component conventions.
- **Data-flow implementation, routing, and module placement.** The spec states the system-design decision; how it is wired stays with your project's own architecture and structure conventions.
- **Test-writing mechanics (naming, structure, fixtures, locators).** The spec _names_ the coverage and verification steps that make it checkable; how the tests are written stays with your project's own testing conventions.

Keeping those mechanics out is what lets this document stay stable when the implementation approach changes, and keeps review focused on outcomes.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Summary, Todo, and Background Framing

See [problem-and-scope.md](./references/problem-and-scope.md) for:

- writing the standalone one-paragraph Summary
- listing the deliverables or change surfaces in a static Todo without duplicating requirements, acceptance criteria, or verification
- framing Background as concise bullets, with diagrams when they clarify the circumstances
- stating assumptions under Background and keeping them distinct from open questions
- combining goals and explicit non-goals in one flat, verb-led list
- writing the trailing Open questions section, including known risks with mitigation
- right-sizing the document to the size and reversibility of the change
- replacing vague quality adjectives with concrete, checkable statements

## Functional Requirements Craft

See [functional-requirements.md](./references/functional-requirements.md) for:

- writing user-perspective requirements as "what should be", not "what to do"
- ordering guide-level explanation before reference-level detail
- covering the primary flow and the relevant empty, error, and edge states
- deciding when the section applies and how to omit it with a stated reason

## UI Design Section Framing

See [ui-design-framing.md](./references/ui-design-framing.md) for:

- when a spec needs a UI design section at all (view-affected changes only) and at what fidelity
- describing hierarchy and layout intent in spec terms, not implementation
- enumerating interaction states (default, disabled, loading, error, empty)
- stating accessibility intent as testable, WCAG-referencing criteria
- stating responsive behavior intent and copy/microcopy constraints
- using the section as a durable design record that links out to any wireframes or mockups produced

## System Design Section Framing

See [system-design-framing.md](./references/system-design-framing.md) for:

- when a spec needs a System design section — boundary-crossing or hard-to-reverse changes, and intricate minor-scoped mechanics
- describing data flow and module boundaries at spec level, with diagrams and clarifying code snippets
- recording alternatives considered and why they were rejected
- stating non-functional requirements as measurable targets

## Acceptance Criteria Craft

See [acceptance-criteria.md](./references/acceptance-criteria.md) for:

- writing criteria a reviewer can verify independently, without reading implementation code
- preferring concrete, checkable phrasing over adjectives
- covering the happy path, edge/error/empty states, and explicit non-effects
- phrasing an unaffected criterion as the property that must survive, not a mechanical proxy standing in for it
- right-sizing the checklist and tracing every criterion back to the rest of the spec

## Verification Strategy Craft

See [verification-strategy.md](./references/verification-strategy.md) for:

- writing the ordered verification steps that show the work is done
- steps-to-reproduce for bug work, before and after the fix
- naming the verification gates your project's changed surface requires
- naming the test coverage to add or update

## Plan Document Template

See [template.md](./references/template.md) for:

- a self-contained, annotated Markdown skeleton of the full document structure
- what belongs in each slot, each conditional section's omit-rule, and the right-sizing note
