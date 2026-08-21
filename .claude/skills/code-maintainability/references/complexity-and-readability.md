# Complexity and Readability

Apply this reference to keep changed code straightforward to read and within the project's enforced complexity budget — while writing it, and while reviewing it.

## Complexity Budget

A codebase's linter usually enforces complexity, length, and (in a statically-typed language) typing budgets. Those thresholds are project configuration, not constants to memorize — read the project's actual linter config rather than assuming a number. A function that breaches a configured threshold is a blocking concern, because the lint gate fails on it; a length breach that only warns is still a signal the function should be split.

**Guidelines:**

- MUST keep a changed function within the project's configured complexity and length thresholds; a function that breaches them and would fail (or warn in) the lint gate is the finding — never silence the linter to slip it through.
- SHOULD split a function whose length breaches the configured budget even when the linter only warns, rather than leaving one oversized function.
- MUST keep an untyped escape hatch (e.g., `any` in a statically-typed language) out of changed code where the project's linter or typing convention forbids it; this is conditional on the project defining such a rule.

## Magic Values

A bare literal forces every later reader to reverse-engineer what it means, and scatters a value that should have one authoritative definition.

**Guidelines:**

- MUST pair a magic number or string with a design token, a named constant, or — only when genuinely justified — the linter's inline-suppression directive plus a comment explaining the meaning. An unexplained literal is the finding.
- MUST NOT treat a value expressed through the project's approved named tokens as magic (e.g., a caching-duration helper that takes `"hours"` / `"days"`).
- SHOULD source a hard-coded URL or origin (e.g., `"https://example.com"`, `"http://localhost:3000"`) from a single configured origin/runtime-config value rather than inlining it. A magic value that affects security or auth is a higher-priority concern than a cosmetic one.

## Dead Code

Commented-out code cannot be tested or type-checked and only rots, and version control already preserves anything worth recovering.

**Guidelines:**

- MUST remove a commented-out code block rather than leaving it as a TODO breadcrumb; a commented-out block introduced by the change is the finding.
- MUST remove an unused import in a changed file (the linter catches it too, but do not rely on that alone).
- MUST either remove an exported symbol that has zero callers in the diff and the existing codebase, or add its caller in the same change — a dangling export is the finding.
- SHOULD treat an empty `try`/`catch` (e.g., `catch { /* swallow */ }`) as a dead-code smell; the rule that a caught error must be rethrown or reported rather than swallowed belongs to the project's error-handling and instrumentation rules where it defines them, so cite that lens rather than restating it here.

## Self-Explanatory Implementation

A comment is the fallback, not the plan. What a reader needs first is an implementation whose names, steps, and types already say what is happening, so the only thing left for a comment is what the code structurally cannot state — the reason, the constraint, the alternative that was rejected. Where the code cannot say something it should have been able to say, that is a defect in the code before it is a missing comment.

A comment earns its place only by adding **intuition** above the code's own level of abstraction. A fact below that level — a measurement unit, whether null is permitted, whether a bound is inclusive — belongs in the type or the name first: a branded or newtype value, a non-nullable type, a name such as `endExclusive`. A comment is admissible for one of these only once neither the type nor the name can carry it; one written at the code's own level of abstraction, restating what the code already says, was never earning its place to begin with.

A boundary doc-comment that has to describe implementation details to make sense is evidence of a shallow interface, not of a well-documented one — the fix is narrowing the interface the comment is compensating for, not writing a longer comment.

**Guidelines:**

- MUST write the implementation so it carries its own explanation, and reserve a comment for what the code cannot state; what such a comment then says, and in what voice, belongs to the project's development conventions, which the Comments and Doc-Comments section below routes to.
- MUST encode a unit, a nullability, or a bound's inclusivity in the type or the name before reaching for a comment, and reserve the comment for what neither can carry; the fix for a fact left implicit is a stronger type or a clearer name, not a comment supplying what they omit.
- SHOULD name the intermediate steps of a procedure so the flow reads as an account of what happens rather than as a sequence to be decoded; the KISS rules in [scope-discipline.md](./scope-discipline.md) own the single unreadable line, while this rule owns the flow it sits in.
- MUST let the types carry the shape of what a unit takes and returns, in a statically-typed language, rather than leaving a reader to infer it from the body or from a comment restating it.
- MUST hold a doc-comment on a module or domain boundary to one criterion — a caller can use the function, class, or constant without reading its implementation — and treat a boundary unit that fails it as the finding. This deliberately extends the project's development conventions, which require a doc-comment on an exported type and on a function past a length threshold, to every symbol sitting on a boundary, a constant included; how much detail that takes, and in what format, stays with those conventions rather than being decided here.
- SHOULD treat a comment that exists to compensate for an unclear name or an unclear flow as a finding against that name or flow, not as a comment worth keeping.

## Comments and Doc-Comments

A project's comment and doc-comment rules belong to its own code-quality conventions; this lens raises violations of them and cites that owner rather than restating the rules.

**Guidelines:**

- MUST give a changed or added type/function the doc-comment the project's code-quality conventions require of it (including documenting throwing conditions), where it defines them; a missing doc-comment is the finding, and it matters most on an exported API.
- MUST keep a line comment in the project's chosen comment voice; a comment that breaks it is the finding.
- MUST remove a line comment that merely restates the code it precedes; the finding is the comment's presence, not how it is worded.
- MUST flag a comment that references the project's own issue or ticket tracker outside a TODO comment, citing the project's code-quality conventions' TODO-comment form.
- MUST flag a comment matching one of the classical practices the project's code-quality conventions reject — an author line or change-history block, a type restated in a documentation tag, a banner or section-divider comment, or a marker outside the TODO vocabulary — citing that convention rather than restating why each is rejected.

## Type Reuse

A repeated inline type has to be changed in every copy when it evolves, whereas a single named alias documents the concept in one place. This section applies to statically-typed languages.

**Guidelines:**

- MUST extract an inline object/structural type repeated more than once into a single named type alias; the repeated inline shape is the finding.
- MUST keep a new prop/parameter type on the project's established base-type convention for the kind of value it wraps (e.g., a component rendering a DOM element extending that element's prop type), per the project's own component convention, if it defines one.
- SHOULD match the project's established type-declaration form (e.g., a project preference between `interface` and `type` for plain object shapes) rather than introducing the other.

## Control Flow

Deep nesting forces a reader to hold every branch condition at once, while early returns let each case be understood and dismissed on its own.

**Guidelines:**

- SHOULD flatten a deeply nested ternary or `if`/`else` chain with early returns; the nested version is the finding, and flattening lowers the cognitive-complexity score.
- SHOULD give a `switch` on a string-union discriminant a `default` branch (or an exhaustiveness check) so an unhandled case cannot pass silently.
- SHOULD, where the framework supports deferring resolution, pass independent async values unresolved rather than eagerly awaiting them together (e.g., a `Promise.all([…])` destructured up front); this is conditional on the project's own component convention, if it defines one.
