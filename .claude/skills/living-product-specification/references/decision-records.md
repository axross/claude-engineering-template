# Decision Records

Apply this reference when writing a decision record, superseding one, or judging
whether a decision warrants a record at all.

## When a Record Exists

Most decisions need no record. A record is owed when **both** hold:

1. The decision **constrains future work** — a later change has to honour it or
   deliberately overturn it.
2. Its rationale **cannot be recovered from the code**. Reading the
   implementation tells you what was chosen, not what else was on the table or
   why it lost.

Without the second condition a log accretes one record per change and becomes
noise the log carries forever; without the first it fills with observations
nobody is bound by.

**Guidelines:**

- MUST test a candidate decision against both conditions before writing a
  record, and leave it to the change's own history when either fails.
- MUST NOT write a record for a choice the code states plainly — a library's
  API, a naming convention a linter enforces, a refactor with no trade-off.
- SHOULD write the record at the moment the decision is made, while the rejected
  alternatives are still known; reconstructing them later produces a rationale
  nobody actually held.

## The Filename

**Example:**

> `decisions/2026-07-02-move-scheduling-to-a-queue.md`

The date prefix is chosen over sequential numbering because two changes
developed on separate branches produce **colliding** sequence numbers that have
to be renumbered by hand at merge — and renumbering breaks every reference that
already pointed at them.

**Guidelines:**

- MUST name the file `YYYY-MM-DD-<decision-in-kebab-case>.md`.
- MUST use the date the decision was **made** — not the day the file was
  created, merged, or last touched.
- MUST read the date from the environment (`date +%F`) rather than recalling it.
  A guessed date is a silent error: it sorts wrongly and nothing contradicts it.
- MUST NOT change a filename after the record exists. Every inbound reference
  depends on it, and stability is what makes those references worth writing.
- MUST state the **decision** in the trailing segment, not its topic —
  `use-postgres-over-dynamodb`, never `database`. A reader scanning the
  directory should learn what was decided without opening anything.

## The Frontmatter

A decision record — and only a decision record — carries frontmatter. The rest
of `docs/` is plain Markdown.

```yaml
---
status: accepted
---
```

```yaml
---
status: superseded
superseded_by: 2026-07-02-move-scheduling-to-a-queue.md
---
```

`status` carries exactly two values. `proposed` and `rejected` are deliberately
absent: the existence condition above already excludes both. A proposal is not
yet a constraint, so it belongs in the plan that proposes it; a rejected option
belongs in that plan's alternatives, next to the reasoning that rejected it.

There is no `date` field. The filename owns the date, and a second copy is a
second thing to keep true.

**Guidelines:**

- MUST give every record a `status` of exactly `accepted` or `superseded`.
- MUST name the replacement in `superseded_by`, as a bare filename within
  `decisions/`, whenever `status` is `superseded` — and set neither without the
  other. A record superseded without its status set makes every link to it read
  as current, which is a failure nothing else can detect.
- MUST NOT add fields beyond these two. Anything more is a schema to maintain,
  and the body is where a decision is actually explained.

## The Body

There is no mandated section list — a decision that needs three sentences should
be three sentences. What a reader comes for is the reasoning, which means the
rejected options matter as much as the chosen one.

**Guidelines:**

- SHOULD state the context that forced a choice, the option taken, the options
  rejected with why, and the consequences accepted along with it.
- SHOULD write in the past tense about the decision and the present tense about
  its consequences; the decision is a historical act, its constraint is current.
- MUST NOT restate what the constrained document already says — the product's
  behaviour, a convention, or a procedure. That belongs to the spec,
  convention, or operational document the decision constrains, and a copy
  here goes stale the first time it changes without the decision changing.

## Superseding

A decision is replaced by writing a new record, never by editing the old one's
substance. The superseded record stays readable exactly as it was, because the
reasoning it contains is what makes the replacement legible.

The one sanctioned edit to an existing record is flipping its `status` to
`superseded` and adding `superseded_by`.

**Guidelines:**

- MUST write a new record for the new decision, referencing the old one by
  filename in its body.
- MUST update the old record's frontmatter — `status`, then `superseded_by` — in
  the same change, and change nothing else in it.
- MUST repoint every document that linked to the superseded record, in that same
  change. Such a link still resolves, so nothing except a status-aware check
  will ever notice it pointing at replaced rationale.
- MUST NOT delete a superseded record. The log is the history; a deleted record
  takes the reasoning for the current state with it.
