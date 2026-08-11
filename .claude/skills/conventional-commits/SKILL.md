---
name: conventional-commits
description: Authoring or revising a Git commit message, titling a pull request, or judging whether a header conforms — "write a commit message", "what type should this be", "is this header valid", "does this need a scope", "mark this as a breaking change", or preparing a squash-merge title that becomes a permanent commit subject. Not the pull request body, which a pull-request-description capability owns, and not issue titles. Conventional Commits v1.0.0 — the header contract, types, scopes, footers, breaking-change markers, SemVer correlation, and a bundled validator.
user-invocable: false
---

# Conventional Commits

Use this capability whenever you write a Git commit message or title a pull request. It gives you the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) contract — a header shape release tooling can parse and a human can scan in `git log --oneline` — together with a runnable validator that catches a malformed header before it lands. The normative rules below are summarized from the specification, so applying them needs no network fetch.

This skill is **self-contained**: it names no repository-specific file or layout, and the contract it carries is the same wherever it is installed. Where a host project narrows the rules — a restricted type list, a mandatory scope, a commit trailer its own tooling reads — follow the host's convention on that point and keep the structure below.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html).

## Overall Format

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

**Guidelines:**

- MUST prefix every commit with a `<type>`, followed by an OPTIONAL scope, an OPTIONAL `!` breaking-change marker, a REQUIRED colon, and a REQUIRED single space before the description.
- MUST keep the first line (the header: `type(scope)!: description`) a single line with no trailing period.
- MUST separate the header, body, and footers with exactly one blank line each when they are present.

## Pull Request Titles

The header format is not commit-only: a pull request title MUST follow the same `<type>[scope][!]: <description>` shape as a commit header, so titles stay consistent and scannable regardless of merge strategy. It also matters at merge time: a squash merge commonly takes the pull request title as the squashed commit's subject (on GitHub, by default for multi-commit PRs, and for all PRs when "Default to pull request title" is enabled), so a title without a type prefix lands a non-conforming commit on the default branch. The title carries only the header; the body and footers belong to the pull request description instead — consult the project's pull-request-description practices when writing that body.

**Guidelines:**

- MUST title every pull request with a Conventional Commits header (`<type>[scope][!]: <description>`), applying the Type, Scope, Description, and Breaking-Change rules below exactly as for a commit header.
- SHOULD pick the type from the primary change the pull request delivers when it spans more than one type (e.g., a change that is mostly CI config with an incidental docs tweak is `ci`).
- MUST NOT apply this rule to issue titles: an issue states a problem or deliverable in plain descriptive prose, and is never a commit subject.

## Type

The type prefix is what tooling reads to derive the release bump, so it must name the change's true nature.

**Guidelines:**

- MUST use `feat` when the commit adds a user-facing feature — correlates to a SemVer **MINOR** bump.
- MUST use `fix` when the commit fixes a user-facing bug — correlates to a SemVer **PATCH** bump.
- MAY use any of these additional types for non-release-affecting changes:
  - `build` — build system or external dependencies (e.g., the dependency manifest or build config).
  - `chore` — housekeeping that does not fit another type (e.g., skill edits, config tweaks, repo metadata).
  - `ci` — CI/CD configuration (e.g., pipeline definitions or hosting/project settings).
  - `docs` — documentation only (e.g. a README, contributor docs, or agent-skill documents).
  - `style` — formatting / whitespace only, no behavior change (formatter-driven, typically).
  - `refactor` — code change that neither fixes a bug nor adds a feature.
  - `perf` — performance improvement.
  - `test` — adding or correcting tests.
  - `revert` — reverts a prior commit; see the revert example below.
- MUST treat types as case-insensitive in parsing but SHOULD write them lowercase for consistency with the existing git log.

## Scope

A scope tells a reader which part of the codebase moved without opening the diff — useful, but only when one section is clearly primary.

**Guidelines:**

- MAY include a scope in parentheses immediately after the type, e.g., `fix(parser): ...`.
- MUST make the scope a noun identifying the affected section of the codebase — prefer names that match the existing layout: e.g., `api`, `auth`, `config`, `e2e`, `skills`, or a specific module/route name.
- SHOULD omit the scope when the change spans the whole project and no single section is primary.

## Description

The description is the one line that shows in `git log --oneline`, and the imperative mood reads as the command the commit carries out.

**Guidelines:**

- MUST place the description immediately after `: ` and keep it a short imperative summary of the change (e.g., "add Polish language", not "added" or "adds").
- SHOULD keep the full header (`type(scope)!: description`) under ~72 characters so `git log --oneline` stays readable.
- MUST NOT end the description with a period.

## Body

The diff already shows what changed; the body is where the reasoning the code cannot express survives for the next reader.

