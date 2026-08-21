<!-- Example. Part of the example docs tree shipped with living-project-documentation. -->

# Documentation

Everything Scheduler knows about itself. Which body answers your question:

- **What does the product do?** → `specs/` — how it behaves today.
- **How is the code written?** → `conventions/` — the rules a change has to satisfy.
- **How is it built and run?** → `operations/` — the procedures someone executes.

`decisions/` sits beside all three and holds why a constraint exists, for the
constraints whose reasoning cannot be recovered from the code. The vocabulary all
four bodies use is in [glossary.md](./glossary.md).

Documents under `conventions/` and `operations/` use MUST, MUST NOT, SHOULD, SHOULD
NOT, and MAY as [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html) describes.
Documents under `specs/` describe rather than instruct, and use none of them.

## Specifications

- [specs/scheduling.md](./specs/scheduling.md) — how work is defined and gets run:
  templates and their schedules, the jobs they produce, attempts and retries, and
  what survives a job's own record.
- [specs/notifications.md](./specs/notifications.md) — how someone finds out what
  happened: the rules that fire, the channels they reach, and what a digest collapses.

## Conventions

- [conventions/directory-structure.md](./conventions/directory-structure.md) — where
  a file goes, what it is called, and which package may import which.

## Operations

- [operations/deployment.md](./operations/deployment.md) — releasing to production,
  the order migrations run in, and rolling back.

## Decisions

- [decisions/](./decisions/) — why a constraint exists, and what was traded away.
  Each record is named for the decision it holds and dated the day it was made; a
  decision is replaced by a new record rather than by editing the old one.
