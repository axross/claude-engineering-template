# {{PROJECT_NAME}}

<!-- INIT: this file is the SEED for the initialized project's README. During
INIT Step 7, finalize it: `git mv -f README.template.md README.md` (replacing
the template's own README; merge instead when the repository already had a
real README — see INIT Step 0), fill every prose gap flagged by an `INIT:` comment
from the Stack Decision Record and the Step-1 interview answers, resolve every
`INIT:OPTIONAL` marker below, and delete all `INIT` comments — including this
one. -->

{{PROJECT_OVERVIEW}}

<!-- INIT: expand the one-liner above into a short paragraph from the Step-1
interview — what the project is, who it serves, and its current goal. -->

## Tech stack

| Area | Tool |
| ---- | ---- |
| Language | {{PRIMARY_LANGUAGE}} |
| App framework / runtime | {{APP_FRAMEWORK}} |
| Package manager | {{PACKAGE_MANAGER}} |
| Linting & formatting | {{LINTER}} / {{FORMATTER}} |
| Unit tests | {{UNIT_TEST_FRAMEWORK}} <!-- INIT:OPTIONAL key=UNIT_TESTS — fill the token OR delete this row if the project has no unit suite. --> |
| E2E tests | {{E2E_TEST_FRAMEWORK}} <!-- INIT:OPTIONAL key=E2E_TESTS — fill the token OR delete this row if the project has no e2e suite. --> |
| Data / content layer | {{CMS_OR_DATA_LAYER}} <!-- INIT:OPTIONAL key=DATA_LAYER — fill the token OR delete this row if the project has no data/content layer. --> |
| Hosting | {{HOSTING_PLATFORM}} <!-- INIT:OPTIONAL key=HOSTING — fill the token OR delete this row if the project has no hosting platform yet. --> |

<!-- INIT: add rows a newcomer needs from the Stack Decision Record (state
management, styling, ORM/db wrapper, error tracker, logger, …); keep the table
to what the project actually uses. -->

## Getting started

1. Install dependencies: `{{INSTALL_CMD}}`
2. Start developing: `{{DEV_CMD}}`
   <!-- INIT: for a project without a dev server (CLI, library), reword this
   step to the project's run/watch equivalent. -->
3. Production build and start: `{{BUILD_CMD}}`, then `{{START_CMD}}`
   <!-- INIT:OPTIONAL key=BUILD_STEP — keep and fill OR delete this step if the project has no build step. -->

<!-- INIT: add the real prerequisites — runtime/toolchain version, `.env.local`
setup, database or services to start — from the project's actual needs (see
`.claude/hooks/session-start.sh` for what cloud sessions provision). -->

## Development workflow

Development in this repository is agent-assisted via
[Claude Code](https://claude.com/claude-code). The working agreement lives in
[`AGENTS.md`](./AGENTS.md) (loaded through `CLAUDE.md`), which routes to the
installed skills under [`.claude/skills/`](./.claude/skills) and to this
project's own documents under [`docs/`](./docs/index.md). Human and agent
contributors follow the same loop.

<!-- INIT:OPTIONAL key=INDEPENDENT_REVIEW — Fixed: the change loop and the independent-review channel are fixed infrastructure (INIT.md Step 4), so KEEP the subsections below; just delete this marker and adapt the copy to the project's stack. -->
### The change loop

Every change — code or document, one line or one feature — goes through the
`loop-engineering` skill: **plan → approve → code → verify → independent review
→ address → ready**.

There is no command to type. The skill is model-invoked, so naming the work is
what starts it: *"deliver issue #42"*, *"pick up PR 57"*, or a description of a
change with no issue behind it yet. To carry on after it stops, continue the
session and tell it to.

1. **Plan** — reads the issue and its thread, asks you the product and scope
   questions the spec leaves open, and rewrites the issue body into a
   reviewable plan with acceptance criteria. It then **always stops for your
   approval**: nothing gets built until you review the plan and resume.
2. **Code + verify** — implements the approved plan on an agent-namespaced
   branch (on a separate worktree when it shares your working copy, so it never
   blocks you), runs the checks the changed surface requires, and self-reviews
   the diff. Implementation runs in the `implementer` subagent where the
   harness allows one.
3. **Independent review** — opens a draft pull request and requests the CI
   reviewer, a separate session under a separate identity, so the code's author
   never certifies its own work.
4. **Address** — fixes review findings and CI failures, tying each resolved
   thread to the resolving commit, for a capped number of rounds.
5. **Ready** — flips the pull request to ready once CI is green and the review
   is clean. Merging always stays a human decision.

[docs/operations/development-workflow.md](./docs/operations/development-workflow.md)
holds this project's own part: the branch prefix, what audits the loop from
outside a session, and how the review is requested.

### `@claude review` — get findings on any PR
<!-- INIT: replace the trigger phrase above and below with this project's own, matching claude-review.yaml. -->

Comment **`@claude review`** on a pull request to run this repository's review
policy ([`REVIEW.md`](./REVIEW.md)) — severity-tagged findings with `file:line`
evidence and concrete fixes, posted as inline comments by the CI reviewer
([`claude-review.yaml`](./.github/workflows/claude-review.yaml)). Use it for a
pre-merge check on a hand-written change or a second opinion before merging; it
is the same reviewer the change loop requests for itself.

<!-- INIT:OPTIONAL key=PREVIEW_ENVIRONMENTS — keep & adapt this subsection when the project has per-PR preview environments (INIT Step 1d) OR delete it. -->
### Preview environments — review every PR live

*If this project has no per-PR preview environments, delete this subsection
during INIT.*

Each pull request gets its own preview environment with a **stable per-PR
link** — a preview URL for a web project, an installable build's distribution
link for a mobile app — posted to the PR as a fresh comment on every deploy
(each recording the deployed commit) and torn down when the PR closes. The
pipeline is inert until its hosting and distribution secrets are configured;
see `docs/operations/preview-deployment.md` for the setup and its rules.
<!-- INIT: the template ships no preview-deployment document, so the path above
is deliberately not a link — an unwritten target would fail the link check.
Write that document in Step 5, make this a real link, and add its Routing a
Change row in AGENTS.md. -->

Changes made without an agent follow the same bar: branch, implement, run the
checks below, open a pull request, and get it reviewed before merge.

## Testing

<!-- INIT: describe the testing strategy in a sentence or two — what unit
tests cover versus e2e, and which checks gate a merge. -->

| Check | Command |
| ----- | ------- |
| Format | `{{FORMAT_CMD}}` |
| Lint | `{{LINT_CMD}}` |
| Type-check | `{{TYPECHECK_CMD}}` <!-- INIT:OPTIONAL key=TYPED_LANGUAGE — delete this row for an untyped language. --> |
| Unit tests | `{{UNIT_TEST_CMD}}` <!-- INIT:OPTIONAL key=UNIT_TESTS — delete this row if the project has no unit suite. --> |
| E2E tests | `{{E2E_TEST_CMD}}` <!-- INIT:OPTIONAL key=E2E_TESTS — delete this row if the project has no e2e suite. --> |

This table is the authoritative list of the project's commands, for human
contributors and agents alike. Run format and lint after every change, and the
suites relevant to the changed surface before opening a pull request; the
`software-development` skill owns why, and [`AGENTS.md`](./AGENTS.md) requires
reading this file before running any of them.

If a required command cannot be run, say so — naming the command, the reason,
and the residual risk — rather than presenting the change as fully verified.

## Related links

<!-- INIT: list the project's real links collected in the Step-1 interview —
docs, issue tracker, deployment dashboard, design files, staging URL — or
delete this section if there are none. -->

- …
