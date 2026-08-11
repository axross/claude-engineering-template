# Evidence and Reporting

Apply these rules so every finding is verifiable, actionable, and traceable back to either the code or a concrete failure path.

## Citation Requirements

A finding the author cannot locate is one they cannot act on, so every finding is anchored to a precise, repo-relative `file:line`.

**Guidelines:**

- MUST cite a `file:line` (or `file:line-line` for a range) for every finding, using a repo-relative path from the project root.
- MUST quote the offending code (one to five lines) directly under the citation when the surrounding context is needed to understand the finding.
- MUST name the specific rule or contract a finding violates, in plain terms, rather than appealing to unnamed "best practices".
- MUST NOT invent line numbers or paths; re-read the file when unsure.

## Fix Snippet Format

A concrete diff turns a finding into something the fixer applies directly, instead of re-deriving the solution from a prose description.

**Example:**

````markdown
[CRITICAL] src/records/get-record.ts:53 — Unsanitized `id` used in a query filter without a string assertion.
Risk: A non-string `id` (e.g., an array from request-param coercion) bypasses the equality filter and can return records the caller is not authorized to read.
Fix:

```ts
- where: { id: { equals: id } },
+ where: { id: { equals: String(id) } },
```
````

**Guidelines:**

- MUST provide a concrete fix snippet for every Critical and Major finding. Minor findings SHOULD include one; Nits MAY omit it when the suggestion is self-evident.
- MUST format a fix as a unified-diff block — `-` for the removed line, `+` for the added line — matching the surrounding source's indentation.

## Report Structure

The reviewer emits findings in this exact section order so a human or a downstream agent can parse the report the same way every time.

1. **Summary** — 2-4 sentences. MUST end with the verdict (Request Changes / Approve with Nits / Approve).
2. **Strengths** — a short bullet list of what the change does well. MUST contain at least one item unless the diff is trivially small.
3. **Critical Findings** — numbered. Each entry: `[CRITICAL] file:line — short title`, then a "Risk:" line, then a "Fix:" snippet, then a "Rule:" line naming the violated rule when applicable.
4. **Major Findings** — same structure, prefixed `[MAJOR]`.
5. **Minor Findings & Nits** — concise bullets, prefixed `[MINOR]` or `[NIT]`, each with a `file:line`. Fix snippet optional.
6. **Pre-existing Observations** — bullets for issues outside the diff scope; do not assign a blocking severity here.
7. **Verification Evidence** — the commands, manual checks, logs, or reasoned checks the reviewer relied on. MUST name skipped required checks and residual risk.
8. **Recommended Actions** — an ordered checklist the author completes before re-requesting review, including the verification step after each Critical or Major fix.

**Guidelines:**

- MUST emit the report sections in the exact order above; omit a section only when it has no content (except Summary, which is always present).
- MUST keep every finding in the findings sections — do not bury a defect inside the Summary prose.

## What Counts as Evidence

Evidence is what lets a reader confirm a finding without taking the reviewer's word for it — which is exactly what separates the items below from mere assertion.

- A named rule or a reproduced failure path (e.g., "if `params.id` is an array, line 22 returns `true` and the guard is skipped") is evidence. A "smells wrong" hunch is not.
- A completed command, a manual check, an inspected diff, or a log snippet is evidence only when the report states what was checked and what result was observed.
- A failing or missing-but-required check (e.g., the lint gate would error on the changed file) is evidence when the report states the expected outcome explicitly.

**Guidelines:**

- MUST replace a vague appeal to "best practices" with a specific rule and failure mode, or drop the finding.
- MUST name every skipped required check and why it was skipped; a skipped check is residual risk, never success evidence.

## When the Reviewer Cannot Verify

An issue the reviewer could not actually confirm can send the author chasing a non-bug when it is presented with full confidence.

**Guidelines:**

- MUST mark a finding "needs verification" and lower its severity by one step when it cannot be confirmed without running code (e.g., a performance claim with no measurement).
- SHOULD name the specific command or test the author should run to confirm or refute the finding.
