# Summary, Todo, and Background Framing

Apply this reference when drafting or reviewing the document sections that state what is needed and why — **Summary**, **Todo**, **Background** with its **Assumptions** subsection, **Goals and Non-goals**, and the trailing **Open questions** section — before any UI, system-design, or implementation detail. **Todo** has no counterpart in the sources below and is this skill's own addition; every other section is sourced from PRD-, RFC-, and requirements-writing practice: [Perforce's PRD guide](https://www.perforce.com/blog/alm/how-write-product-requirements-document-prd), [ProductPlan's problem-statement guide](https://www.productplan.com/learn/guide-to-writing-an-effective-problem-statement), [Intercom's "start with a problem statement"](https://www.intercom.com/blog/how-to-write-problem-statements/), [Product Talk on product outcomes](https://www.producttalk.org/product-outcomes/), [Google's design-docs practice](https://www.industrialempathy.com/posts/design-docs-at-google/), the [Rust RFC template](https://github.com/rust-lang/rfcs/blob/master/0000-template.md), the [RFC Style Guide (RFC 7322)](https://www.rfc-editor.org/rfc/rfc7322), and [GitHub's native mermaid rendering](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/).

## Summary

The Summary is the document's funnel mouth: RFC and design-doc practice converges on opening with a short overview a reader can stop after — Rust RFCs limit it to one paragraph, IETF's style guide requires an abstract that stands alone without the body, and Google design docs open with context a relative newcomer can absorb. A Summary earns its place when a reader who reads nothing else still knows what the work is and what goal it serves.

**Guidelines:**

- MUST open the document with a single-paragraph Summary explaining the work and its goal.
- MUST make the Summary readable standalone: no forward references to later sections, no undefined shorthand, no reliance on an external issue thread.
- MUST keep motivation depth and circumstance detail out of the Summary; they belong in Background.

## Todo

Todo is the reader's early map of the work: an actionable list of the deliverables or change surfaces needed to carry the Summary through. It answers "what will be changed or created?" without taking over the jobs of requirements (what must be true when finished), acceptance criteria (what observable outcomes prove completion), or verification strategy (how those outcomes will be checked). It is fixed when the plan is approved rather than maintained as an implementation-progress tracker.

**Guidelines:**

- MUST place Todo immediately after Summary and write its items as ordinary Markdown bullets, not task-list checkboxes.
- MUST describe each item at the deliverable or change-surface level, avoiding file, function, internal algorithm, or other implementation detail likely to change during delivery.
- MUST keep Todo distinct from Functional requirements, Acceptance criteria, and Verification strategy: do not repeat finished behavior or verification steps there.
- MUST treat Todo as a static part of the approved plan, not update its items to report implementation progress.

## Background

Background states the circumstances that make the work worth doing — neutrally, without embedding the chosen solution. Problem-first ordering is universal across RFC templates and PRD practice, and a brief that smuggles the solution into the problem statement forecloses design judgment that belongs later. Concise bullets beat prose paragraphs for scannability, and where the renderer supports diagrams (GitHub renders mermaid natively in issues and Markdown), a small diagram is often the clearest way to show a situation — a failing data flow, a tangled dependency, a before/after shape.

**Guidelines:**

- MUST state the circumstances and the problem before any solution, UI, or system-design detail, and keep "how" out of this section.
- SHOULD write Background as a concise bullet list rather than paragraphs.
- SHOULD add a diagram when it clarifies the circumstances better than prose — and skip it when it would only decorate.
- SHOULD ground the problem in the underlying need it serves rather than a literal feature request, so the requirement stays stable if the chosen solution changes.
- SHOULD link out to supporting research or prior discussion rather than inlining it.

## Goals and Non-goals

Goals make the work's purpose checkable: each names an achievable outcome the reader can hold the finished work against. Non-goals are deliberate exclusions of things that could reasonably have been included, not disclaimers or goals restated in the negative. Keeping both in one section puts the scope boundary in one place, without repetitive labels or nested sections.

The section has two forms, and each marks an item's role differently. The standard one is a single flat list, where the opening verb does that marking. A two-column table is the alternative, available only where the items pair up: there the column headers mark the roles, so the opening verbs are free to vary.

**Guidelines:**

- MUST write Goals and Non-goals as one top-level section, with no Goals or Non-goals subheadings or grouped sublists.
- MUST use one flat list as the section's standard form; the two-column table below is its only permitted alternative.
- MUST NOT prefix items with fixed labels such as `Goal:` or `Non-goal:`.
- MUST begin each goal in the flat list with an affirmative imperative verb such as "Do", "Ensure", or "Build" — framing it as a change in behavior or capability rather than only an artifact — and each non-goal with a negative or avoidance verb such as "Do not" or "Avoid", so every item's role is evident from its opening words.
- MUST phrase every non-goal, under either form, as a deliberate exclusion of something that could plausibly have been included, not as a goal merely negated.
- MAY use a two-column Goals and Non-goals table in place of the flat list, only when the items correspond directly and the table makes that comparison easier to read; its column headers then carry the role marking the opening verbs carry in the list, so the verb rule above does not apply to its cells.
- SHOULD route a later request that falls outside the stated non-goals through explicit scope evaluation rather than silently absorbing it into the current change.

## Assumptions vs. Open Questions

Assumptions and open questions are easy to conflate but serve different readers and live in different places. An assumption is a stated belief the plan relies on and would need to revisit if wrong — it sits early, under Background, where the reader forms their model of the work. An open question is an unresolved item; a _blocking_ one is asked before the plan is finalized, while a non-blocking one is recorded in the trailing Open questions section (see below).

**Guidelines:**

- MUST state assumptions and constraints the plan relies on in the Assumptions subsection under Background, distinct from open questions.
- MUST NOT embed an unresolved product, platform, privacy, compatibility, or scope decision silently as an assumption; surface it as an explicit question to the human instead, since a wrong silent assumption is more expensive to unwind than an asked question.
- SHOULD flag an assumption the reader is likely to disagree with rather than build around it unstated.

## Open Questions and Risks

The document ends with an Open questions section — the RFC tradition's "Unresolved questions", explicitly TBD-friendly so drafting is never blocked on having every answer. It is the document's historical margin: unresolved non-blocking items, and known hazards recorded as risks with their mitigation, kept where humans and AI agents can salvage them later. A known hazard is a risk, not a question — write it with its mitigation rather than as an open-ended unknown.

**Guidelines:**

- MUST end the document with an Open questions section; "None" is a valid entry and still worth stating.
- MUST record only non-blocking items here; a question that blocks confident planning is asked before the plan is finalized, never parked.
- SHOULD record a known hazard as a risk with its mitigation (e.g., "Risk: X may happen — mitigated by Y"), distinct from genuine unknowns.

## Right-Sizing Scope

Formality tracks risk and reversibility, not a fixed template. Cross-team, irreversible, or high-blast-radius changes warrant a fuller document with alternatives and non-goals; a small, easily reversible change warrants a short line per section. Shape Up's appetite-first approach — fixing the time or resource budget and shaping scope to fit it — is a disciplined way to right-size scope instead of letting an open-ended feature list dictate it.

**Guidelines:**

- MUST right-size each section to the change: a one-line copy fix needs a sentence per required section, not a multi-paragraph spec; a cross-cutting feature needs more.
- SHOULD add detail only as decisions stabilize rather than speculatively covering capabilities not yet needed.
- SHOULD scale formality to the change's risk and reversibility, not to a fixed section template.

## Concrete, Checkable Language

Vague quality adjectives are a measured defect, not a style nitpick: empirical requirements-smell research ties subjective terms like "user-friendly," "fast," "intuitive," or "seamless" directly to lower testability and higher downstream defect risk. Classic requirements guidance names the same failure mode as words to avoid without a measurable follow-up.

**Guidelines:**

- MUST replace vague quality adjectives ("user-friendly", "fast", "intuitive", "clean", "seamless") with concrete, checkable statements.
- MUST keep each requirement to one thing with only one reasonable interpretation (atomic: one requirement, one interpretation).
- MUST name the exact copy, threshold, attribute, or state transition expected instead of describing a quality in the abstract.
