# INIT — Adapting this template to a project

This repository is a **reusable, framework-agnostic template** for a **Claude
Code** project. It ships:

- `AGENTS.md` — the working agreement plus the **Routing a Change** table that
  points at `docs/`. It carries no skill index: installed skills route on their
  own `description`, and a second list would only be a ledger to keep in sync.
- `CLAUDE.md` — `@AGENTS.md`, plus the half of the agreement that is true of
  Claude Code and of no other host.
- `.claude/skills/**` — **17 skills installed from
  [axross/skills](https://github.com/axross/skills)**, pinned by
  `skills-lock.json`. They are generated artifacts, not template content: a
  hand-edit is discarded by the next install. Step 4 adds the stack-specific
  ones.
- `.claude/agents/` — the `implementer`, `reviewer`, and `investigator`
  subagent definitions `loop-engineering` delegates to.
- `.claude/**` — the rest of the **Claude Code** harness binding (hooks +
  settings).
- `docs/` — the project's own knowledge, in the shape
  `living-project-documentation` defines. The template ships `index.md`, three
  `operations/` documents, one `conventions/` document, and two decision
  records; Step 5 grows the rest.
- `README.template.md` — a seed for the initialized project's own README
  (summary, tech stack, getting started, development workflow, testing,
  related links), finalized into `README.md` in Step 7.

Everything project-specific has been replaced with `{{TOKEN}}` placeholders or
neutral prose. This file tells an AI agent how to turn the template into a
working setup for one concrete project.

> **Fixed vs. configured — do not ask about these.** This template targets
> **Claude Code specifically**: there is no "which agent?" choice. The change
> loop (`loop-engineering`) and the **independent-review channel** it drives
> (`REVIEW.md`, the `.github/workflows/`, and the `github-operation` skill) are
> **fixed infrastructure** — INIT *configures and adapts* them but **never asks
> whether to keep them, and never deletes them.** The 17 installed skills are
> the cross-project core and all stay; what Step 1 and Step 4 resolve is which
> *additional*, stack-specific skills to install beside them.

> **You are the agent running INIT.** Follow the steps in order. Do not skip
> Step 0 or Step 1 — the rest depends on their answers. Make changes only inside
> this template's files. When done, INIT.md and every `<!-- INIT: ... -->` /
> "TEMPLATE NOTE" / "_template note_" scaffold should be gone.

> **Tooling.** Two helpers automate the mechanical parts; both are optional but
> recommended:
> - `./init.sh` — metacharacter-safe `{{TOKEN}}` substitution driven by
>   `tokens.json` (`./init.sh init` to scaffold a values file, `apply` to
>   substitute, `check` to run the gates). Use it instead of a hand-written
>   `sed` sweep — two tokens contain `| * ( ) \ $` and break `sed`.
> - `./init.sh check` also runs the two checkers that ship inside installed
>   skills and survive adaptation:
>   `agent-skill-authoring/scripts/check-links.mjs` for relative-link integrity
>   across the whole tree — **including** the `.claude/` dot-directory a
>   `glob('**/*.md')` sweep silently skips — and the five
>   `living-project-documentation/scripts/check-*.mjs` validators over `docs/`,
>   which stay inert until `docs/index.md` exists. Both need Node, which
>   refreshing skills needs anyway.

---

## Step 0 — Reconcile pre-existing files (do this before copying anything)

You are often dropping this template into a repository that **already has** some
of these files — modern scaffolds (`create-next-app`, `create-vite`, many
others) now generate their own `AGENTS.md` and `CLAUDE.md`. Overwriting them
silently loses real project guidance.

Before copying the template over an existing tree, check for collisions and
merge rather than clobber:

- **Existing `AGENTS.md`** — do **not** overwrite. Copy the template's
  `AGENTS.md` in as `AGENTS.template.md`, then fold any project-specific rules
  the existing file already contains (framework gotchas, "read these docs first"
  notes, house style) into the template's **Project Overview** (Step 2) or a
  project-specific skill (Step 5). Replace `AGENTS.md` only once its content is
  preserved. Concrete example: `create-next-app` generates an `AGENTS.md` whose
  one rule is load-bearing — Next.js 16 has breaking changes and ships its own
  docs in `node_modules/next/dist/docs/`; fold that into the Project Overview
  and the current-docs table, don't drop it.
- **Existing `CLAUDE.md`** — if it is already just `@AGENTS.md`, keep it. If it
  holds other instructions, append `@AGENTS.md` rather than replacing them.
- **Existing `.gitignore`** — keep the project's file; merge in the template's
  `settings.local.json` / `.env.local` entries (Step 6) instead of overwriting.
  Watch for a blanket `.env*` entry (`create-next-app` ships one): it also
  ignores the `.env.example` that `session-start.sh` copies from — replace it
  with the template's `.env.local` / `.env.*.local` entries so the example
  file stays committable.
- **Existing `README.md`** (a real project README, not this template's own) —
  do **not** let Step 7's finalize clobber it: fold `README.template.md`'s
  sections (summary, tech stack, getting started, development workflow,
  testing, related links) into the existing README there instead of renaming
  the seed over it, then delete the seed.
- **Existing `.claude/`** — merge directory-by-directory; never
  replace wholesale.

If the repository is empty/new, there is nothing to reconcile — continue.

---

## Step 1 — Interview the user (REQUIRED, do this first)

You MUST ask the user the questions below before editing any file. Ask them
together, grouped by sub-step, and batch related questions rather than
dribbling them out over many rounds. The interview is strict:

- MUST ask every area that applies to the project. Each area lists concrete
  example options — offer them, but accept any answer.
- MUST NOT infer a default for an area the user has not answered. If the user
  explicitly delegates an area ("your pick", "whatever is standard"), choose a
  sensible option and record it as a stated assumption — delegation is an
  answer; silence is not.
- MUST NOT invent the project's goal or kind under any circumstances.
- MUST record every answer — including delegated picks and "not applicable" —
  in the **Stack Decision Record** (end of this step) before starting Step 2.
- SHOULD skip asking an area whose applicability condition clearly fails
  (e.g. styling for a headless REST API), recording it as not applicable.

### 1a — Project identity

1. **Project overview.** In one or two sentences, what is the project's
   purpose / goal / what it is? (This becomes the Project Overview in
   `AGENTS.md` and the quick summary in the project README.) Also collect any
   **related links** — docs, issue tracker, deployment dashboard, design
   files — for the README's Related-links section (Step 7); "none" is a fine
   answer.
2. **Application type.** What kind of project is this?
   - Web client / full-stack web app
   - Mobile app
   - Server (RESTful API, GraphQL, WebSocket, …)
   - CLI, library, desktop app, something else

   Does it have a user-facing UI surface?

3. **Application identifier(s)** *(if the project ships an installable or
   distributable artifact whose identity is a durable reverse-DNS identifier —
   a mobile app, a desktop app, a browser extension, or a published package
   that carries one)*. This is a **MUST-ask**; never infer it.
   - Ask for the reverse-DNS **base identifier** (e.g. `app.axross.payload`)
     and derive the per-platform ids from it — the Android `applicationId` /
     package and the iOS `bundleIdentifier` — or ask for each explicitly when
     they must differ. Capture any store / distribution app IDs the artifact
     needs, and the deep-link **scheme** (a related-but-separate identifier)
     for an app that registers one.
   - **Why human-confirmed, never invented:** app identity is durable and
     expensive to change once published — store listings, distribution apps
     (e.g. Firebase), signing configs, and the deep-link scheme all key off it,
     so a post-release rename is a cross-cutting, costly migration. Consistent
     with the "MUST NOT infer a default" rule above, an agent MUST NOT invent
     it — here, or later when Step 5 scaffolds app/native config. Record the
     answer in the Stack Decision Record; like the 1c architecture decisions it
     fills no `{{TOKEN}}` (Step 5 reads it from there).
   - Record it *not applicable* for a surface-less kind that ships no such
     artifact — a headless service, a CLI, or a library whose only identity is
     its package name (already captured by `{{PROJECT_NAME}}`) — so those
     projects are not prompted.

### 1b — Core toolchain (always present)

4. **Always-present tooling.** Which does the project use for each of:
   - **App framework / runtime** — examples per application type: web
     (Next.js, Remix, …), mobile (Expo, Flutter, …), server (Hono, NestJS,
     Apollo, Express, …), or `none (plain runtime)`
   - **Primary language** (e.g. TypeScript, Python, Go)
   - **Package manager** (e.g. npm, pnpm, yarn, bun, pip)
   - **Linter** (e.g. Biome, ESLint, Ruff)
   - **Formatter** (e.g. Biome, Prettier, gofmt). If the project has **no
     dedicated formatter** (a default `create-next-app`, for example, ships
     ESLint but no Prettier), say so — see Step 3 for how to handle it.

### 1c — Architecture & structure

These answers fill no `{{TOKEN}}`; they live in the Stack Decision Record and
are consumed by Step 2 (Project Overview) and Step 5 (the structure /
component / UI-design skills). Ask each area that applies:

5. **Directory structure** (worth deciding early, especially for smaller
   apps):
   - by feature (domain A, domain B, …)
   - by purpose/type (components, hooks, persistence, …)
6. **Business-logic structure:**
   - React hooks and context-based
   - Bloc (or a similar event/state pattern)
   - Clean Architecture model-based
   - none / ad-hoc
7. **State management** *(if the app holds client-side or shared state)*:
   - client state (e.g. Zustand, Jotai, Redux)
   - server cache (e.g. TanStack Query, Apollo Client)
   - Bloc, or another pattern-supplied store
8. **Database layer** *(if the app persists data — mobile and
   server/full-stack apps especially)*: PostgreSQL, MySQL, Firebase
   Firestore, libSQL/SQLite, … Whether the project has, adds, or skips a
   data/content layer at all is decided in 1d; this records *which* engine.
9. **ORM / db-wrapper library** *(if the app persists data and a database
   layer was picked in item 8 — mobile and server/full-stack apps
   especially)*: Drizzle, Prisma, … — or none (raw driver/SQL).
10. **Interface / validation & sanitization** *(if the project parses external
    input — API payloads, forms, env)*: zod, valibot, …
11. **Styling** *(if the project renders UI)*: CSS Modules, Tailwind,
    Emotion, …
12. **Theming** *(if the project renders UI)*: CSS variables + Radix color
    system, React Native Unistyles, …
13. **Headless component library** *(if the project renders UI)*: Base UI,
    Radix UI, none (hand-rolled), …

### 1d — Optional capabilities

14. **For each, decide _have / add / skip_.** Do **not**
    assume these exist. A freshly scaffolded app usually has none of them, so
    the honest default is often "add" or "skip", not "delete". For each one
    ask: does the project already have it, do you want to **add** it now, or
    skip it? For **have** and **add**, the answer MUST name the tool — "we
    have unit tests" without a framework name is not a recorded decision.
    - **Unit tests** (e.g. Vitest, Jest, pytest)
    - **E2E tests** (e.g. Playwright, Cypress, Detox, Maestro)
    - **E2E scenario coverage** (a journey-catalog coverage metric over the e2e suite — which user journeys the tests assert; requires E2E tests)
    - **Error tracker** (e.g. Sentry, Rollbar)
    - **Structured logger** (e.g. Pino, Winston)
    - **Data / content layer** (e.g. Prisma, Drizzle, Payload CMS, a REST API — the engine and ORM/wrapper picked in 1c, when the project has one)
    - **Hosting platform** (e.g. Vercel, AWS, Fly.io)
    - **Per-PR preview environments** (a pipeline giving each pull request a
      stable preview link — a stable URL for a web client/server project, a
      signed installable tester-channel build for a mobile app; the rules live
      in `docs/operations/preview-deployment.md`, which Step 5 authors). For
      **have**/**add**, name the hosting/distribution target it deploys
      through (e.g. Vercel, Fly.io, Firebase App Distribution, TestFlight).
      For a project with a deployable or installable surface, prefer **add**
      over skip: the scaffolded pipeline is preflight-gated and inert (a
      green no-op) until its accounts are configured, so adding it costs
      nothing up front. Record it *not applicable* for a project with no such
      surface (a library, a CLI).

    **Not on this list — fixed, do not ask:** GitHub operations
    (`github-operation`), the change loop (`loop-engineering`), and the
    independent-review channel (`REVIEW.md` and the `.github/workflows/`) are
    **fixed infrastructure** (see the "Fixed vs. configured" note at the top).
    INIT configures and adapts them but never offers them up for deletion;
    record them as kept, and resolve their markers as "keep + adapt" in Step 4.

    Each answer above also decides whether a stack-specific **skill** gets
    installed in Step 4a — the runner skill for a named test framework, the
    vendor skill for a named error tracker, and so on. Record the tool name for
    that reason too, not only for the token.

    Record each of the eight capabilities above as **have → _tool_**, **add →
    _tool_**, or **skip**. This single answer drives three things: which
    stack-specific skills get installed (Step 4a), the token fill (Step 3), and
    the keep-or-delete decision for each remaining `<!-- INIT:OPTIONAL -->`
    section (Step 4b). **have** and **add** keep the section and fill its token;
    **add** also scaffolds the tool for real in Step 5. **skip** deletes the
    section and its row in `tokens.json`.

    Because the guidance now lives in installed skills rather than in template
    files, skipping a capability no longer means editing prose out of a dozen
    places — it means not installing that skill and deleting a README row. That
    is the whole of it.

### 1e — Agent (fixed: Claude Code)

15. **Agent — do not ask.** This template targets **Claude Code**, and only
    Claude Code; the harness binding is fixed (see Step 6). There is no "which
    agents?" question — record the agent as `Claude Code` in the Stack Decision
    Record and move on. (If a project also wants to drive these same
    `AGENTS.md` + `.claude/skills/**` files from another agent, that is a
    post-INIT addition the project makes itself, not an INIT choice.)

### Stack Decision Record

Collect every 1a–1e answer into one table — the Stack Decision Record — and
keep it for the rest of the INIT run: Step 2 (Project Overview), Step 3 (token
fill), Step 4 (optional-capability resolution), and Step 5 (project-specific
skills) all consume it. `Source` is one of `answered`, `delegated
(assumption)`, or `not applicable`:

| Area | Decision | Source |
| ---- | -------- | ------ |
| Application type | full-stack web app | answered |
| Application identifier | `app.axross.payload` (→ Android package + iOS bundle id) | answered |
| State management | Zustand | delegated (assumption) |
| Theming | — (headless REST API) | not applicable |

If the project already has a manifest/lockfile/config, you SHOULD read it to
confirm the answers instead of relying solely on the user — confirmation
supplements the interview; it never replaces asking. **Prefer adding a missing
capability over silently dropping it** — deleting a whole testing or
observability skill should be a deliberate choice the user made, not a default.
(`loop-engineering`, `REVIEW.md`, the CI workflows, and `github-operation`
are the exception — they are fixed and never dropped; see the
"Fixed vs. configured" note.)

---

## Step 2 — Fill the Project Overview

In `AGENTS.md`, replace the `## Project Overview` placeholder block with a short,
durable description built from the Stack Decision Record (Step 1). Keep it to a
few bullets; deep layout detail — and the 1c architecture decisions — belongs
in a project-specific structure skill (Step 5), not here. Remove the
top-of-file "Template note" blockquote.

---

## Step 3 — Replace the placeholder tokens

Every `{{TOKEN}}` maps to a Stack Decision Record entry (Step 1). Replace ALL
occurrences across
`AGENTS.md`, `README.template.md`, and `.claude/**`. The table below is the
complete set used by the template (also machine-readable in `tokens.json`). Each
row gives several example values across different stacks so the substitution is
unambiguous — pick the one matching the project, or follow the same shape for a
stack not listed.

> **Use `./init.sh`, not a `sed` sweep.** Two tokens — `{{CODE_FILE_GLOB}}`
> (`*.ts | *.tsx | *.css`) and `{{CODE_FILE_REGEX}}` (`\.(ts|tsx|css)$`) —
> contain shell/regex metacharacters (`| * ( ) \ $`) that break a naive
> `sed s|...|...|` replacement. Run `./init.sh init`, fill `init.values.json`,
> then `./init.sh apply`; it substitutes literally and then runs the gates. If
> you must replace by hand, do these two literally and verify with
> `./init.sh check`.

> **No dedicated formatter?** If the project lints but has no separate formatter
> (common for a default `create-next-app`: ESLint, no Prettier), set
> `{{FORMATTER}}` to the linter's autofix (e.g. `ESLint (eslint --fix)`) and
> `{{FORMAT_CMD}}` to that command (e.g. `npx eslint --fix`). Alternatively,
> **add** a formatter (Prettier/Biome) during Step 5, or delete `format.sh` and
> the format-on-edit binding (Step 6) so the project is lint-only.

> Rule of thumb for command tokens: if the project exposes run-scripts through
> its package manager, prefer those (`npm run build`, `pnpm test`); otherwise use
> the direct tool invocation (`tsc --noEmit`, `go test ./...`). Always use the
> project's *actual* scripts when they exist — the examples are only shapes.

### Identity & stack

| Token | Fill with | Example values (pick the matching stack) |
| ----- | --------- | ---------------------------------------- |
| `{{PROJECT_NAME}}` | Project / repo name | `acme-web` · `billing-service` · `dotctl` |
| `{{PROJECT_OVERVIEW}}` | One-line goal/overview | `Internal dashboard for fleet operations.` · `CLI for managing dotfiles.` |
| `{{PROJECT_KIND}}` | Kind of project | `web app` · `mobile app` · `CLI` · `library` · `backend service` · `desktop app` |
| `{{PRIMARY_LANGUAGE}}` | Main language | `TypeScript` · `Python` · `Go` · `Rust` · `Swift` |
| `{{APP_FRAMEWORK}}` | App framework / runtime | `Next.js` · `React Native` · `Express` · `FastAPI` · `Gin` · `none (plain runtime)` |
| `{{PACKAGE_MANAGER}}` | Package manager binary (single binary only — the hooks call `command -v` on it, so a multiword value like `npx playwright` will not work) | `npm` · `pnpm` · `yarn` · `bun` · `pip` · `poetry` · `cargo` · `go` |
| `{{LINTER}}` | Linter | `Biome` · `ESLint` · `Ruff` · `golangci-lint` · `Clippy` |
| `{{FORMATTER}}` | Formatter | `Biome` · `Prettier` · `Ruff` · `gofmt` · `rustfmt` |
| `{{UNIT_TEST_FRAMEWORK}}` | Unit test framework | `Jest` · `Vitest` · `pytest` · `go test` · `cargo test` |

### Optional integrations

If the project does not use one of these, **delete** the matching section and
its row in `tokens.json` instead of filling the token (see Step 4b). When kept,
fill the token.

| Token | Fill with | Example values | If absent |
| ----- | --------- | -------------- | --------- |
| `{{E2E_TEST_FRAMEWORK}}` | E2E test framework | `Playwright` · `Cypress` · `Detox` | delete the e2e rows of `README.template.md` |
| `{{CMS_OR_DATA_LAYER}}` | Data / content layer | `Payload CMS` · `Prisma` · `Drizzle` · `SQLAlchemy` · `a REST API` | delete the data-layer row of `README.template.md` |
| `{{HOSTING_PLATFORM}}` | Hosting / deploy platform | `Vercel` · `AWS` · `Fly.io` · `Cloudflare` · `self-hosted` | delete the hosting row of `README.template.md` |

An error tracker and a structured logger no longer have tokens of their own:
`software-instrumentation` names roles rather than products, and the vendor
skill installed beside it in Step 4a supplies the mechanics. Record the tools in
the Stack Decision Record and the README, not in a token.

### Commands

| Token | Fill with | Example values (npm-scripts · direct) |
| ----- | --------- | ------------------------------------- |
| `{{INSTALL_CMD}}` | Install dependencies | `npm install` · `pnpm install` · `pip install -r requirements.txt` · `go mod download` |
| `{{DEV_CMD}}` | Start dev server | `npm run dev` · `pnpm dev` · `uvicorn app:app --reload` · `go run ./...` |
| `{{BUILD_CMD}}` | Production build | `npm run build` · `pnpm build` · `go build ./...` · `cargo build --release` |
| `{{START_CMD}}` | Start built app | `npm run start` · `node dist/index.js` · `./bin/app` |
| `{{FORMAT_CMD}}` | Run formatter | `npm run format` · `biome format --write .` · `ruff format .` · `gofmt -w .` |
| `{{LINT_CMD}}` | Run linter | `npm run lint` · `biome check .` · `ruff check .` · `golangci-lint run` |
| `{{TYPECHECK_CMD}}` | Type-check (drop if the language is untyped) | `npm run typecheck` · `tsc --noEmit` · `mypy .` |
| `{{UNIT_TEST_CMD}}` | Run unit tests | `npm run test:unit` · `pnpm test` · `pytest` · `go test ./...` |
| `{{E2E_TEST_CMD}}` | Run e2e tests | `npm run test:e2e` · `npx playwright test` · `cypress run` |

### Harness-hook tokens (`.claude/hooks/*.sh`)

| Token | Fill with | Example values |
| ----- | --------- | -------------- |
| `{{CODE_FILE_GLOB}}` | Shell `case` pattern of formatted extensions (`format.sh`) | `*.ts \| *.tsx \| *.css` · `*.py` · `*.go` |
| `{{CODE_FILE_REGEX}}` | Extended-regex of source extensions (`check.sh`) | `\.(ts\|tsx\|css)$` · `\.py$` · `\.go$` |

A find-and-replace sweep is the fastest path. After replacing, search the tree
for `{{` to confirm none remain (the completion checklist does this).

---
## Step 4 — Choose the skill set, and resolve the remaining optional sections

### 4a — Install the skills the project needs

The template ships a **core set of 17** installed skills — the ones that apply
to any project whatever its stack. Leave them in place. The rest of the
library is stack-specific, and this is where you choose from it, using the
Stack Decision Record (Step 1).

Consult the library's own catalog rather than a list copied here, which would
go stale the moment upstream adds a skill:

```bash
npx skills add axross/skills --list
```

Install each one the project actually needs, naming them explicitly:

```bash
npx skills add axross/skills --agent claude-code --yes --copy \
  --skill <name> --skill <name>
```

The stack-specific layers to consider, per the Stack Decision Record:

| Recorded decision | Skill to consider |
| ----------------- | ----------------- |
| Unit test framework is Vitest / Jest | `vitest-testing` / `jest-testing` |
| App framework is Next.js / Expo | `next-app-development` / `expo-app-development` |
| The project renders UI | `react-component-development`, `react-component-styling`, `high-fidelity-ui-design`, `wireframe-design` |
| Server-cache library is TanStack Query | `tanstack-query-development` |
| Validation library is Zod | `zod-schema` |
| Error tracker is Sentry | `sentry-instrumentation` |
| Product analytics is Amplitude | `amplitude-instrumentation` |

Three rules about the CLI, each of which fails quietly rather than loudly:

- **Never `--skill '*'` against an external source.** It installs the library's
  entire catalogue rather than the subset you chose, adopting framework and
  vendor layers this project has not picked.
- **One skill per `--skill` flag.** A comma-separated value matches nothing,
  installs nothing, writes no lockfile, and prints an available-skill list that
  reads like ordinary help rather than a failure.
- **Commit `.claude/skills/**` and `skills-lock.json` together.** The lockfile
  describes the directory's entire contents; that correspondence is the only
  thing that makes drift detectable.

Then confirm the host actually loaded them, which is not observable from inside
the session that changed the tree: start a **fresh** session and run `/context`.

[docs/operations/agent-skills.md](./docs/operations/agent-skills.md) holds the
refresh command and the deviation register — read it, and keep it accurate if
this project's install story differs from the template's.

### 4b — Resolve the remaining optional sections

With the skills installed rather than authored, only a handful of marked
sections remain, all of them outside `.claude/skills/`:

```bash
grep -rn 'INIT:OPTIONAL' .claude .github AGENTS.md REVIEW.md README.template.md
```

**The loop machinery is fixed — never deleted here.** `REVIEW.md`, the
`.github/workflows/`, and the `github-operation` + `loop-engineering` skills are
permanent (see the "Fixed vs. configured" note at the top of this file):
resolve their markers as "keep + adapt", never as a deletion.

For each remaining marked section:

- **keep** → delete the `<!-- INIT:OPTIONAL ... -->` comment and any italic
  "_delete during INIT_" note, fill its token, and leave the content.
- **delete** → remove the whole marked section, its token's row in
  `tokens.json`, and every inbound link. `./init.sh apply` refuses to run while
  a manifest-listed token has no value, whether or not it still occurs in the
  tree.

Then configure the two fixed pieces:

- **`REVIEW.md`** — enumerate the do-not-report list from the checks
  `merge-checks.yaml` actually runs. Add an entry only where the mechanical
  check and the finding it would silence are the same thing; a check that is
  merely a narrow proxy for a broader prose rule does not remove that rule from
  the reviewer's scope.
- **`claude-review.yaml`** — set the review trigger phrase and the reviewer
  identity. The phrase is functional and dangerous in prose: a
  comment-triggered workflow matches it **anywhere** in a comment body, so the
  literal phrase belongs ONLY in the workflow file. Everywhere else — including
  `docs/operations/development-workflow.md` — refer to it as "the review
  trigger phrase".
- **`branch-governance-audit.yaml`** — set `AGENT_PREFIX` to the push-allowed
  branch prefix `AGENTS.md` names, if the project uses something other than
  `claude/`.
- **`merge-checks.yaml`** — `./init.sh apply` substitutes the run commands; the
  toolchain setup is NOT a token, so replace `setup-node` / `.nvmrc` / the npm
  cache with the project's own by hand. The template ships no `.nvmrc`, so a
  project keeping the npm-flavored setup must create one (or switch to
  `node-version:`), or both jobs fail at Setup Node on every run. Note that both
  jobs self-skip their real steps — and pass — while `INIT.md` exists; deleting
  the INIT tooling in Step 7 is what arms them, so a green Merge Checks before
  that point does not mean lint and tests ran.

---

## Step 5 — Write `docs/`

This is where the project's own knowledge goes: its conventions, its
operational procedures, what its product does, and the decisions that constrain
it. **Not into skills.** A hand-written project skill duplicates what an
installed one already says, and drifts from it silently. This repository's own
reasoning is in `docs/decisions/2026-08-11-install-skills-from-a-shared-library-rather-than-authoring-them.md`,
named rather than linked because Step 7 deletes that log — nothing outside
`docs/decisions/` may depend on a record still being there.

The `living-project-documentation` skill owns the shape, the document format,
and the validators. **Load it and follow it** — this step states only what INIT
adds on top.

### What ships, and what you add

The template ships `docs/index.md`, three `operations/` documents, one
`conventions/` document, and two decision records. It ships **no** `specs/`
and no `glossary.md`, because it has no source tree and no product of its own
— and an empty document is worse than a missing one: it is indistinguishable
from a subject nobody has considered, and it makes the index claim coverage
`docs/` does not have.

The one `conventions/` document is the exception:
[`conventions/documentation.md`](./docs/conventions/documentation.md) states
what is true of every repository created from this template — how its own
`docs/` is kept true — and nothing else under `conventions/` can make that
claim, because everything else there is specific to a source tree the
template does not have.

Copy the shape from the worked example the skill ships — seven files across two
domains, demonstrating every relational rule — rather than starting from a
blank template:

```
.claude/skills/living-project-documentation/assets/docs-example/
```

### The write order

Do not scaffold the tree and fill it in later. Write in this order, and add a
line to `index.md` for each document as you write it:

1. **`docs/conventions/directory-structure.md`** — where a file goes, what it
   is called, which module may import which. This is the first thing a session
   needs and the thing it is most likely to get wrong by inference. It records
   the Stack Decision Record's directory-structure and business-logic-structure
   decisions (§1c).
2. **A `conventions/` document per surface the project distinguishes** — as
   `code-style.md`, `testing.md`, `styling.md`, `security.md`, and so on
   actually acquire content. State only this project's own answer and defer the
   general practice to the installed skill that owns it by name; that is what
   keeps `conventions/testing.md` from growing into a second, divergent copy of
   a testing capability.

   **One exception, where the installed skill is silent rather than general.**
   A project with authentication must state its own lockout thresholds and its
   session-cookie ownership rule in `conventions/security.md`, because
   `application-security` covers neither — the gap and its reasoning are
   recorded in
   [docs/operations/agent-skills.md](./docs/operations/agent-skills.md). This is
   not the usual "state only your own answer" case: there is no general practice
   to defer to.
3. **`docs/specs/<domain>.md` for one domain** — the one whose behaviour is
   most often asked about, or most often got wrong. State the domain's boundary
   and what it deliberately does not do, alongside what it does.
4. **`docs/glossary.md`** — seeded from that spec's own vocabulary and from the
   code's, not invented. Link it from `index.md`'s opening prose, never under a
   heading of its own. Once the tree holds `conventions/` or `operations/` too,
   it splits at the `#` level into `# Product vocabulary` and
   `# Development vocabulary`.
5. **`docs/decisions/`** — from the next decision made, never backfilled.
   Reconstructed rationale is a guess presented as history.

### Placing a document: `conventions/` or `operations/`?

Decide by **where a violation would appear**, not by a "code versus process"
label:

- A **convention**'s violation stays in the tree — the wrong thing is sitting
  in a file and a reviewer can point at the line. Where a file goes is a
  convention.
- An **operation**'s violation exists only in an act — a step skipped, run out
  of order, or run with the wrong flag, leaving no diff to cite. A deployment
  procedure is an operation.

### The document format

A document under `conventions/` or `operations/` is **not** shaped like a
`SKILL.md`. It is read whole, so a trailing `**Guidelines:**` block restating
the prose above it produces two statements of one rule with nothing holding
them together. State each rule once, next to the reasoning that justifies it,
and let the heading be the citable anchor. Make each rule's strength readable
from its own sentence, and declare the vocabulary once in `index.md`.

Name a document for the field it already uses — `directory-structure.md`, not
`repository-map.md`; `testing.md`, not `quality-gates.md`. A coined internal
name is a name nobody searches for.

### Then update the routing table

Every document you add earns a row in `AGENTS.md`'s
**Routing a Change** table, naming the kind of change it governs. This matters
more here than it looks: a document fires on nothing — skill discovery will
never surface it — so a kind of change the table does not name has nothing
pointing a session at it. Link only; never copy a document's content into
`AGENTS.md`.

### Scaffolding capabilities chosen as "add" in Step 1

When the user opted to add a capability rather than skip it, set it up for real
here so the kept rules are not aspirational:

- **Unit tests** → install the runner, add a `test:unit` run-script, fill
  `{{UNIT_TEST_FRAMEWORK}}` / `{{UNIT_TEST_CMD}}`, create a first example test,
  and install the matching runner skill (§4a).
- **E2E tests** → install the runner, add a `test:e2e` script, fill
  `{{E2E_TEST_FRAMEWORK}}` / `{{E2E_TEST_CMD}}`. The `end-to-end-testing` skill
  ships a scenario-catalog example under its own `assets/`; use it if the
  project adopts scenario coverage.
- **Error tracker / logger** → add the dependency and its init, and install the
  vendor skill (§4a) beside `software-instrumentation`.
- **Per-PR preview environments** → **the one capability the installed library
  does not cover.** Author `docs/operations/preview-deployment.md` yourself and
  build the pipeline it describes: for a web project, a workflow that
  provisions the pull request's isolated backing resources, deploys, re-points
  a deterministic stable alias (`<prefix>-pr-<n>`) at the newest deployment,
  comments the stable URL with the deployed short SHA, and tears everything
  down on close; for a mobile app, a dispatched build that distributes through
  the tester channel and comments the install link. Keep it preflight-gated and
  inert — it should merge green before any account setup — isolate per-PR data,
  post a fresh comment per deploy, and fail loudly rather than emitting a stale
  link. Document the required secrets and variables in the README.
- **Formatter** → add it, add a `format` script, fill `{{FORMATTER}}` /
  `{{FORMAT_CMD}}`.

Confirm each added command actually runs before relying on the `check.sh` /
`format.sh` hooks that call it.

**Application identifier(s) — use the confirmed answer, never invent one.** When
the Stack Decision Record records an application identifier (§1a, item 3),
every generated app, native, or distribution config MUST take the identifier
verbatim from that recorded answer: the Android package and iOS bundle
identifier, any manifest- or plist-shaping config, a Fastlane `Appfile`, the
store and distribution app IDs, the deep-link scheme, and e2e `appId` selectors
must all agree. App identity is expensive to change once published (see §1a). A
surface-less kind recorded the area *not applicable*, so none of this applies
to it.

---

## Step 6 — Set up the Claude Code harness binding

`AGENTS.md`, `.claude/skills/**`, and `docs/` are the portable substance. This
template targets **Claude Code** (fixed — Step 1e), which reads them through
the `.claude/` binding. Most of it needs only the token fill;
[docs/operations/agent-sessions.md](./docs/operations/agent-sessions.md) is the
document that describes it, and it stays accurate as long as you do not change
the shape below.

- `.claude/settings.json` wires the `SessionStart` hook, sets the default
  reasoning effort (`effortLevel`; ships as `xhigh`), and stamps
  `{{PROJECT_NAME}}` onto the OpenTelemetry resource attributes. It configures
  no endpoint and no credential, so telemetry stays off until the project sets
  it up; delete the `env` block if the project wants no tagging at all.
- `.claude/settings.local-example.json` is the opt-in quality binding
  (format-on-edit + lint/test-before-stop) and pre-approves the two scheduling
  tools `loop-engineering` uses to wake itself while waiting on CI. The
  session-start hook copies it to `settings.local.json` in cloud sessions.
- `.claude/hooks/*.sh` need the token fill — `{{CODE_FILE_GLOB}}`,
  `{{CODE_FILE_REGEX}}`, `{{INSTALL_CMD}}`, and the command tokens — plus an
  adapted toolchain block in `session-start.sh` for the project's runtime (the
  example activates `mise` when it is already present). Delete any hook the
  project does not want, and its entry in the settings file above.
- `.claude/agents/` holds `implementer.md`, `reviewer.md`, and
  `investigator.md`. None carries project-specific text, so none needs
  adapting; all three are outside the skills CLI, so refreshing skills never
  updates them — copy a newer version by hand if upstream changes one. Deleting
  any of them degrades the loop gracefully rather than breaking it.
- The session-start hook materializes `settings.local.json` and `.env.local`.
  The template ships a `.gitignore` that excludes both (the
  `application-security` skill assumes they are gitignored) — keep those entries
  and merge the rest of the project's ignores into it. If the project keeps its
  own `.gitignore` elsewhere, move these entries there instead.

The Claude Code binding is the only one to set up — there is no per-agent choice
to make. A project that later wants to drive the same `AGENTS.md`, skills, and
`docs/` from another agent adds that binding itself, outside INIT, by pointing
the agent at `AGENTS.md`; the portable substance already supports it, which is
why `AGENTS.md` holds the agreement and `CLAUDE.md` holds only the Claude-specific
half.

---

## Step 7 — Finalize

- Finalize the project README from its seed:
  `git mv -f README.template.md README.md` (replacing the template's own
  README — but when the repository already had its own real README, merge the
  seed's sections into it instead and delete the seed; see Step 0),
  then complete it against the Stack Decision Record and the Step-1 answers —
  expand the quick summary into a short paragraph, trim the Tech stack table
  to what the project actually uses, verify the Getting-started commands run,
  resolve the Development-workflow and Testing markers against the kept
  capabilities, and fill Related links (or delete that section) — and delete
  every `<!-- INIT… -->` comment in it. The finished README MUST cover: a
  quick summary, the tech stack, getting started, the development workflow
  (including the change loop, which is fixed infrastructure), the testing
  strategy and its commands, and related links (when applicable).
- Run `./init.sh check` and resolve everything it reports.
- Walk the completion checklist below **while the INIT tooling still exists** —
  several items run `./init.sh check`, and checking them after the deletion
  step would leave those items with no runnable command.
- Then delete the INIT tooling — all of it, unconditionally: `INIT.md`,
  `init.sh`, `tokens.json`, `init.values.json`, and
  `.github/workflows/template-checks.yaml` (the template repository's own CI).
  None of these are meant to survive adaptation; a leftover copy is dead
  weight that only rots. The checkers `init.sh check` calls are **not** INIT
  tooling — they ship inside installed skills and stay. Before deleting
  `template-checks.yaml`, copy whichever of its two jobs the project wants as
  an ongoing gate into `merge-checks.yaml`: the relative-link check, and the
  `docs/` validators. Both need a Node setup step, which is a real cost for a
  project whose stack is not Node — decide it deliberately rather than dropping
  the checks by default.
- Delete every file under `docs/decisions/` — the project's own decision log
  starts at its own first decision, never backfilled to explain a constraint
  inherited from the template — and reword `docs/index.md`'s Decisions entry so
  it no longer links a directory that is now gone.
- Remove the "Template note" blockquote at the top of `AGENTS.md`, every
  `<!-- INIT:OPTIONAL ... -->` marker and `<!-- INIT: ... -->` fill-in comment,
  every "TEMPLATE NOTE" / "_delete during INIT_" line for sections you decided
  to keep, and the template-state header comments in
  [`.github/workflows/merge-checks.yaml`](./.github/workflows/merge-checks.yaml)
  — they explain the un-adapted template's guard steps, in a workflow the
  project keeps, so they read as leftover narration once those guard steps have
  armed for good.

### Completion checklist

- [ ] No `{{TOKEN}}`s remain in authored files (build/VCS dirs excluded):
      `./init.sh check` (or `grep -rnE '\{\{[A-Z][A-Z0-9_]*\}\}' .
      --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git`).
      The uppercase-token pattern matters when the independent-review
      workflows are kept: GitHub Actions `${{ ... }}` expressions contain
      `{{` but are lowercase, so they never match, while leftover tokens in
      `.github/` (e.g. `merge-checks.yaml`'s run commands) are caught.
- [ ] No `<!-- INIT… -->` markers remain — neither `INIT:OPTIONAL` capability
      markers nor `INIT:` fill-in comments: `grep -rn '<!-- INIT' .`
- [ ] No dangling relative links, and `docs/` passes its five validators:
      `./init.sh check` runs both. The link checker covers the `.claude/` tree
      a `glob('**/*.md')` sweep would skip.
- [ ] `.claude/skills/` and `skills-lock.json` list exactly the same skills,
      and both are committed. A skill present in one and not the other is what
      makes drift undetectable.
- [ ] A fresh session's `/context` shows the installed skills. This cannot be
      confirmed from the session that installed them — skills load at session
      start.
- [ ] `AGENTS.md`'s **Routing a Change** table has a row for every document
      under `docs/conventions/` and `docs/specs/`, and every row resolves.
      Nothing surfaces those documents automatically, so an unrouted one is
      unreachable in practice.
- [ ] `docs/` holds no empty or heading-only document. A subject with nothing
      to say about it yet has no file, and no index line.
- [ ] Skipped capabilities no longer appear in prose: grep the tree for each
      skipped tool's name and for generic phrases like "data layer",
      "structured logger", or "error tracker" in `README.md`, `AGENTS.md`, and
      `docs/`, and reword or delete the stragglers.
- [ ] Added capabilities have a working command (the `check.sh` / `format.sh`
      hooks actually run).
- [ ] `merge-checks.yaml` is kept (fixed): its jobs actually run the lint/test
      steps instead of skipping them — the guard steps disarm once `INIT.md`
      is deleted, so check a post-INIT run's log shows the steps executing.
- [ ] Per-PR preview environments are resolved: a kept capability has both
      `docs/operations/preview-deployment.md` and an authored workflow that is
      preflight-gated (it merges green before any account setup), with its
      required secrets and variables documented in the README, and a Routing a
      Change row pointing at the document; a skipped one leaves no marked site
      or prose straggler behind.
- [ ] `branch-governance-audit.yaml`'s `AGENT_PREFIX` matches the branch prefix
      `AGENTS.md` names. A mismatch makes the audit pass silently while
      checking nothing.
- [ ] The Claude Code harness binding is filled in and runnable.
- [ ] A `.gitignore` excludes `settings.local.json` and `.env.local` (or the
      project's equivalent local-state/secret files).
- [ ] `INIT.md` and template scaffolding notes/tooling are deleted — including
      `init.sh`, `tokens.json`, `init.values.json`, and
      `.github/workflows/template-checks.yaml`.
- [ ] The README seed is finalized: `README.template.md` is gone (renamed
      over — or merged into — `README.md`), no `<!-- INIT… -->` comment or
      `{{TOKEN}}` remains in
      `README.md`, and it covers the quick summary, tech stack, getting
      started, development workflow, testing strategy and commands, and
      related links (or that section was deliberately dropped). The template's
      own README — the one titled "Claude Loop Engineering Template" — no
      longer exists.
- [ ] `docs/decisions/` holds only records this project made: the template's
      own decision records are deleted, and `docs/index.md`'s Decisions entry
      no longer links a directory that is gone.
- [ ] No kept workflow's comments still describe the un-adapted template —
      including `.github/workflows/merge-checks.yaml`'s header, once its guard
      steps have armed for good.
