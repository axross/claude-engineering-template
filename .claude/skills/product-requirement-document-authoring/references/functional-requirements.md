# Functional Requirements Craft

Apply this reference when drafting or reviewing the **Functional requirements** section of a spec — the comprehensive, user-perspective requirement list that follows Goals and Non-goals. Sourced from RFC and product-spec practice: the [Rust RFC template](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) (guide-level before reference-level explanation), [SVPG's "Revisiting the Product Spec"](https://www.svpg.com/revisiting-the-product-spec/), [Intercom's job stories](https://www.intercom.com/blog/using-job-stories-design-features-ui-ux/), the [EARS requirement notation](https://alistairmavin.com/ears/), and [ISO/IEC/IEEE 29148](https://www.iso.org/standard/72089.html).

## When to Include the Section

Functional requirements exist to pin down user-observable behavior, so the section applies whenever the work changes or adds such behavior. It is also the **container** for the nested UI design and System design subsections, so it stays present whenever it must host one of them — even for behavior-preserving work whose intricate mechanics warrant a System design subsection. Only a change that alters no observable behavior _and_ warrants neither subsection — a refactor with a self-evident diff, a config move, a dependency bump — omits the section; padding it with restatements of unchanged behavior buries the spec's real content.

**Guidelines:**

- MUST include the section when the work changes or adds user-observable behavior, **or** when it warrants a nested UI design or System design subsection, so a warranted subsection always has its container.
- MUST omit the section — with a one-line stated reason — only when the change has no observable behavior delta **and** warrants neither subsection (e.g., "omitted: refactor, public behavior unchanged, no design subsection warranted").
- MUST, when the section is present only to host a subsection (no user-observable behavior change — e.g. a mechanics-only refactor that triggers a System design subsection per [system-design-framing.md](./system-design-framing.md)), state that absence in one line rather than inventing behavior to describe.
- MUST NOT restate existing unchanged behavior as requirements; state only what this work makes true.

## What Should Be, Not What To Do

A functional requirement describes the state of the world after the work — from the user's perspective — not the tasks that produce it. "A reader who reaches the end of an article sees up to three related articles" is a requirement; "add a RelatedArticles component to the article page" is an implementation step wearing a requirement's clothes. Declarative "what should be" phrasing keeps the requirement stable when the implementation approach changes, and keeps review focused on outcomes rather than plans.

**Guidelines:**

- MUST phrase each requirement as an observable "what should be" statement from the user's perspective, not a "what to do" task.
- MUST NOT name components, functions, files, or other implementation vehicles inside a functional requirement; those belong in System design or the implementation itself.
- MUST keep each requirement atomic and concretely checkable, per [problem-and-scope.md › Concrete, Checkable Language](./problem-and-scope.md#concrete-checkable-language).

## Guide-Level Before Reference-Level

The Rust RFC template splits explanation into guide-level (how a user experiences the feature, as if teaching it) and reference-level (the precise, formal detail), in that order — because a reader who first understands the experienced behavior can then absorb precision without getting lost. A spec's Functional requirements section benefits from the same ordering: lead with the requirements a user would recognize, then the precise edge-case and boundary rules.

**Guidelines:**

- SHOULD order the list guide-level first — the behaviors a user would describe — followed by reference-level precision (exact thresholds, orderings, tie-breaks, boundary rules).
- SHOULD write each requirement as the user would experience it before adding formal qualifiers.

## Coverage: Primary Flow and the States Around It

A requirements list that covers only the happy path leaves the riskiest behavior unspecified — SVPG's spec rule is that the description must be accurate for the full user experience, including what happens when things are empty, fail, or sit at a boundary. The matching acceptance criteria (see [acceptance-criteria.md](./acceptance-criteria.md)) can only be as complete as the requirements they trace to.

**Guidelines:**

- MUST cover the primary flow and the relevant empty, error, and edge states the work introduces or alters.
- SHOULD name the fallback behavior explicitly whenever a data-dependent feature can be data-less (e.g., "with no tag overlap, the three most recent other articles appear").
- SHOULD state exclusions that matter to correctness (e.g., "draft articles never appear") as their own requirements rather than leaving them implied.
