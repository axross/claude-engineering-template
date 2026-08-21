# Documentation

This project's own documentation, alongside its README. Which body answers
which question: **what must a change satisfy?** → `conventions/`. **How is
something run or operated?** → `operations/`. **What does the product do?** →
`specs/`. `decisions/` sits beside all three and holds why a constraint
exists, for the constraints whose reasoning cannot be recovered from the code.

<!-- INIT: this template ships `conventions/`, `operations/`, and `decisions/`,
because it has no product of its own to describe. As the project grows
`specs/` and `glossary.md`, add a heading below for each body the tree
actually holds, and link `glossary.md` from the prose above — never under a
heading of its own. Delete a sentence above naming a body the project decides
not to keep. Adaptation also deletes every file under `docs/decisions/` — your
log starts at your own first decision — so reword the Decisions entry below to
describe where records will go rather than linking a directory that no longer
exists. -->

Documents under `conventions/` and `operations/` use MUST, MUST NOT, SHOULD,
SHOULD NOT, and MAY as [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html)
describes. Documents under `specs/` describe rather than instruct, and use
none of them.

## Conventions

- [conventions/documentation.md](./conventions/documentation.md) — how this
  project's own documentation is kept true: correcting what a change
  invalidated, making a new document reachable, and the checks a documentation
  change owes.

## Operations

- [operations/development-workflow.md](./operations/development-workflow.md) —
  how a change gets from a stated intent to a merged pull request, and what
  holds the loop in place from outside a session.
- [operations/agent-skills.md](./operations/agent-skills.md) — installing and
  refreshing the agent skills, and the register of deviations and gaps.
- [operations/agent-sessions.md](./operations/agent-sessions.md) — how a
  session starts, the hooks that run during one, the subagents it can spawn,
  and its telemetry tagging.

## Decisions

- [decisions/](./decisions) — why a constraint exists, and what was traded
  away. Each record is named for the decision it holds and dated the day it
  was made; a decision is replaced by a new record rather than by editing the
  old one.

For what this project is, how to start it, and the commands it has, see
[`README.md`](../README.md). [`AGENTS.md`](../AGENTS.md) is the working
agreement for agent sessions.
