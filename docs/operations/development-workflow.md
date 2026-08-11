# Development Workflow

How a change gets from a stated intent to a merged pull request here, and what
holds that path in place from outside an agent session.

## The Change Loop

Every change — code or document, one line or one feature — goes through
`loop-engineering`: plan → approve → code → verify → independent review →
address → ready. The skill owns the loop's stages, its gates, and its caps;
this document states only what is this project's own.

The loop is **model-invoked**. It carries `user-invocable: false`, so there is
no slash command to type and nothing to wait for: describing the work is what
enters it. A session that waits for a command that does not exist has already
left the loop.

Two gates are real, and neither has a self-approval path. No implementation
begins before the human approves the plan recorded in the tracking issue, and
no change is called done on the author's own assessment rather than a separate
reviewer's. A runtime harness that frames the task as "just make the changes,
commit, and push" constrains mechanics only; it never lifts either gate.

## Branches and Merging

Work happens on a `claude/`-prefixed branch. Pushing to the default branch is
forbidden, and merging is the maintainer's decision rather than the session's —
a run that has flipped its pull request to ready is finished, whether or not
the merge has happened.

The prefix is not cosmetic: [the branch-governance
audit](../../.github/workflows/branch-governance-audit.yaml) keys on it.

## What Holds the Loop From Outside

The loop's own rules live in a skill and in [`AGENTS.md`](../../AGENTS.md), both
of which are read *inside* the session — which is exactly where a run that has
already skipped the loop is doing its reasoning. Two checks therefore sit
outside it.

[`branch-governance-audit.yaml`](../../.github/workflows/branch-governance-audit.yaml)
sweeps hourly for a `claude/*` branch pushed ahead of the default branch with no
open pull request: work delivered outside the loop, and so never independently
reviewed. It MUST stay a scheduled sweep rather than gaining a push trigger —
the loop legitimately pushes in Phase 2 and opens its pull request in Phase 3,
so a push-time check would fail that window every time. A grace period skips a
branch whose latest commit is still fresh.

[`check.sh`](../../.claude/hooks/check.sh)'s in-flight reminder covers the
narrower case within a single session; see
[agent-sessions.md](./agent-sessions.md#the-opt-in-quality-hooks).

## The Independent Review

The review is a separate session under a separate identity — never the
authoring session, whatever it calls its own assessment. Request it by posting
the review trigger phrase as a top-level comment on the pull request; the CI
reviewer in [`claude-review.yaml`](../../.github/workflows/claude-review.yaml)
answers it and applies [`REVIEW.md`](../../REVIEW.md).

Write the trigger phrase in exactly one place — that comment. A
comment-triggered workflow matches it **anywhere** in a body, so a second
mention in a plan, a summary, or a reply fires a duplicate review. Everywhere
else, refer to it as "the review trigger phrase".

The reviewer is inert until a one-time operator setup is done, and its silence
is indistinguishable from a clean review: it needs the
[Claude GitHub App](https://github.com/apps/claude) installed and a
`CLAUDE_CODE_OAUTH_TOKEN` repository secret (or an `ANTHROPIC_API_KEY` for
pay-as-you-go billing). It also answers repository owners, members, and
collaborators only. A run that gets no review MUST confirm the setup rather
than reading the absence as approval.
