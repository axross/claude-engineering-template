# Claude Loop Engineering Template

A reusable, **framework-agnostic** starting point for giving **Claude Code** a
structured working agreement, a library of installed skills, and a change loop
that cannot approve its own work.

It is extracted from a production setup and stripped of stack-specific detail,
leaving a generic core you adapt to any project — web, mobile, CLI, library, or
service.

## What's inside

```
.
├── INIT.md                  # how to adapt this template (start here)
├── init.sh                  # metacharacter-safe {{TOKEN}} substitution + gates
├── tokens.json              # machine-readable manifest of every {{TOKEN}}
├── README.template.md       # seed for the initialized project's README (finalized in INIT Step 7)
├── .gitignore               # ignores settings.local.json + .env.local (see INIT Step 6)
├── AGENTS.md                # working agreement + the Routing a Change table
├── CLAUDE.md                # @AGENTS.md + the Claude-Code-specific half
├── REVIEW.md                # fixed: posted-review policy for the independent-review channel
├── skills-lock.json         # what is installed under .claude/skills/, and from where
├── docs/                    # this project's own knowledge — index, conventions, operations, decisions
├── .github/
│   └── workflows/           # fixed: CI reviewer, merge checks, branch-governance audit;
│                            # plus template-checks.yaml, this repo's own CI (deleted during INIT)
└── .claude/
    ├── skills/              # 17 skills INSTALLED from axross/skills — generated, never hand-edited
    ├── agents/              # implementer + reviewer + investigator subagent definitions
    ├── hooks/               # session-start (always on), format + check (opt-in)
    ├── settings.json        # SessionStart hook, default effort level, telemetry tagging
    └── settings.local-example.json  # opt-in: copied to settings.local.json by session-start
```

### The skills are installed, not authored here

Every directory under `.claude/skills/` comes from
[axross/skills](https://github.com/axross/skills) via the
[vercel-labs/skills](https://github.com/vercel-labs/skills) CLI, pinned by
`skills-lock.json`. They are generated artifacts: a hand-edit is silently
discarded by the next install, so a change goes upstream as an issue or pull
request there. [docs/operations/agent-skills.md](./docs/operations/agent-skills.md)
holds the refresh command and the register for a rule that turns out to be
wrong or to collide with your project.

The template installs the 17 that apply to any project whatever its stack —
conduct, the change loop, baseline development, commits, GitHub operation,
review, QA, maintainability, security, instrumentation, unit and e2e testing,
requirements, technical writing, the docs tree, and skill authoring and
management. The stack-specific rest of the library — framework, UI, vendor, and
runner layers — is chosen during adaptation, in INIT Step 4.

**This costs a Node dependency**, and it is worth naming: `npx skills` needs
Node and network access to install or refresh. The installed skills themselves
are plain Markdown, so nothing at run time needs Node — only refreshing does,
plus the two checkers `init.sh check` calls.

### The loop, and what holds it in place

`loop-engineering` drives every change through **plan → approve → code → verify
→ independent review → address → ready**. It is model-invoked: there is no
slash command, and describing the work is what enters it.

Three things keep it from collapsing into self-approval:

- **`REVIEW.md` plus the CI reviewer**
  ([`claude-review.yaml`](./.github/workflows/claude-review.yaml)) — the review
  runs as a separate session under a separate identity, so the author never
  certifies its own work.
- **`.claude/agents/reviewer.md`** — an advisory pre-flight read before the pull
  request opens, by something other than the writer. Delete it and the stage is
  skipped rather than done by the author.
- **[`branch-governance-audit.yaml`](./.github/workflows/branch-governance-audit.yaml)** —
  an hourly sweep for an agent branch pushed ahead of the default branch with no
  open pull request. It runs outside the agent's session, which is the point:
  the prose rules are read inside the very session that would be skipping them.

### Project knowledge goes in `docs/`, not in skills

The template ships `docs/index.md`, three `operations/` documents, one
`conventions/` document, and two decision records, in the shape
`living-project-documentation` defines — `specs/`, `conventions/`,
`operations/`, and `decisions/`. The `conventions/` document is the one
exception to writing `docs/` during adaptation: it states what is true of
every repository created from this template, and nothing else under
`conventions/` can be, so it ships already written rather than waiting for
INIT Step 5. INIT Step 5 grows the rest. It does **not** ship empty
directories: an empty document is indistinguishable from a subject nobody has
considered.

The trade-off is discovery, and it is real. A skill loads because its
`description` matched; a document loads only because `AGENTS.md` said to read
it. That is why `AGENTS.md` carries a **Routing a Change** table naming a
specific document per kind of change, and why adding a document means adding
its row.

## Getting started

This repository is a GitHub **template repository**, so you start from a copy of
it rather than cloning it.

1. Get the template into your repository:
   - **New repository** — on GitHub, click **Use this template → Create a new
     repository**. Your repository starts as a copy of this one, so everything
     below is already in place. Skip to step 2.
   - **Existing repository** — copy the template's files in: the adaptation
     tooling (`INIT.md`, `init.sh`, `tokens.json`), the README seed
     (`README.template.md`), the working agreement and harness (`AGENTS.md`,
     `CLAUDE.md`, `.claude/`, `.gitignore`), the installed skills and their
     lockfile (`.claude/skills/`, `skills-lock.json`), `docs/`, and the fixed
     `.github/` and `REVIEW.md`.
2. Open **[INIT.md](./INIT.md)** and follow it — or hand the repo to Claude Code
   and ask it to "run INIT". INIT reconciles any files a scaffold already
   generated, interviews you about the project kind, frameworks, architecture,
   and goal, fills the `{{TOKENS}}` via `./init.sh`, installs the
   stack-specific skills your stack needs, and writes `docs/`.
3. When adaptation is complete, INIT finalizes `README.template.md` into your
   project's `README.md`, replacing this one, and deletes the INIT tooling.
4. **Enable the CI reviewer.** The independent-review channel's GitHub Actions
   reviewer needs a one-time operator setup before it runs: install the
   [Claude GitHub App](https://github.com/apps/claude) and add a
   `CLAUDE_CODE_OAUTH_TOKEN` repository secret — generate it locally with
   `claude setup-token` — under **Settings → Secrets and variables → Actions**,
   or set an `ANTHROPIC_API_KEY` secret instead for pay-as-you-go API billing.
   Until one of them is in place the workflow no-ops, and **its silence looks
   exactly like a clean review**. The workflow file's header comment documents
   the exact steps.

Placeholders use the `{{TOKEN}}` convention so they are easy to find and
replace; the full token list lives in [`tokens.json`](./tokens.json) and
[INIT.md](./INIT.md).
