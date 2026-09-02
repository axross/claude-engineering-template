# Beneficiary Framing

Elaborates the rule [SKILL.md § Beneficiary Framing](../SKILL.md#beneficiary-framing) states directly, under this skill's own unconditional-scope carve-out: the reasoning behind it, the two exceptions worked through examples, and why raising abstraction does not lower concreteness. Apply this reference before invoking either exception, or when the reasoning behind the rule itself is in question. Todo, Functional requirements, UI design, System design, Non-functional requirements, and the template's own placeholders all draw the rule from that one statement rather than restating it here.

## Why Naming Implementation Details Subordinates the Document

A document that names implementation details has to be revised whenever the implementation shifts, which makes the document subordinate to the work it is supposed to judge — a spec should outlive the first draft of its own implementation, and a reviewer should be able to check the finished change against it without the spec having moved out from under them. Writing from the beneficiary's observation instead of the mechanism keeps the document stable across exactly the kind of change that happens routinely: a component gets renamed, a function gets split, a file gets moved.

## The Acceptance-Criterion Exception

Not every path or identifier is an implementation detail smuggled into the spec. Where a rule must live in a particular file — a lint config, a CI workflow, a fixed public entry point — or an exported name is itself part of the contract a caller depends on, that path or identifier **is** the observable outcome, not a stand-in for it. Naming it is correct in that case, because omitting it would understate the requirement rather than raise its abstraction level. What stays out of the exception is a path or identifier named only because that happens to be where today's implementation puts the beneficiary-observable outcome — the outcome is the requirement, and the file it currently lives in is not.

**Examples:**

> **Exception applies** — "The rule forbidding a relative import across package boundaries must live in `eslint.config.js`, since that is where the project's lint tooling reads rules from." The file is the acceptance criterion itself.

> **Exception does not apply** — "The related-articles logic lives in `RelatedArticles.tsx`." The file is only where today's implementation happens to sit; the requirement is what a reader sees, not the name of the component that renders it.

## The System Design Illustrative-Snippet Exception

A System design section is explicitly invited to show a cache-key shape, a function or hook signature, or a state-machine sketch when a diagram or snippet clarifies a mechanism prose cannot — see [system-design-framing.md](./system-design-framing.md). That invitation and the naming prohibition coexist because they answer different questions. The prohibition bars naming an implementation vehicle **as the requirement itself** — "add a `RelatedArticles` component" standing in for what a reader sees. An illustrative snippet names a shape **in service of** describing a mechanism the section has already earned the right to describe, without pre-writing the implementation the coding phase will produce.

**Examples:**

> **Exception applies** — `function cacheKey(userId: string, localeTag: string): string` shown to fix the shape of a cache key the section is discussing, with no claim that this is the function the implementation will ship.

> **Exception does not apply** — "Add a `getCachedArticle()` function to `lib/cache.ts` that wraps the existing Redis client." This names a real, buildable module and file rather than illustrating a shape; the naming prohibition reaches it.

A snippet that drifts from a shape into a real, buildable module or file name has stopped illustrating and started implementing, and the prohibition applies to it exactly as it would to prose.

## Raising Abstraction Without Losing Concreteness

An observable outcome is a **stronger** requirement than an implementation step, not a vaguer one: "the reader sees up to three related articles" is checkable against the running product in a way "add a `RelatedArticles` component" is not, since the latter is satisfied by any component under that name regardless of what it does. Writing at the beneficiary's altitude is a demand for more concrete, checkable outcomes, never license to soften a requirement into an adjective — pair it with the checkable-language rule in [problem-and-scope.md › Concrete, Checkable Language](./problem-and-scope.md#concrete-checkable-language) rather than trading one for the other.