**Guidelines:**

- MAY provide a body one blank line after the description to add context, rationale, or migration notes — use it whenever the "why" is not obvious from the diff.
- MAY consist of any number of newline-separated paragraphs. Body text is free-form.
- SHOULD wrap body lines at ~72 characters for terminal readability, except for URLs and code spans.

## Footers

Footers carry machine-parseable trailers — issue references, review credits, breaking-change notes — that tooling can extract without reading the prose.

- `BREAKING CHANGE` is the only token allowed to contain a space. `BREAKING-CHANGE` (hyphenated) is synonymous and equally valid.

**Guidelines:**

- MAY place one or more footers one blank line after the body (or after the description, if the body is omitted).
- MUST write each footer as a word token, followed by either `: ` (colon + space) or ` #` (space + hash), followed by the value. Tokens MUST use `-` instead of whitespace, e.g., `Reviewed-by:`, `Acked-by:`, `Co-authored-by:`, `Refs: #123`, `Closes: #45`.
- MAY allow footer values to span spaces and newlines; a value terminates only when the next valid footer token is parsed.

## Breaking Changes

A breaking change MUST be indicated in at least one of two ways (both MAY be used together):

1. **`!` after the type/scope prefix**, e.g., `feat(api)!: drop support for Node 18`. When `!` is used, the `BREAKING CHANGE:` footer MAY be omitted and the description itself serves as the breaking-change note.
2. **`BREAKING CHANGE:` footer** (uppercase required), e.g.:
   ```
   BREAKING CHANGE: `extends` key in config file is now used for extending other config files
   ```

**Guidelines:**

- MUST correlate breaking changes to a SemVer **MAJOR** bump, regardless of whether the type is `feat`, `fix`, or anything else.
- MUST write `BREAKING CHANGE` uppercase; all other Conventional Commits tokens are case-insensitive for parsing but SHOULD be written lowercase.

## SemVer Correlation

SemVer Correlation maps each Conventional Commit shape to the release bump it signals. Use this table when choosing the header type and breaking-change marker for a commit.

| Commit shape                                                                              | SemVer bump     |
| ----------------------------------------------------------------------------------------- | --------------- |
| `fix: ...`                                                                                | PATCH           |
| `feat: ...`                                                                               | MINOR           |
| Any type with `!` or a `BREAKING CHANGE:` footer                                          | MAJOR           |
| `chore`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `perf`, `revert` without `!` | No release bump |

**Guidelines:**

- MUST treat `fix` as PATCH and `feat` as MINOR unless the commit also marks a breaking change.
- MUST treat any `!` marker or `BREAKING CHANGE:` footer as MAJOR.
- MUST NOT imply a release bump from non-`feat` / non-`fix` types unless they carry a breaking-change marker.

## Examples

These examples show accepted commit shapes for common cases, including scopes, bodies, footers, breaking changes, and reverts.

**Simple, no scope, no body:**

```
docs: correct spelling of CHANGELOG
```

**With scope:**

```
feat(lang): add Polish language
```

**Breaking change via `!`:**

```
feat!: send an email to the customer when a product is shipped
```

**Breaking change via `!` with scope:**

```
feat(api)!: drop support for Node 18
```

**Breaking change via footer (no `!`):**

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

**With body and multiple footers:**

```
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from the latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
```

**Revert:**

```
revert: feat(lang): add Polish language

Refs: 676104e, a215868
```

**Guidelines:**

- SHOULD model new commit messages after the closest accepted example.
- MUST preserve the blank-line separation between header, body, and footers when a commit includes more than a single header line.

## Tooling Notes

Unless a project installs a commit hook or a CI check that rejects a malformed message, a non-conforming commit lands silently unless the author catches it first. To make that catch mechanical, this skill bundles [scripts/check-commit-message.mjs](./scripts/check-commit-message.mjs): a dependency-light Node validator (standard library only) that checks a header against the rules above and reports every violation. It reads a message from a file argument or from stdin.

**Example:**

```bash
# Paths are relative to this skill's installed directory — from a message
# file, or piped on stdin:
node scripts/check-commit-message.mjs .git/COMMIT_EDITMSG
printf 'feat(lang): add Polish language' | node scripts/check-commit-message.mjs
```

- When amending or rewriting history, re-check that every rewritten commit still conforms — especially that breaking changes carry either `!` or the footer.

**Guidelines:**

- MUST self-enforce this format whenever the project does not enforce commit messages with a commit hook or a CI check.
- SHOULD run `check-commit-message.mjs` on the header (and on a pull request title, which follows the same format) before committing, rather than eyeballing it.
- MUST treat exit `1` as a malformed header to fix and exit `2` as a bad invocation (no message supplied); exit `0` means the header conforms.
