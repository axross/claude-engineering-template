---
status: accepted
---

<!-- Example. Part of the example docs tree shipped with living-project-documentation. -->

# Move scheduling to a queue

Scheduled runs used to start inline, on the timer thread that noticed the schedule had
fired. A morning when forty templates shared a 09:00 schedule started forty runs at
once, exhausted the database connection pool, and took the API down with them. Every
part of that was working as written, which is why the fix had to change the design
rather than a limit.

Scheduling now enqueues, and a fixed pool of workers consumes the queue. Peak
concurrency is a number someone chooses rather than a number the schedules happen to
add up to.

Two alternatives were rejected. Rate-limiting the timer thread would have kept
scheduling and execution in one process, and it was that coupling — not the rate —
that turned a scheduling burst into an API outage. Giving each template its own
concurrency cap addressed the symptom one template at a time and left the total
unbounded, which is the number that actually ran out.

The cost accepted is that a job's start is no longer immediate: a job created while
the pool is saturated waits, and the product cannot tell a caller for how long. The
queue also sits between the two halves now, so a job can be lost in a way it
previously could not, and a worker's claim has to be idempotent to compensate.
