# System Design Section Framing

Apply this reference when drafting or reviewing the **System design** section of a spec — nested under Functional requirements, with **Alternatives considered** as its conditional subsection — and the top-level **Non-functional requirements** section. It covers data flow, module boundaries, intricate mechanics, alternatives, and constraints, described at the specification level, not the implementation itself. Sourced from design-doc and architecture-decision-record practice: [Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/), the [C4 model](https://c4model.com/), [arc42](https://arc42.org/overview/), [Michael Nygard's ADR format](https://github.com/architecture-decision-record/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md), the [Rust RFC template](https://github.com/rust-lang/rfcs/blob/master/0000-template.md), [AWS's ADR guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html), [GitLab's documentation ladder](https://docs.gitlab.com/charts/architecture/decision-making/), and [GitHub's native mermaid rendering](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/). The implementation mechanics for these same concerns — actual module placement, file layout, routing — stay with your project's own architecture and structure conventions; this reference owns only how to _describe_ system-design decisions in a spec.

## When to Include a System Design Section

Two distinct triggers warrant the section, and either alone suffices. The first is the classic architecture trigger: the change crosses a module, service, or team boundary, or is expensive to reverse — arc42 treats its sections as optional below that bar, and GitLab's documentation ladder escalates from commit message to design doc on the same axis. The second is the **mechanics trigger**: the change is minor in scope but its mechanism is intricate enough that a diagram or snippet clarifies it where prose cannot. Typical mechanics that earn the section regardless of architectural scope: fetch and cache invalidation, event-driven UI complexity, multi-threaded or concurrent logic, complicated shared-state propagation across components, authentication flows, atomic operations across multiple persistent stores, and non-trivial form-control logic. What stays out is the genuinely straightforward change — one whose diff explains itself.

**Guidelines:**

- MUST include a System design section when the change crosses a module, service, or team boundary or is expensive to reverse, **or** when its mechanism is intricate enough that a diagram or code snippet materially clarifies it (the mechanics catalog above is the trigger guide, not an exhaustive list).
- MUST omit the section, with a stated reason, for straightforward changes where neither trigger applies; MUST NOT pad it onto a change whose diff explains itself.
- SHOULD size the section to the change's appetite — an intricate but small mechanism earns a focused diagram and a paragraph, not an architecture tour; a new shared-state model or service boundary earns more.

## Data Flow, Mechanics, and Module Boundaries at Spec Level

A System design section answers "what talks to what, who owns which piece of state, and how does the tricky part actually work" — it does not pre-write the implementation. The C4 model stops most spec audiences at the context/container/component levels and starts with the broadest view, and arc42's building-block view offers the right unit of description: name each module or service, state its responsibility, and describe its interface at the level of what it accepts and returns. Diagrams that render natively in the target (a flowchart for data flow, a sequence diagram for event-driven mechanics or a handshake) are highly recommended. Code snippets are equally welcome when they clarify — a cache-key shape, a function or hook signature, a state-machine sketch — so long as they illustrate the mechanism rather than pre-write the finished implementation.

**Guidelines:**

- MUST describe data flow as named entities moving between processes and stores, and state which module or service owns each piece of shared state and how other modules may read or mutate it.
- SHOULD add a diagram or a clarifying code snippet whenever it communicates the structure or mechanism better than prose; SHOULD open with the high-level shape before component detail.
- MUST keep snippets illustrative — the shape of a key, a signature, a transition table — rather than pre-writing the implementation the coding phase will produce.
- MUST NOT prescribe file layout, routing, or module-placement mechanics that belong to the implementation.

## Alternatives Considered

**Alternatives considered** is the System design section's conditional subsection, included when a plausible competing approach exists. Mature spec-writing traditions treat the alternatives you rejected as being as valuable as the one you chose: the Rust RFC template devotes a dedicated "Rationale and alternatives" section to justifying the chosen design against the road not taken, and Michael Nygard's ADR format builds the same expectation into "Consequences" — a decision record is incomplete if it doesn't make clear what became harder. The practical reason is institutional memory: a record of a rejected alternative stops a future engineer from re-litigating a path already closed off.

**Guidelines:**

- MUST include the Alternatives considered subsection when a plausible competing approach exists, listing each realistic alternative that was seriously evaluated and why it was rejected; MUST omit it, with a stated reason, when no plausible competitor exists.
- SHOULD record a rejected alternative even when the current answer seems obvious, since the record's value is in preventing the same alternative from being re-proposed later.
- SHOULD reduce a comparison to the 2–4 criteria that actually drove the decision (cost, latency, blast radius, ownership) rather than an exhaustive feature matrix.

## Non-Functional Requirements

The document's top-level **Non-functional requirements** section carries the technical, architectural, and security requirements that matter beyond functional behavior — as short, measurable targets, not a rehearsal of the implementation that will satisfy them. AWS's ADR guidance treats performance, availability, and security requirements as consequences of a decision, not decisions in themselves, and standard NFR-writing practice replaces vague adjectives like "fast" or "scalable" with a stated number and scope, e.g., "95th percentile under 200ms". The section is conditional: a change with no meaningful non-functional surface omits it with a stated reason rather than inventing constraints.

**Guidelines:**

- MUST state non-functional requirements (performance, scale, security, reliability) as short, measurable targets, per [problem-and-scope.md › Concrete, Checkable Language](./problem-and-scope.md#concrete-checkable-language); MUST omit the section with a stated reason when the change has no meaningful non-functional surface.
- SHOULD scope each non-functional requirement to the specific component it constrains rather than declaring it for the whole system.
- SHOULD treat the section as a considered checklist — security, privacy, performance, failure behavior — answering only the ones the change genuinely touches.
- MUST NOT restate the implementation mechanism used to satisfy a constraint (e.g., "use Redis with a 5-minute TTL"); the constraint is the target, and the technique — if significant — belongs in Alternatives considered above.
