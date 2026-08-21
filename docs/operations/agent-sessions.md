# Agent Sessions

How a Claude Code session starts in this project, the hooks that run during
one, the subagents it can spawn, and the one setting that cannot be verified
from inside a session at all.

## The Session-Start Hook

In a cloud session, [`.claude/hooks/session-start.sh`](../../.claude/hooks/session-start.sh)
provisions the toolchain, copies `.env.example` to `.env.local` if one does not
exist, materializes the opt-in quality hooks, installs dependencies, and echoes
a pointer to [`AGENTS.md`](../../AGENTS.md) so every session carries the working
agreement into its context.

It exits immediately unless `CLAUDE_CODE_REMOTE=true`, because a local session
manages its own toolchain and should not have one installed under it. Set that
variable by hand to exercise the hook locally.

The toolchain block activates a version manager only when one is **already**
present. It MUST NOT be changed to install one unconditionally: an image that
already ships a usable runtime does not need one, and a hard `curl | sh` turns
a transient network failure into a failed session start — a failure that
surfaces as every later command missing its tools rather than as an install
error.

The hook is wired in [`.claude/settings.json`](../../.claude/settings.json),
which also sets the session's default reasoning effort — `effortLevel`, shipped
as `xhigh`. Both are read at session start, so a change to either reaches only
the next session.

The reminder it echoes names `AGENTS.md` rather than `CLAUDE.md` on purpose.
`CLAUDE.md` is an `@AGENTS.md` import, which is a Claude Code mechanism; a host
that does not resolve imports would read the literal import line instead of the
working agreement.

## The Opt-In Quality Hooks

Format-on-edit and check-before-stop are **opt-in**. They live in
[`.claude/settings.local-example.json`](../../.claude/settings.local-example.json),
which the session-start hook copies to the gitignored `settings.local.json` in a
cloud session; Claude Code hot-reloads them for that session. A local session
skips the hook entirely, so opting in there stays a manual copy.

That example file also pre-approves `send_later` and `delete_trigger`. Those are
not a convenience: `loop-engineering` schedules its own wake with them while
waiting on CI and the independent review, and without the grant every wait
raises a permission prompt that an unattended session cannot answer.

[`check.sh`](../../.claude/hooks/check.sh) blocks completion on a failing lint
or test run, and separately emits a non-blocking reminder when the branch has
commits ahead of the default branch that are **all pushed** and the tree is
clean. That state is what a change loop looks like when it stopped between the
push and the pull request, and the hook's own change gate would otherwise read
it as "nothing pending". The hook cannot ask GitHub whether a pull request
exists, so it reminds rather than blocks — and it MUST stay non-blocking, since
a false positive that halts an agent mid-delivery costs more than the reminder
saves.

## Subagents

[`.claude/agents/`](../../.claude/agents/) holds three definitions, and it is
the only home for any of them: an agent definition is not a skill, so the
skills CLI never carries it, and it never appears in `skills-lock.json`.

`implementer.md` is the worker `loop-engineering` delegates Code and Verify to.
It pins a lower-cost model, because a worker inheriting the session's model runs
at the main actor's cost and defeats the point of delegating. It states its
delivery boundary — commits stay local, pushing and publishing belong to
whoever asked — in its own prose rather than by withdrawing a tool.

`reviewer.md` is the reader for the advisory pre-flight review. It denies
exactly two things, editing and spawning, and nothing else. Widening that
deny-list is the tempting mistake and MUST be resisted: judging a change means
confirming what was asked and not only what was written, which reaches the
issue, the plan's artifacts, and the documentation behind a factual claim. A
reviewer that cannot reach one of those does not fail to start — it returns a
report short by exactly those checks, and an under-equipped review reads exactly
like a clean one.

`investigator.md` is the reader for a payload the main actor needs only one
conclusion from — a log, a long thread, a wide search across files or history,
a file tree — so that payload never enters the main actor's own context. It
returns a conclusion and a locator precise enough to go back to the source,
never the payload itself, which is what keeps the read cheap on the caller's
side. Like the reviewer, it denies editing and spawning; it decides nothing the
material does not itself settle, sending an unresolved judgment call back to
whoever asked.

Deleting any of the three files degrades gracefully rather than breaking the
loop. Without the implementer, the loop delegates to a generic agent or runs
single-agent; without the reviewer, the pre-flight stage is skipped rather than
performed by the main actor, which is what keeps it from collapsing into
self-review; without the investigator, the main actor reads the payload itself,
per read, paying in its own context what delegating the read would otherwise
have saved.

## Telemetry Tagging

[`.claude/settings.json`](../../.claude/settings.json) carries an `env` block
stamping the repository name and the session's launch surface onto the
OpenTelemetry resource attributes Claude Code exports, so this project's usage
separates from every other repository sharing an account or a cloud
environment. It configures nothing else — no endpoint, no credential, no
`CLAUDE_CODE_ENABLE_TELEMETRY` — so a contributor who has never set telemetry
up sees no behavior change from it.

Verifying a change to that block is the catch: Claude Code does not pass `OTEL_*`
variables to the subprocesses it spawns, so `echo $OTEL_RESOURCE_ATTRIBUTES`
inside a session prints nothing even when the exporter holds the value. Confirm
it in the metrics backend instead, against a session started **after** the
change — an already-running session read its configuration at startup.
