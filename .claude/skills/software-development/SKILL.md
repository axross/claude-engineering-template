---
name: software-development
description: Every task that touches a project — implementing, refactoring, running a project command, or writing a pull request body. The baseline discipline underneath the specialised skills — keep the change scoped, run the format and lint loop, map what the change puts at risk, and find out how the project is actually run. Applies even when the request never mentions formatting, linting, comments, dependencies, docs, or descriptions, and when you need one of the project's operations — tests, dev server, build, lint, deploy — and must find it documented or ask. Not for a session that touches nothing, where the conduct baseline applies instead.
user-invocable: false
---

# Software Development

This skill equips you to make a change the way a project expects: formatted and linted, kept to the smallest scope that satisfies the task, verified against the surfaces it puts at risk, operated through the commands the project documents, grounded in current vendor docs where a dependency moves fast, and landed as a well-described pull request. Reach for it on every task that touches the project — it is the baseline the other, more specific skills build on.

Load only the reference sections a given task touches; each one below routes to the detail.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Code Quality

See [code-quality.md](./references/code-quality.md) for:

- running the format → lint → fix → re-lint loop after any change
- language compliance and import hygiene
- what makes text a comment when the carrying format has no comment syntax of its own, and why a field a program reads as data stays out of scope
- the comment voice — lowercase prose, no all-caps emphasis, and what keeps its real casing
- the admissibility test a comment must clear — nothing recoverable by reading the code or following it — and deletion rather than rewording as the fix
- doc-comment and explanatory-comment conventions in source files, including the line-comment form and the ~300-character prose budget on an explanatory comment
- the `TODO(#123):` convention, the unfinished-code test that earns a site the marker, the tracked follow-up it must resolve to, and the standardized forms that may still carry an identifier or a URL
- where a specification, a domain term, a decision's rationale, or an incompressible file-local "why" goes once a comment may no longer carry it

## Change Management

See [change-management.md](./references/change-management.md) for:

- staying within the scope of the task
- making incremental, independently verifiable changes
- following existing patterns before introducing new ones
- weighing whether to add a dependency

## Project Documentation

See [project-docs.md](./references/project-docs.md) for:

- consulting the project's own contributor documentation before running a project-specific operation
- asking the human rather than inferring a command when that documentation is silent
- recording the answer, with approval, so the next task finds it documented

## Living Documentation

A project may also keep documentation of the product **itself** — what it is,
the language its domain speaks, how it currently behaves, and the decisions that
constrain it — and, where it keeps them in one tree, the shape the conventions
and operational procedures beside them take. That serves a different audience
from the contributor docs above and has its own owner: where a project ships a
living-documentation capability, that capability states when that documentation
is read, what a change obliges you to correct in it, and how. This section
routes there and deliberately does not restate those rules. Where a project
ships none, it requires nothing.

**Guidelines:**

- MUST consult the project's living-documentation capability, where it ships one, whenever a change touches behavior that documentation describes, and follow the obligations it states rather than any summary of them here.
- MUST route by tense where both apply: a specification of what is about to be built belongs to the project's product-requirement practices, and the capability above covers only the description of what already exists. This one distinction is stated here rather than left to either owner, because the cost of getting it wrong is loading neither of them.

## Verification

See [verification.md](./references/verification.md) for:

- mapping changed files to the output surfaces they put at risk before choosing a verification path
- the manual verification steps that confirm a change before it is called done, and why a passing gate is not one of them

## Current External Documentation

See [current-docs.md](./references/current-docs.md) for:

- when to consult current official docs for a fast-moving framework, service, or tool the project depends on
- treating official docs as the primary source and reporting what was consulted

## Commit Messages

The commit-message header format — its allowed types, scope and description conventions, breaking-change markers, SemVer correlation, and runnable header validator — is owned by the project's Conventional Commits practices, which govern pull request titles under the same contract. Consult that capability whenever you author a commit message or title a pull request; this skill deliberately does not restate the format.

## Pull Request Descriptions

See [pull-request-descriptions.md](./references/pull-request-descriptions.md) for:

- what a pull request body contains, and why the "why" leads
- reproducing the repository's pull request template in an API-authored body
- issue linking, verification evidence, risk disclosure, and reviewer guidance
- keeping the description current across review rounds

## Topic-Specific Skills

A project may define its own topic skills — covering repository structure, a component or routing convention, or any authoring-domain rules. Consult those skills when a change touches the area they own, if they have been defined.

**Guidelines:**

- MUST consult the matching topic skill when a change touches the area that skill owns.
- SHOULD load only the references relevant to the changed files or requested behavior.
- MUST defer detailed project rules to the owning topic skill instead of restating them here.
