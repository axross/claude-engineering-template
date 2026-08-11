# E2E Scenario Coverage

Apply these rules when tagging tests, extending the journey catalog, or reading the coverage report. Scenario coverage measures e2e coverage as **which real user or client journeys the suite asserts** — not lines of application code executed. It is an optional but recommended discipline; adopt it as a whole or not at all.

## Why Scenario Coverage, Not E2E Line Coverage

Scenario coverage is a deliberate choice over instrumenting the app and collecting e2e _line_ coverage. Line coverage was rejected because:

- **Noisy and gameable.** Executed ≠ asserted: a line runs when a test merely walks past it, so line coverage overstates how well journeys are _verified_.
- **Slow and heavy.** It needs an instrumented coverage build, which is fragile under modern bundlers and slows the default e2e run. Scenario coverage is pure bookkeeping over test tags, so it adds near-zero cost.
- **Cannot express gaps.** Line coverage has no notion of an _intended_ journey nobody has tested yet, so it can never say "the cancel journey is untested." A traceability catalog can — that visible-gap capability is the whole point.

The trade-off: the denominator is a **human judgment call** — an incomplete catalog inflates the percentage — so the catalog is reviewed alongside the code, and only critical journeys are hard-gated.

## Mechanism

Three pieces, joined by a stable scenario id:

- **Catalog** — a human-authored journey list (for example `e2e/scenarios.md`) with one row per journey: a stable dotted id (e.g. `checkout.payment.success`), a title, an area, and a priority of `must` | `should` | `may`. This list is the coverage _denominator_. [assets/scenarios.example.md](../assets/scenarios.example.md) is a ready-to-copy starting point.
- **Tags** — each test declares which journeys it asserts through whatever tag mechanism the runner offers: a `@scenario:<id>` join tag (a test may carry several), plus optional `@area:<area>` / `@priority:<priority>` facet tags for filtered runs and grouped reporting, and an `@smoke` selection tag marking the fast pre-gate subset. Adapt the syntax to the runner.
- **Reporter/gate** — a small tool the project writes tallies, for every catalog row, whether at least one **passing** test carries its scenario tag, prints `covered/total` overall and per priority plus the uncovered list, and fails on the gate conditions below. Keep its input a normalized `{ title, tags, status }` array so the join and the gate stay runner-agnostic, and let a thin per-runner adapter map the runner's report into that shape. Read `@`-tokens from both `tags` and `title`, since Playwright carries them in a field and Vitest/Jest in the title.

**How tags attach across runners** (the join is the same; only the syntax differs):

| Runner        | Where the tag lives                                         |
| ------------- | ----------------------------------------------------------- |
| Playwright    | the `tag` option: `test("…", { tag: ["@scenario:id"] }, …)` |
| Vitest / Jest | appended to the test title: `it("… @scenario:id", …)`       |
| Maestro       | the flow config `tags:` list: `- scenario:id`               |

**Guidelines:**

- MUST author the catalog as a human-reviewable file, not a list in code, so journey completeness is judged in review.
- MUST add a catalog row when a change introduces a new user-facing journey, in the same change as the test that asserts it.
- MUST tag the test that **asserts** the journey's outcome — never a test that merely passes through the journey on its way elsewhere; executed ≠ asserted, and a tag on a pass-through test overstates coverage.
- MUST NOT rename a scenario id without updating every tag that references it in the same change — the id is the contract between catalog and tests.
- MUST keep facet tags (area, priority) consistent with the tagged scenario's catalog row, so filtered runs and grouped reports stay trustworthy; the gate flags a facet that disagrees with any scenario the test tags.
- SHOULD carry an `@area` / `@priority` facet only when it matches every scenario the test asserts — a test spanning scenarios from different areas or priorities should carry the `@scenario` tags alone (or be split), so the facet check stays meaningful.
- SHOULD keep genuinely-untested journeys in the catalog with an honest priority so the report shows real gaps; writing tests for surfaced gaps is follow-up work, not a prerequisite for reading the metric.
- MUST count a scenario as covered only when a **passing** test carries its tag; a failing or skipped test leaves it uncovered.

**Example — a catalog row and the test that asserts it:**

```markdown
| Id           | Title                                     | Area  | Priority |
| ------------ | ----------------------------------------- | ----- | -------- |
| cards.browse | Visitor browses and filters the card list | cards | must     |
```

```ts
test(
  "Card database browse and filter",
  {
    tag: ["@scenario:cards.browse", "@area:cards", "@priority:must", "@smoke"],
  },
  async ({ page }) => {
    // ... asserts the browse-and-filter outcome ...
  },
);
```

## Phased Gate

Gating in phases lets the metric land before coverage is complete: pin the critical journeys first, grow breadth without blocking every merge.

**Guidelines:**

- MUST hard-gate `must`-priority scenarios at 100% first: a `must` row with no passing asserting test blocks.
- MUST fail the run on structural tag errors — an unknown scenario id, or a facet tag that disagrees with the catalog — in every phase; a silently mis-joined tag corrupts the metric.
- SHOULD keep `should` / `may` coverage report-only until the `must` gate is stable, then tighten deliberately.
- SHOULD keep the default e2e run threshold-free (report plus structural errors only) so it stays fast, and enforce the `must` gate in a dedicated coverage command or CI job.
- MUST NOT treat a green coverage gate as e2e verification on its own — the gate checks tag bookkeeping; only the test run proves the journeys pass.

## Where the Gate Lives

The reporter can be an out-of-band script that reads the runner's machine-readable report, or an in-suite meta-test that runs inside the suite itself. Either works; pick the one that fits the runner.

**Guidelines:**

- SHOULD split the gate into a runner-agnostic core that parses the catalog and a normalized `{ title, tags, status }` results array, plus a thin per-runner adapter that maps the runner's own report into that array — so switching runners replaces the adapter and leaves the join and gate logic untouched.
- MAY instead implement the gate as an in-suite meta-test that reads the catalog and scrapes `@scenario:` tags from the sibling test files, when that is simpler for the runner.
- SHOULD keep the gate fast and free of the system under test (pure file/report bookkeeping) so it can run anywhere, including where the app cannot be launched.
