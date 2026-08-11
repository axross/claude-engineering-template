# Audit Checklist

Apply this reference when auditing a skill tree for structure, discoverability, links, and source-of-truth boundaries.

## Audit Order

A useful audit moves from inventory to mechanics to judgment. Mechanical checks catch broken structure; content review catches overlap, stale assumptions, and missing project-specific guidance.

1. Inventory skills and reference files.
2. Verify skill discovery metadata (`description`) and parent `SKILL.md` links.
3. Check frontmatter against the [frontmatter-and-naming](./frontmatter-and-naming.md) policy.
4. Check parent routing-section format, section anatomy, and RFC-2119 guideline bullets.
5. Check relative links outside code fences resolve, and that cross-skill references are topic-based rather than path links into another skill.
6. Review content ownership and project fit.
7. Report prioritized improvement items.

**Guidelines:**

- MUST inventory every `SKILL.md` and reference file under the skill root.
- MUST verify each skill directory has exactly one parent `SKILL.md`.
- SHOULD audit mechanical structure before judging writing quality.
- SHOULD report improvement items in priority order instead of listing every small observation.

## Runnable Structure Validator

Mechanical structure checks should be automated so an audit spends its judgment on content, not on eyeballing frontmatter. This skill bundles three dependency-light Node validators (standard library only), each answering for one kind of edit: `scripts/check-skill-frontmatter.mjs` for the discovery contract, `scripts/check-skill-body.mjs` for the document-body rules, and `scripts/check-skill-references.mjs` for the wiring between a `SKILL.md` and its `references/`. There is deliberately no run-all command — an author who changed one reference file should not have to read findings about frontmatter — so an audit runs the ones its change touched, or all three.

**Example:**

```sh
# One skill, several skills, or a whole skill root (globs expand to skill dirs).
# Substitute the skill root the host reads (.claude/skills, .agents/skills, …).
node skills/agent-skill-authoring/scripts/check-skill-frontmatter.mjs .claude/skills
node skills/agent-skill-authoring/scripts/check-skill-body.mjs .claude/skills
node skills/agent-skill-authoring/scripts/check-skill-references.mjs .claude/skills
```

It verifies, per skill's **frontmatter and layout**: the block parses; `name` is kebab-case, within 64 characters, and matches the directory; `description` is present and within 1,024 **bytes** — measured in bytes because that is the stricter reading and the one a host has been observed to apply, so a description of 1,024 characters carrying non-ASCII punctuation still fails to load; every `references/*.md` file is linked from `SKILL.md` (no orphan references); and no routing-section bullet begins with an RFC-2119 keyword.

