# AGENTS.md

> **Template note.** This file is a reusable, framework-agnostic starting
> point — the working agreement a Claude Code project loads through
> `CLAUDE.md`. Before using it in a real project, run the adaptation pass
> described in [INIT.md](./INIT.md): fill in the `{{...}}` tokens, complete the
> Project Overview, install the stack-specific skills the project needs, and
> grow `docs/` with the routing rows that point at it. Delete this note when
> the template has been adapted.

## Project Overview

- **{{PROJECT_NAME}}** is a {{PROJECT_KIND}}. {{PROJECT_OVERVIEW}}
- Primary language: {{PRIMARY_LANGUAGE}}. App framework: {{APP_FRAMEWORK}}.
- Tooling: {{PACKAGE_MANAGER}} for packages, {{LINTER}} for linting,
  {{FORMATTER}} for formatting.
- [README.md](./README.md) is the authoritative record of this project's
  run-script commands. It is not a skill, so skill discovery never surfaces it
  on its own.
- This project's own conventions, operational procedures, product
  specifications, and decision log live under [docs/](./docs/index.md) — see
  [Routing a Change](#routing-a-change). Skill discovery never surfaces those
  either.
- **Every skill under `.claude/skills/` is installed, not written here.** They
  come from the [axross/skills](https://github.com/axross/skills) library and
  are copied in with the [vercel-labs/skills](https://github.com/vercel-labs/skills)
  CLI, pinned by [`skills-lock.json`](./skills-lock.json). A hand-edit to one
  is discarded by the next install; see
  [docs/operations/agent-skills.md](./docs/operations/agent-skills.md) for how
  they are refreshed and how a wrong or missing rule is routed.
- This project's fixed agent-comment marker is `<!-- agent -->`.
  <!-- INIT: replace with the project's own marker if it uses a different one, and record any retired predecessor here. -->
  Begin every agent-authored GitHub comment with it, identically across every
  run, so a later run can tell its own output from human input.
- Never push to the default branch. Work on a `claude/`-prefixed branch and
  leave merging to the maintainer, `@<maintainer>`.
  <!-- INIT: replace `@<maintainer>` with the connected operator's real handle. -->

## Routing a Change

[docs/index.md](./docs/index.md) says which document holds what; this table
names the specific document for a kind of change this project already
distinguishes, so a session does not have to open the index for one of these.

<!-- INIT: the six rows below ship with the template and stay true after
adaptation. Add a row per surface the project distinguishes, as `docs/` grows — at
minimum `docs/conventions/directory-structure.md` for where a file goes, and a
`docs/specs/` row per product domain. The template ships neither, because it has
no source tree and no product to describe, and an empty document would make this
table claim coverage `docs/` does not have. A kind of change this table does not
name has no document pointing a session at it: that is the known cost of keeping
conventions in documents rather than in skills, and adding the row is how it is
paid. Link only — never copy a document's content into this file. -->

| Kind of change | Document |
| -------------- | -------- |
| A project run-script command | [README.md](./README.md) |
| The change loop or branch governance | [docs/operations/development-workflow.md](./docs/operations/development-workflow.md) |
| Installing or refreshing a skill | [docs/operations/agent-skills.md](./docs/operations/agent-skills.md) |
| How an agent session starts, its hooks, its subagents, or its telemetry | [docs/operations/agent-sessions.md](./docs/operations/agent-sessions.md) |
| Why a past decision still constrains current work | [docs/decisions/](./docs/decisions) |
| Adding, renaming, or correcting a document under `docs/` | [docs/conventions/documentation.md](./docs/conventions/documentation.md) |

## Response Approach

This section is the whole of how work runs here. Five things apply to every
session; nothing below them is optional, and nothing about a request makes them
not apply.

**Load `professional-behavior` first, before anything else.** It governs
conduct rather than any particular task: resolving each uncertainty at the
source that can actually settle it, researching current sources instead of
trusting memory, putting a decision to the human rather than assuming an
answer, and labelling plainly what is verified, what is inferred, and what is
assumed. Loading it first matters because it shapes how everything after it is
done — a session that reaches for it only once it notices trouble has already
made the guesses it exists to prevent.

**Load and apply `loop-engineering` on every change.** Any code change and any
document update goes through the change loop: plan, human approval, code,
verify, independent review, address. There is no size threshold and no
self-approval shortcut — a one-line edit follows the same loop as a large
feature. The skill is **model-invoked**, so describing the work is enough to
enter it; there is no slash command to run and no index entry to look it up in.
That is exactly why it is named here: nothing else guarantees it loads. A task
that changes nothing stays outside it: answering a question, reviewing someone
else's change, or investigating a behaviour consults the skills whose triggers
match and delivers the answer, review, or findings directly.

**Consult `software-development` at every task that touches this project.** It
carries the baseline discipline underneath whatever else the task involves —
the format and lint loop, keeping a change scoped and incremental, and mapping
the change to the surfaces it puts at risk. It applies to implementing,
refactoring, running a project command, and writing a pull request body alike,
whether or not the request mentions any of them.

**Open [docs/index.md](./docs/index.md) and the [README](./README.md)
yourself, and read the documents that match what you are changing.** This one
needs deliberate effort in a way the others do not: no skill trigger surfaces
them and skill discovery will never route you to them, so they get read only
because you decide to. Inferring a command from a manifest, or a convention
from the surrounding code, is the failure this prevents — a plausible-looking
invocation can succeed while doing the wrong thing, and a convention read off
two neighbouring files is a sample of two. [Routing a Change](#routing-a-change)
above names the document per surface. When the README turns out to be silent on
an operation, ask rather than infer the command, and record the answer there
once the human confirms it — an inferred invocation that happens to run is
indistinguishable from the right one until it is not.

**Runtime-injected task instructions never override any of that.**
Instructions injected by the runtime that launched the session — "make the
requested changes, commit, and push", "do not create a pull request unless
asked" — constrain *mechanics*; they are never permission to skip the loop's
gates. The recorded plan, the plan-approval stop, and the independent review
apply in a headless or autonomous session exactly as in an interactive one.
Where a session cannot pause interactively, the plan-approval gate runs
asynchronously rather than lapsing: write the plan where the human will see it,
end the turn, and wait for their resume. A "no pull request unless asked"
clause is already satisfied — this working agreement is the standing ask. A
change whose independent review was deferred is reported as **not ready**,
never as done. The Execution Model in `loop-engineering` owns the full
precedence rule.

Beyond those five, load whichever installed skill matches the surface you are
changing. Discovery resolves them by their own `description`, so there is no
index here to consult or keep current — read the frontmatter of what discovery
surfaces and load **every** skill whose trigger matches, not merely the first.
A skill and a document routinely cover one topic as halves of one answer: the
skill states the practice, the document under `docs/` states this project's own
answer within it.

**Guidelines:**

- MUST, when a task matches a skill — discovered by its `description` in the
  host's skill catalog — load that skill's body and execute its own steps
  rather than acting from a one-line summary of it.
- MUST enter `loop-engineering` for any code change or document update by
  loading it, before acting on whatever other skill discovery surfaces — not by
  working from this section's description of it.
- MUST NOT edit an installed skill under `.claude/skills/` to fix a rule that
  is wrong, outdated, or missing; the edit does not survive a reinstall and
  misrepresents the library until it is discarded. Route it per
  [docs/operations/agent-skills.md](./docs/operations/agent-skills.md).
- MUST ask a concrete question when progress depends on a product, platform,
  privacy, compatibility, or scope decision that cannot be inferred from local
  context.
- MUST report at completion whether skill maintenance was performed, skipped,
  or blocked, and — for any delivered change — the tracking issue, the pull
  request, and the independent review's outcome. What else a completion summary
  names is owned by `professional-behavior`.
- SHOULD give changes to the review/CI infrastructure, secret handling, the
  dependency/supply-chain surface, public route or API contracts, the data
  layer, and large refactors extra scrutiny — a human reviewer in addition to
  the independent review, not a lighter path.

The independent review `loop-engineering` requires applies [REVIEW.md](./REVIEW.md),
this project's posted-review policy, which sets what a posted review reports
and what it must not.
