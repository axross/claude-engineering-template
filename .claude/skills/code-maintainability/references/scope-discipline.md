# Scope Discipline

Apply this reference to keep a change to exactly what its stated task required — nothing more, nothing less — while writing it, and while reviewing it.

## In-Scope vs Out-of-Scope

Every changed file that cannot be traced back to the stated goal widens the review surface and the blast radius of a regression.

**Guidelines:**

- MUST tie every changed file to the stated goal (from the task, the PR description, or the commit message); a file that does not trace back is out of scope.
- MUST keep a drive-by change — a renamed unrelated variable, a refactor of an untouched file, a formatter change to a file that did not need editing — out of the change; when reviewing, it is a scope-creep finding, per the project's change-management rules where it defines them.
- MUST NOT extend the change (or the review) into pre-existing concerns; surface them separately as pre-existing observations, per the project's review evidence rules.

## YAGNI

An abstraction introduced before a second caller exists guesses at a shape the future may never need, paying indirection now for a payoff that may never come.

**Guidelines:**

- MUST inline a new abstraction (a new helper, data-access function, component prop, or generic type parameter) that has only **one** caller in the change and no documented future caller; the speculative abstraction is the finding.
- MUST NOT add a configuration option (a new prop, function argument, or environment variable) "just in case" with no live consumer.
- MUST NOT widen a type speculatively — e.g., changing `(id: string)` to `(id: string | string[])` when no caller passes an array.

## DRY (Done Right)

Genuine duplicates of a single concern drift apart the moment one copy is updated and the others are forgotten.

**Guidelines:**

- SHOULD extract a helper when two or more blocks are byte-for-byte (or near-identical) duplicates **of the same concern**; the duplication is the finding.
- MUST NOT couple blocks that are only coincidentally similar but represent different concerns (e.g., a logger child and an analytics tracker that both take a `module` parameter) — coupling unrelated callers is worse than the duplication.
- SHOULD apply the "rule of three": duplication is a smell after the third occurrence, not the second.

## KISS

Code is read far more often than it is written, so a line that takes ten seconds to decode taxes every future reader.

**Guidelines:**

- SHOULD replace a clever one-liner that takes more than ten seconds to parse with a multi-line, named-step version; the unreadable line is the finding.
- SHOULD express a string operation with a clear standard-library call (e.g., a string split or a URL parser) rather than a regex, except where a regex is genuinely the clearest tool for a tightly-bounded match.
- SHOULD replace a new generic type parameter used at only one concrete type with that concrete type.

## SOLID Applied to Component Trees

A component that owns several unrelated entities couples their fetches, so one slow or failing entity holds up everything the component renders. This section is conditional on the project drawing a server-side component / data-access split — defer to the project's own component convention, if it defines one, and skip it where the project has none.

**Guidelines:**

- SHOULD split a server-side component whose responsibility spans multiple unrelated entities (e.g., one component fetching a record **and** the site settings **and** the tag list) into per-concern children, each with its own loading/streaming boundary; the multi-entity component is the finding.
- MUST keep a server-side component from **mutating** data where data-access modules are read-only — mutations belong in request handlers or the data layer's own lifecycle hooks.
- SHOULD keep a loading/placeholder component independent of the loaded data shape (a skeleton must render with no data); a placeholder that depends on loaded data defeats the loaded/loading split.

## Change Size

The more unrelated ground one change covers, the more likely a real defect slips past review unnoticed.

**Guidelines:**

- SHOULD keep a change focused enough that it does not touch far more unrelated files or lines than its goal needs; an outsized diff (as a rough signal, more than ~15 unrelated files or ~600 lines net) is a "consider splitting" finding, with the split decision deferred to the human owner per the project's review escalation rules.