It also reads `description` as the **YAML scalar** it is, which is a distinct failure class from the length cap. An unquoted value carrying a construct a parser reads as structure — a colon before a space or ending the value, a `#` at the start or after a space, or an opening ``[ { ] } , & * ! | > % @ ` " '``, or an opening `-`, `?`, or `:` before a space — fails, naming the construct and saying to quote the value. A quoted value is unwrapped first, so its quotes and escapes do not count against the byte cap, and a quoted value the reader cannot resolve fails with a message distinguishing it from the hazard case: unterminated, carrying an unpaired quote, or — inside double quotes — carrying a backslash sequence YAML does not define, since only its own escape set is legal there and `\d` is a parse error rather than a literal backslash. The hazard and escape sets were both derived by running each construct through a real YAML parser rather than from the specification's tables: the two disagree in both directions, and `\` and `~` lead a plain scalar legally despite appearing in the indicator table. This check exists because its absence is a **pass** — the validator reads frontmatter with a regex, so before it a skill no host could load merged with the gate green.

Across each skill's **prose documents** — its `SKILL.md` and every `references/*.md`, but not `scripts/` or `assets/`, which carry payload rather than rules — it further verifies that no `##`+ heading is separated from its `**Guidelines:**` block by nothing but blank lines (a fenced block, table, list, or paragraph all count as the demonstration); that every top-level bullet inside a `**Guidelines:**` block opens with an RFC-2119 keyword, nested bullets exempt; that every relative link resolves inside its own skill directory; and that every `#fragment` matches a heading in its target file, using GitHub's slug rules. A fragment whose target file does not resolve is left to `check-links.mjs` rather than reported twice.

It exits 0 when every skill passes, 1 when any check fails, and 2 on a bad invocation or an unrecognized option.

A host-specific frontmatter extension such as Claude Code's `when_to_use` or `user-invocable` is neither required nor rejected: the Agent Skills specification defines neither, so requiring one would fail a correct skill on every host that ignores it. Whether a skill carries them is a project's own convention to enforce, not this validator's.

Pointed at two paths holding the same skill — a source tree plus the generated copy installed from it — it reports that skill **once**, under whichever path came first on the command line, and notes the collapsed copies. Only an identical verdict collapses, so diverged copies are still reported separately. Listing the source tree first therefore makes every failure name the copy a fix belongs in.

It also reports **advisory warnings**, which never change the exit code: each one surfaces a SHOULD-level rule, or a MUST whose stated exception a threshold cannot see, so a warned skill still passes. A `WARN` line names a document-style `name` suffix (`-guidelines`, `-best-practices`, `-principles`, `-conventions`, `-rules`, `-requirements`) or a `description` opening in document voice (`This skill …`, `Guidelines for …`), the mechanically detectable half of [capability-framing.md](./capability-framing.md); a `SKILL.md` over the ~5,000-token budget in [progressive-disclosure.md](./progressive-disclosure.md); a section over the guideline-bullet ceiling in [scoping-and-mece.md](./scoping-and-mece.md), reported both as it approaches ten and as it passes ten, since the rule permits exceeding ten with a stated reason; an RFC-2119 bullet outside any `**Guidelines:**` block, which [body-content-style.md](./body-content-style.md) asks for "usually"; a stale plain `Guidelines:`/`Example:` label or a fenced `text` example; and an adverbial hedge immediately after an RFC-2119 keyword. Every detector is deliberately narrow and stays silent on the judgment calls its prose rule owns — the hedging check reads adverbs only, because a volitional verb such as "MUST NOT attempt …" states the prohibited action rather than hedging the obligation.

The token estimate is a **proxy, not a token count**: the validator takes no tokenizer dependency, so it divides a file's UTF-8 byte length by a constant calibrated against this corpus. Bytes are used rather than characters because they err high, the conservative direction for a budget guard; the estimate is good to about ±5%, which is why crossing the budget warns rather than fails. Recalibrate the constant before trusting the estimate on a corpus unlike this one, and read the raw byte count the warning reports alongside it.

**Guidelines:**

- MUST treat exit 1 as a blocker — a structural failure a discovery runtime depends on — and exit 2 as a bad invocation or a path holding no skill, to fix before trusting the result.
- MUST run any script under a skill's `scripts/` that a change touches and confirm its documented exit codes, rather than assuming the edit preserved its behavior — a bundled script is a skill's output surface as much as its prose is.
- SHOULD treat a `WARN` line as a recast prompt to weigh, not a blocker; framing is a SHOULD-level rule and an established name may be worth keeping.
- MUST fix every reported failure, or record why the skill is a deliberate, documented exception.
- MAY extend the validator when the project adopts a new mechanical rule, keeping it dependency-light so it runs anywhere the skill is installed.

## External Link Freshness Audit

A skill that pins a version or mirrors a vendor's option surface should cite the upstream page rather than reproduce it, because a reproduced table goes stale where a reader can see it. The link that replaces the table rots the other way — silently — and neither the skill-structure validators nor `check-links.mjs` can see it: each resolves relative `.md` targets on disk and ignores `http(s)://` entirely. This skill bundles `scripts/link-freshness/check.mjs` to close that gap, a dependency-light Node audit (standard library only) that probes every external URL the tree cites.

**Example:**

```sh
# Offline preview: validate extraction and print the plan, making no request.
node skills/agent-skill-authoring/scripts/link-freshness/check.mjs --dry-run
```

It reports four verdicts and **fails on one**: `alive` (2xx), `moved` (2xx reached through a permanent redirect — informational, since the link still serves the reader), `unverifiable` (403, 429, 5xx, timeout, DNS, TLS — the host refused to answer), and `dead` (404 or 410 surviving a retry). Only `dead` fails the run. That split is the design rather than leniency: a documentation corpus cites dozens of publishers, several of which rate-limit or block datacentre egress by policy, and an audit that went red whenever one throttled a runner would be red most weeks — and a check that cries wolf gets bypassed rather than repaired.

It follows redirects **by hand**, because automatic following hides each hop's status and the audit needs to tell a permanent move from a temporary one. Following by hand means re-requesting whatever host a `location` header names, and that header is written by a remote server. Every hop, the first included, is therefore re-validated against `scripts/link-freshness/address-guard.mjs`, which refuses loopback, RFC 1918, carrier-grade NAT, link-local (`169.254.169.254`), and their IPv6 and IPv4-mapped equivalents. That file also states the DNS-rebinding window the check does **not** close, and why the residual risk is bounded to blind reachability probing.

It exits 0 when no link was confirmed dead, 1 when one was, and 2 on a bad invocation.

**Guidelines:**

- MUST run this audit from a scheduled job on the default branch, so the only URLs ever dereferenced are ones already merged and reviewed.
- MUST NOT give the workflow that runs it a `pull_request` or `pull_request_target` trigger. A `SKILL.md` on a fork's branch is text an outsider writes, and a job that dereferences every URL in it is a server-side request forgery primitive pointed at the repository's egress, reachable by anyone who can open a pull request — the same capability a review harness denies against an untrusted head.
- MUST NOT wire it into a merge gate, a package script, or a session hook: it reaches the network, and a gate that depends on other people's servers being up fails for reasons no contributor can fix.
- MUST keep `unverifiable` and `moved` out of the failure condition when adapting it; widening the audit to fail on a refused answer is what turns it into the check people learn to ignore.
- SHOULD act on a `moved` verdict rather than filing it: a permanent redirect still serves the reader, but a deep link that now lands on a generic documentation index is exactly the rot this audit exists to surface.

## Structural Checks

Structural checks should be repeatable. The bundled validator above automates the frontmatter, naming, reference-linkage, routing-keyword, section-intro, guideline-bullet, link-scope, and anchor checks, and `check-links.mjs` resolves every relative link. Run both first, then use the list below for what they still cannot decide — whether frontmatter is valid YAML beyond the minimal `key: value` subset the validator parses, which `user-invocable` value an archetype takes, whether a routing section uses the expected heading-and-`See` shape at all, whether a section that states rules carries a `**Guidelines:**` block, whether a nested bullet is really a rule in disguise, whether an in-skill cross-reference is topic-based rather than merely well-formed, and whether a stale plain label outside the three the `labels:` advisory matches has crept in — and when auditing by hand. All checks should ignore fenced code blocks so embedded examples do not create false positives.

**Example:**

```sh
find .claude/skills -name '*.md' -print | sort  # or .agents/skills
```

**Guidelines:**

- MUST check that every skill's frontmatter parses as YAML.
- MUST check the invocation-control policy: guideline skills carry `user-invocable: false`; workflow entry-point skills carry `user-invocable: true` plus an `argument-hint`, and declare `arguments` only for discrete single-token parameters.
- MUST check that every parent `SKILL.md` reference-routing section uses `## Section/Topic Name`, `See [file.md](./references/file.md) for:`, and descriptive bullets without RFC-2119-style requirement keywords.
- MUST check that every substantive rule section has a `**Guidelines:**` block after its explanation or demonstration.
- MUST check that every guideline bullet begins with an RFC-2119 keyword.
- MUST check that relative Markdown links outside fenced code blocks resolve; this skill's `scripts/check-links.mjs` automates the check (see [cross-referencing.md](./cross-referencing.md)).
- MUST check that cross-skill references are topic-based and discovery-resolvable, not path links into another skill's `SKILL.md` or `references/` files.
- SHOULD check for stale plain labels such as `Guidelines:` or `Example:` when the project standard is bold subheading-like labels.

## Content Review

Content review asks whether each skill owns one coherent responsibility and gives the agent project-specific information it would not reliably infer.

**Review Questions:**

> Does this rule belong here, or should this skill link to a source-of-truth skill?

> Does the guidance describe the project it now lives in, not the project it was imported from?

> Does the skill explain a local command, fragile behavior, or convention that affects real work?

**Guidelines:**

- MUST identify duplicated source-of-truth rules across sibling skills.
- SHOULD treat a self-contained `skills/`-sourced skill's restatement of a rule another skill owns — repo-native or portable — as the sanctioned Portable Source Exception (see [scoping-and-mece.md](./scoping-and-mece.md)) rather than a defect, provided it defers to the owner where present and reads as a summary rather than a second source of truth.
- SHOULD flag a skill that presents as a document rather than as a capability — a document-style name, `description` opening, or H1 paragraph — per [capability-framing.md](./capability-framing.md).
- MUST identify stale project assumptions, old framework guidance, missing commands, or paths that do not exist.
- SHOULD flag generic advice that does not add project-specific value.
- SHOULD prefer a topic-based cross-reference over copied doctrine when another skill owns the detailed rule.
- SHOULD note where examples, tables, diagrams, or command snippets would make abstract guidance easier to apply.

## Report Shape

The audit report should separate pass/fail mechanics from improvement planning. This keeps the user from confusing structural breakage with optional polish.

**Guidelines:**

- MUST state which structural checks passed, failed, or were not run.
- MUST list broken links, missing guideline blocks, or non-RFC guideline bullets as blockers.
- SHOULD group improvement items by skill or source-of-truth theme.
- SHOULD identify a recommended implementation order when multiple skills need coordinated edits.
- MUST state whether files were changed or the audit was analysis-only.
