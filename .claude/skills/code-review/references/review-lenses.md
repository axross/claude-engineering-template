# What to Flag: Review Lenses

Apply these lenses to decide _what_ to look for once scope is set. Each lens is a class of defect, not a checklist to recite in full on every review — load the lenses that materially overlap the diff and skip the ones that do not. Every lens flags problems and cites the concrete risk; none rewrites the code (that is a later phase).

## Correctness

Correctness is the lens no change can skip: the other lenses assume the code does what it claims. Read the changed logic against the inputs it will actually receive, not the inputs the author had in mind.

**Guidelines:**

- MUST trace each changed branch against its boundary inputs — empty, zero, negative, null/undefined, the maximum, and the malformed — and flag any that produce a wrong result or an unhandled throw.
- MUST verify that a changed function's contract (its parameters, return shape, thrown errors, and side effects) still holds for every caller found while scoping.
- MUST flag an async result whose completion the caller depends on but does not await (or otherwise sequence), and any race between concurrent operations that share state.
- MUST flag an error path that is swallowed, logged and then continued as if it succeeded, or caught so broadly it hides an unrelated failure.
- MUST flag off-by-one bounds, inverted conditionals, and comparison/assignment or truthy/exact-equality confusions in changed expressions.
- SHOULD confirm the change actually satisfies each acceptance criterion, and name any criterion the diff leaves unmet or that cannot be confirmed from the diff.

## Maintainability and Design

Maintainability is about the next person to touch this code. Flag structure that will cost future readers, but do not block a merge over taste the project has not codified.

**Guidelines:**

- MUST flag a name that misdescribes what a value or function does, and identifier or file names that break the surrounding directory's established convention.
- MUST flag dead code introduced by the change — unused imports and variables, unreachable branches, and commented-out blocks.
- MUST flag a magic number or string where a shared constant or token already exists, or where one clearly should.
- SHOULD flag a new shared abstraction with fewer than two real call sites (speculative generality) and, conversely, genuinely duplicated logic that should be consolidated — but only when the duplicates are the same concern, not merely similar-looking.
- SHOULD flag a unit whose complexity or length crosses the project's configured threshold, or that mixes several responsibilities at one level.
- SHOULD flag logic placed at the wrong tier — route-local code duplicated instead of shared, or one caller's concern hoisted into a shared module.
- SHOULD flag a drive-by refactor unrelated to the stated goal as a scope concern, separately from the change itself.

## Security and Privacy

Security findings carry fixed severity floors (see severity.md) because their worst case is severe even when the diff is small. Treat every value that crosses a trust boundary as hostile until the code proves otherwise.

**Guidelines:**

- MUST flag any secret, token, credential, or private key committed in source, config, or a test, and any secret read outside the project's sanctioned configuration path.
- MUST flag request input — path and query params, headers, bodies, and uploaded content — that reaches a query, a shell command, a filesystem path, or an outbound request without validation and coercion; static types do not guarantee runtime shape.
- MUST flag rendering of untrusted content into a raw-HTML sink or an unsanitized attribute, and any dangerous URL protocol (e.g., `javascript:`) not stripped before it reaches a rendered link.
- MUST flag data or an endpoint that lacks the access control its sensitivity requires, and any non-public content reachable through a public route, metadata, sitemap, or media URL.
- MUST flag a `fetch` (or equivalent) of a user- or content-controlled URL that could be steered at an internal-network host, and any new external host added to an allowlist without tight scoping.
- SHOULD flag analytics or error-reporting changes that capture unnecessary PII, secrets, or private content, and a client-exposed environment variable holding a value that should stay server-side.
- SHOULD flag a new dependency that is unjustified, unmaintained, or ships an install-time script that runs unexpected code, and confirm the lockfile was updated.

## Testing and Verification

Tests are how a change proves it works and stays working. Review them as behavior, and treat missing verification as a gap the report must name, not silently accept.

**Guidelines:**

- MUST flag a new route, feature, or visually distinct surface that ships with no corresponding test coverage.
- MUST flag a test that asserts an implementation detail (a private call, an internal shape) rather than an observable contract, since it will fail on harmless refactors and pass through real regressions.
- MUST flag a regenerated snapshot or golden file whose visual/output change is not explained, and a removed snapshot not paired with a removed or restructured test.
- MUST flag a committed focus/only or skip marker, and any weakening of anti-flake configuration or "fix" of a flaky test by adding a sleep, retry, or poll instead of removing the nondeterminism.
- SHOULD flag a new user-facing element that an end-to-end test would target but that exposes no stable test hook.
- SHOULD flag missing manual verification when the change touches a data-driven surface (non-default and empty states), a routing change (the not-found path), or dev-server output (new warnings or errors).
- MUST record which checks ran and which were skipped, per evidence-and-reporting.md; unverified is not the same as verified-passing.

## Performance and Reliability

This lens asks two questions of a change: what does it cost at runtime, and how does it behave when something fails. Flag the risk and, when you cannot measure it, say so and lower confidence accordingly.

**Guidelines:**

- MUST flag an N+1 access pattern — iterating a collection and issuing one query or request per item — and a data read with no projection, filter, or result limit where the dataset can grow.
- MUST flag independent async work awaited sequentially into a waterfall when it could run concurrently, and a heavyweight or server-only module pulled into a client-shipped bundle.
- MUST flag caching applied to per-user, per-request, or authenticated data, and a new cached source with no write-side invalidation or no deliberately chosen lifetime.
- SHOULD flag large or unoptimized assets that bypass the project's asset pipeline, missing intrinsic dimensions, and above-the-fold media that is not prioritized (or below-the-fold media not deferred).
- SHOULD flag error handling placed in a nested helper instead of the root call site, and an error-reporting call that fires after an early return so the failure is never captured.
- SHOULD flag a slow or external operation with no surrounding observability (a start/complete log pair or equivalent), and a new segment that needs a custom error boundary but has none.
- MUST mark any unmeasured performance claim "needs verification" and name the measurement that would confirm it.
