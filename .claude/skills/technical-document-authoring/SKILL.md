---
name: technical-document-authoring
description: Drafting, structuring, editing, or reviewing a technical document — a design doc, RFC, ADR, runbook, README, API reference, changelog, or post-mortem. Triggers on "make this clearer", "how should I structure this", "is this readable", "too wordy", "passive voice", "hard to follow", "tighten this prose". While authoring, each rule is a practice to uphold; while reviewing, a finding to raise against the draft. Covers naming the reader, the four Divio document types, leading with the answer, sentence-level style, choosing between prose and tables, and a plain-English vocabulary ceiling. Self-contained.
user-invocable: false
---

# Technical Document Authoring

Use this capability whenever you write or review a technical document in the software or web engineering domain — a design doc, an RFC, an ADR, a runbook, a README, or an API reference. It runs in two modes over the same set of rules:

- **Author** — draft and restructure the document so its reader reaches the answer without rereading. Choose the shape that is clear by construction — the reader named before the first sentence, one document type, the takeaway at the top — rather than the shape you patch on a later pass.
- **Review** — read a draft for what it will cost its reader, and raise each problem as a finding against a specific passage. Hold the line the same way in both modes; the standard does not soften because you wrote the draft yourself.

Scope is the writing craft of documents whose readers are a team — engineers, reviewers, operators, and whoever inherits the system. The audience assumptions, vocabulary, and example forms (code blocks, terminal sessions, API shapes) reflect that. Out of scope: published and personal writing such as blog posts, talks, and newsletters; marketing copy; fiction; academic papers outside software; and end-user documentation for non-software products.

This capability is the owner of plain-English and vocabulary-level discipline for documents (see [voice-tone-and-maintenance.md](./references/voice-tone-and-maintenance.md)). Where a neighbouring capability owns a rule instead, this one names it by topic rather than restating its wording. Those deferrals are **conditional** — skip one cleanly on a project that ships no such capability, and apply the rules here in its place:

- A **product-requirement or specification** capability owns a spec's section skeleton, requirement phrasing, and acceptance criteria. This capability owns the sentences inside whatever structure that one prescribes.
- An **agent-skill authoring** capability owns the prose inside a skill definition and its reference files, adding skill-format rules on top of these.
- A **conversational-reporting** capability owns the chat turn, the progress note, and the completion summary — the reply, not the document.
- A **UI or visual-design** capability owns the accessibility of an interface. This capability owns the accessibility of a document.

**Guidelines:**

- MUST defer a rule to its owning capability by topic where the project ships one, summarizing rather than duplicating that capability's wording.
- MUST treat a deferral gated on a capability the project does not ship as inapplicable — not a violation — and apply this capability's own rules in its place.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Audience and Document Type

See [audience-and-document-types.md](./references/audience-and-document-types.md) for:

- Identifying the primary reader and their prior knowledge before drafting
- Treating the document as self-contained — no references to local files, in-progress artifacts, or restricted-access resources
- Stating scope, prerequisites, and explicit out-of-scope items up front
- Picking one of the four document types (tutorial, how-to, reference, explanation) and not mixing them
- Mapping common software-engineering doc forms (RFC, ADR, runbook, README, API reference) to the four types
- The "if it isn't documented, it doesn't exist" rule and what it implies for completeness

## Structure and Flow

See [structure-and-flow.md](./references/structure-and-flow.md) for:

- Leading with the answer / TL;DR / decision before the supporting detail
- Motivating change in strategy and direction docs — answering "why now", naming stakes, framing proposals as candidates
- Task-based, sentence-case headings that use the reader's vocabulary
- Heading hierarchy rules — no skipped levels, no stacked headings without intro text
- Skimmability — descriptive headings, key concept first in the paragraph, short paragraphs
- Progressive disclosure within a document — concept near instruction, simple before complex
- Descriptive link text and stable anchors for addressability

## Sentence and Word Craft

See [sentence-and-word-craft.md](./references/sentence-and-word-craft.md) for:

- Active voice, second person ("you"), present tense as the default
- One idea per sentence and how to break long sentences
- Replacing weak verbs (`be`, `have`, `make`) and cutting filler phrases
- Avoiding colon-lead-in paragraph labels (`The principle:`, `The rule:`) except when introducing a diagram, code block, list, or table
- Defining new terms once and using the same term consistently — no synonym variation
- Acronym discipline (spell out on first use; only abbreviate when significantly shorter and reused)
- Eliminating ambiguous pronouns (`it`, `this`, `that`, `they`) by repeating the noun or placing it near the referent

## Lists, Tables, and Code Examples

See [lists-tables-and-code.md](./references/lists-tables-and-code.md) for:

- When to use bulleted lists, numbered lists, tables, or running prose
- Parallel grammar, capitalization, and punctuation across list items
- Numbered procedure steps starting with an imperative verb
- Introducing lists and tables with a colon-ending lead-in sentence
- Code example rules — minimal, runnable, realistic, with surrounding context
- Inline code formatting, UI-element formatting, and figure / table captions
- Authoring diagrams in [Mermaid](https://mermaid.ai/open-source/intro/) — picking the right diagram type, embedding in ` ```mermaid ` fenced blocks, and pairing with captions and prose summaries

## Voice, Tone, and Maintenance

See [voice-tone-and-maintenance.md](./references/voice-tone-and-maintenance.md) for:

- Conversational-but-professional voice; not blaming the reader
- Inclusive language and gender-neutral phrasing
- Globalization — avoiding idioms, sports / cultural metaphors, ambiguous date formats
- Keeping working vocabulary at CEFR C1 (with a level-graded replacement table covering above-C2, C2, and C1 offenders) so non-native readers can read without a dictionary
- Accessibility — alt text, descriptive link text, not relying on color alone
- Maintenance — currency over completeness, ARID (accept some repetition), single source of truth
- Self-editing — multiple drafts, read aloud, take a break before review, cut on the second pass
