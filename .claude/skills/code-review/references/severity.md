# Severity Classification

Apply these rules to label every finding before reporting it. Severity drives both the final verdict and the order findings appear in the report.

## Severity Definitions

Four severities order every finding and drive the verdict. Each pairs a merge impact with the class of defect that earns it.

- **Critical** — MUST block merge. A defect that will cause data loss, a security or privacy breach, a production outage, a broken main branch (a lint, build, or test failure), or a violation of a hard project rule that any user hits on a normal request.
- **Major** — SHOULD block merge unless deferred deliberately with a stated reason. A defect that degrades correctness, performance, or reliability in a way users notice, or a violation of a strong convention with no documented justification.
- **Minor** — Non-blocking but worth addressing. Readability, naming, or small refactor opportunities; missing-but-non-critical test coverage; non-load-bearing convention drift.
- **Nit** — Optional polish. Style preferences, alternative phrasings, micro-optimizations with no measurable benefit.

**Guidelines:**

- MUST classify every finding as exactly one of the four severities above.
- MUST treat Critical as merge-blocking, and Major as merge-blocking unless the report states why it is safe to defer.

## Required Severity Floors

Some defect classes have a fixed minimum severity regardless of how small the diff looks, because their worst case is severe even when the change is one line. Raise above the floor when the concrete impact is worse; never drop below it.

| Category                                                                                                      | Minimum severity |
| ------------------------------------------------------------------------------------------------------------- | ---------------- |
| Hardcoded secret, token, credential, or private key committed to the repo                                     | Critical         |
| Missing or incorrect access control on non-public data or an endpoint that reads or mutates it                | Critical         |
| Unsanitized user input flowing into a query, a command, a request handler, or a content-rendering sink        | Critical         |
| A handler that reads or mutates data without verifying the request's authenticated identity                   | Critical         |
| Lint or type error introduced (the project's lint/typecheck gate would fail)                                  | Critical         |
| New test failure introduced, or removal of an assertion that covered changed behavior                         | Critical         |
| Missing `await` (or equivalent) on a returned async result whose completion the caller depends on             | Critical         |
| Crossing a trust or runtime boundary unsafely (e.g., importing a server-only module into client-shipped code) | Critical         |
| New dependency added with no stated justification                                                             | Major            |
| Cacheable data re-fetched on every request with no caching, or a cache with no invalidation on writes         | Major            |
| An error swallowed or logged-only where the project expects it reported to its error tracker                  | Major            |
| A regenerated snapshot or golden file with no explanation of the intended change                              | Major            |
| Missing a stable test hook on a new element an end-to-end test would need to target                           | Major            |
| Magic value introduced where a shared constant or token already exists                                        | Minor            |
| Identifier or file naming that breaks the surrounding directory's established convention                      | Minor            |

**Guidelines:**

- MUST classify each listed category at no lower than its floor.
- MAY raise a finding above its floor when the concrete impact is worse than the table's minimum.
- SHOULD treat this table as a floor, not a ceiling or an exhaustive list — a defect absent from it still earns the severity its impact warrants.

## Verdict Mapping

The reviewer emits exactly one verdict in the report Summary, derived from the severity counts so the outcome is reproducible rather than a matter of mood. The three cases partition every combination — no diff falls through, and none matches two:

- **Request Changes** — at least one Critical finding, OR more than two Major findings.
- **Approve with Nits** — zero Critical and at most two Major, with at least one finding of any severity still open. A Major in this range does not hard-block the merge, but it still needs to be addressed or deliberately deferred with a stated reason.
- **Approve** — no findings of any severity remain.

**Guidelines:**

- MUST derive the verdict from the severity counts exactly as mapped above, and state it explicitly in the Summary.
- MUST NOT approve a change with an unresolved Critical finding, whatever the surrounding pressure.

## When in Doubt

The two directions of misclassification are not symmetric: an over-labeled finding costs a little of the author's attention, while an under-labeled one can ship a production incident.

**Guidelines:**

- SHOULD escalate uncertain severity upward, not downward — a Major that turns out Minor wastes attention, a Critical mislabeled Minor causes an incident.
- MUST state the assumption that drove the severity choice when it is uncertain, e.g., "Critical assuming this route is public; downgrade to Major if it is behind admin auth."
