# Independent Operations

Apply this reference when a turn could carry more than one operation, to
decide which of the candidates belong together and which do not.

## What a Turn Is Billed For

A turn's price follows the context it carries into the model and back — the
instructions, the files it reads, the results the tools it calls return — not
the number of things it decides to do with that context. Two turns, each
holding one operation, pay that overhead twice; one turn holding both
operations pays it once. The multiplier that matters is therefore the count
of turns issued, not the count of operations performed inside them: N
operations spread across N turns each pay a turn's worth of overhead N times
over, while the same N issued together pay it once. Nothing about the work
itself changes — the same files get read, the same calls get made — only how
many times the overhead attached to making them was paid.

The ceiling this implies is not a preference for fewer turns as a matter of
style; it is a direct consequence of what a turn costs, and it holds
regardless of which kind of operation is doing the reading, writing, or
querying.

## The Dependency Test

An operation belongs in the same turn as another only when nothing about
either one depends on what the other returns. The test is concrete: could
this operation's target, its arguments, and the decision to run it at all
have been written down before any of the operations in the turn ran? If yes
for every candidate, they are independent and belong together. If any one of
them only gets its target, its arguments, or its reason to exist once another
operation has returned a result, it cannot be issued in the same turn as the
operation it depends on — there is nothing yet to issue it with — and putting
it in the same turn as some other, unrelated operation does not change that;
it still has to wait for the turn after the one whose result it needs.

**Good Example:**

> Three files whose paths are already known — a skill's `SKILL.md`, its
> sibling reference, and the repository's contributing guide — read together
> in one turn. Nothing about any of the three reads depends on what either of
> the other two returns.

**Bad Example:**

> A search across the repository for where a function is defined, paired in
> the same turn with an attempt to open the file the search has not returned
> yet. The second operation has no target until the first one's result
> exists, so pairing them buys nothing — the second call is guaranteed to
> miss or hit whatever placeholder path stood in for the real one.

## Why No Target Number Is Given

The ceiling on a turn is however many genuinely independent operations the
task at hand actually has — a property of the task, not of the agent
applying this rule. A task touching three unrelated files has three
independent reads available to it; a task touching one has one, and forcing
a second, unrelated operation into that turn only to reach some stated
figure would not make the two operations any more independent than they
already were. A fixed number — an average, a minimum batch size, a
per-turn quota — would invite exactly that: manufacturing operations to
reach it, or worse, forcing a dependent operation into a batch because the
count fell short. Naming no number is therefore not an omission; it keeps
the rule pointed at the actual shape of the task in front of it rather than
at a target that has nothing to do with that task.

## Beside Change Management's Incremental Steps

[change-management.md](./change-management.md)'s "Make Incremental Changes"
asks for small, independently verifiable steps, each checked before the next
begins. Read quickly, that can sound like it is in tension with a rule that
asks for operations to be batched — until the dependency test above is
applied to the steps themselves. A verification step's necessity, and often
its shape, is set by what the previous step's check returned: whether the
tests still pass, whether the lint gate is clean, whether the edit did what
it was meant to do. That makes each step in an incremental sequence dependent
on the one before it by construction, which is exactly the case this rule
already excludes from batching. The two rules are not competing for the same
operations: the incremental-changes rule governs a chain where each link
needs the previous link's result, and this rule governs the operations that
do not form such a chain — reads of already-known targets, checks against
already-known criteria, requests whose input none of the others determines.
Applying both leaves a task moving through its dependent steps one at a
time, while batching whatever independent operations each step itself calls
for.
