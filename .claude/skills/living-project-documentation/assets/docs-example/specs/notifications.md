<!-- Example. Part of the example docs tree shipped with living-project-documentation. -->

# Notifications

How someone finds out what happened. This domain covers the rules that turn an
outcome into a message, the channels those messages reach, and the digest that
collapses a run of them.

## Rules

A notification rule belongs to the account, not to a template, and selects the jobs it
cares about by template name and terminal state. Two rules matching the same job both
fire; the product does not deduplicate across rules, because each names its own
channel and suppressing one would silently drop a recipient.

A rule fires on a job's terminal state only. `queued` and `running` are not states a
rule can select, so a job that never finishes never notifies —
[scheduling.md](./scheduling.md) owns which states are terminal, and this rule reads
that set rather than restating it.

## Channels

A rule names exactly one channel. A channel serves many rules, so disabling a channel
silences every rule pointing at it at once, and the rules stay enabled rather than
being rewritten.

A webhook channel is called at most once per message and is not retried. A delivery
that fails is recorded against the channel and visible in its history; the product
does not queue undelivered messages, because a webhook replayed an hour later reaches
an operator who has already moved on.

## Digests

A rule set to digest emits one message per interval standing for every outcome that
matched it, rather than one message per job. An interval that matched nothing emits
nothing — a digest saying "no failures" is a message someone learns to ignore, which
costs more than it tells them.

A digest names the jobs it covers and their outcomes. It does not carry their output;
the message links each job instead, so a digest stays the same size whatever ran.

## What notifications do not do

A notification is not an acknowledgement. There is no acknowledge, snooze, or
escalate, and nothing changes state because a message was read — the product reports
outcomes and leaves the response to whoever receives it.
