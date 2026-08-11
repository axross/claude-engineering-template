# Frontmatter and Naming

Apply this reference when authoring or editing a `SKILL.md` frontmatter block or choosing the directory name for a skill.

## Required Fields

The required frontmatter fields are the discovery contract. The runtime reads `name` and `description` before loading the body, so mistakes here can make a correct skill invisible.

**Example:**

```yaml
---
name: code-review-guidelines
description: The review methodology for pull requests and local diffs...
---
```

Every constraint on those two fields — that both are present, that `name` is kebab-case, within 64 characters, and matches its directory, and that `description` stays within its length cap — is decided mechanically by `scripts/check-skill-frontmatter.mjs`, which the parent `SKILL.md` requires you to run after editing frontmatter. This section therefore states the contract and carries no rules of its own.

## Frontmatter Is YAML, and a Description Is a YAML Scalar

Frontmatter is parsed as YAML, so a `description` is not free text: a handful of constructs make a parser read the value as structure rather than as prose. The failure is severe and quiet. A host either refuses the skill outright — `Nested mappings are not allowed in compact mappings` — or, worse, loads it carrying a value the author never wrote, because ` #` opens a comment and truncates everything after it and a leading `&` is read as an anchor and dropped.

**Example:**

```yaml
# Breaks: the colon before a space opens a nested mapping.
description: The agentskills.io format: capability framing and discovery metadata.

# Works: quoting makes the same text a plain scalar again.
description: "The agentskills.io format: capability framing and discovery metadata."
```

The hazards are a colon before a space or at the end of the value, a `#` at the start or after a space, and an opening ``[ { ] } , & * ! | > % @ ` " '`` — or an opening `-`, `?`, or `:` before a space. A colon with no space after it is fine, which is why `Top 10:2025` needs no quoting.

Inside a double-quoted value only YAML's own escapes are legal: `\0`, `\a`, `\b`, `\t`, `\n`, `\v`, `\f`, `\r`, `\e`, `\"`, `\/`, `\\`, `\N`, `\_`, `\L`, `\P`, a literal escaped space, and the numeric `\xNN`, `\uNNNN`, and `\UNNNNNNNN` forms. Anything else — `\d`, `\s`, `\w` and the rest of the regex-flavored set a reader reaches for by habit — is a parse error, not a literal backslash.

**Guidelines:**

- MUST quote a `description` that carries any of the constructs above, rather than rewording to avoid them — the text is the routing signal, and quoting costs nothing but two characters.
- MUST escape a literal `"` as `\"` inside a double-quoted value, and double a literal `'` to `''` inside a single-quoted one; an unpaired quote ends the scalar early and the rest of the line becomes a parse error.
- MUST use single quotes, or a numeric escape, to carry a backslash sequence YAML does not define; a double-quoted value containing `\d` or `\s` is rejected outright rather than read as a literal backslash.
- SHOULD leave a description unquoted when it carries no hazard, since quoting every value forces escape handling on the many descriptions that need none.
- MUST NOT treat a passing `scripts/check-skill-frontmatter.mjs` run as proof that a host will load the skill unless that run includes this check; a validator reading frontmatter with a regex cannot see a construct that only a parser resolves.

## Invocation-Control and Discovery Fields

Claude Code merged custom slash commands into skills: a skill at its skill root (`.claude/skills/<name>/SKILL.md`) is invocable as `/<name>` by the human, and the model can also load it when its discovery metadata matches the task. A set of Claude-Code-defined frontmatter fields controls both directions. They are not part of the portable agentskills.io spec — treat them as harness fields (see [Host-Project Harness Fields](#host-project-harness-fields)) — so manage them deliberately on every skill in a project that targets Claude Code, and substitute the equivalents on a host that defines its own.

| Field                      | Meaning                                                                                                                                                                                       | Default |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `when_to_use`              | Trigger context appended to `description` in Claude Code's skill listing. Redundant where `description` already front-loads the trigger, and invisible on every other host — prefer one field | —       |
| `argument-hint`            | Hint shown in the `/` autocomplete telling the human what arguments the skill expects                                                                                                         | —       |
| `arguments`                | Named positional arguments substituted as `$name`; values are shell-quoted, so a multi-word value lands in one argument only when the invoker quotes it                                       | —       |
| `user-invocable`           | `false` hides the skill from the `/` menu; the model can still load it                                                                                                                        | `true`  |
| `disable-model-invocation` | `true` keeps the skill and its discovery metadata out of the model's reach; only a human can invoke it                                                                                        | `false` |

Two skill archetypes take these fields differently: a **guideline skill** is reference rules the agent consults while working (usually the bulk of a skill root); a **workflow entry-point skill** is a runnable workflow a human launches as `/<name>`, such as a change-loop driver or a session-handoff wrapper.

**Guidelines:**

- MUST state a skill's trigger in `description`, front-loaded, per the [description-writing](./description-writing.md) reference — never only in a host extension such as `when_to_use`, which every host that does not define it ignores.
- MUST set `user-invocable: false` on guideline skills — they are reference material the model routes to, not workflows a human launches from the `/` menu.
- MUST give every workflow entry-point skill an explicit `user-invocable: true` (the default, written out for contrast with its siblings) and an `argument-hint`, and state in `description` both when to invoke the skill and when not to.
- MUST declare `arguments` only when the skill's invocation takes discrete single-token parameters; a free-form or multi-word target MUST keep `$ARGUMENTS` instead, because shell-style quoting would otherwise split it across positional arguments.
- SHOULD reserve `disable-model-invocation: true` for skills that must never run without an explicit human invocation; an entry point that should stay model-invocable instead draws the boundary with a do-not-invoke clause in `description`.
- MUST re-verify that discovery still routes to the skill after changing `name`, `description`, or an invocation-control field, since those fields — not the body — are what a runtime reads to decide whether to load it at all.

## Other Optional Fields

Optional spec fields are useful only when they carry real runtime or distribution meaning. Most project-local skills need none of them.

**Guidelines:**

- MAY include `license` when the skill is licensed differently from the surrounding project.
- MAY include `compatibility` when the skill has concrete environment requirements.
- MAY include `metadata` as a string-to-string map for client-specific extensions.
- MAY include `allowed-tools` to pre-approve tools; its semantics are host-defined — some hosts (e.g., Claude Code) enforce it after a workspace-trust prompt, others ignore it.
- SHOULD omit optional fields that do not change how the skill is discovered, distributed, or executed.

## Host-Project Harness Fields

Host runtimes define non-spec fields their harness enforces — the invocation-control fields above are Claude Code's. Treat these as runtime configuration, not clutter, and mind them when porting a skill between hosts.

**Example:**

```yaml
---
name: orchestration-guidelines
description: The coordination rules for multi-step local workflows...
user-invocable: false
---
```

**Guidelines:**

- MUST preserve existing harness fields when refining a skill.
- MUST NOT add a new harness field to only one skill unless the host project explicitly uses per-skill variation.
- SHOULD apply new harness fields project-wide when they represent runtime policy, the way a Claude Code project applies `user-invocable`.
- MUST fold an orphaned host discovery field back into `description` when porting to a host that does not read it, so the trigger survives the port rather than going silently unread.
- MUST document harness-field substitutions where the receiving project records its skills — its discovery metadata, or a written index where the host maintains one — when porting.

## Naming Rules

Kebab-case names are portable and predictable. The name should communicate the durable responsibility, not an incidental implementation detail. The kebab-case form itself — and the uppercase, underscore, dot, space, and stray-hyphen shapes it excludes — is decided by `scripts/check-skill-frontmatter.mjs`, which the parent `SKILL.md` requires you to run; what follows is the part a regex cannot judge.

**Guidelines:**

- SHOULD describe the responsibility, such as `application-security` or `software-instrumentation`.
- SHOULD avoid actor names such as `security-reviewer` unless the host's taxonomy is explicitly actor-based.
- SHOULD avoid names that overlap conceptually with existing siblings.

## Naming for Discoverability

Discovery starts with the skill name and description. A name that already implies its trigger leaves the description more room for edge cases and user phrasings.

**Guidelines:**

- SHOULD choose a name that a future contributor can map to the right skill on the first try.
- SHOULD keep naming conventions consistent across the skill set.
- SHOULD name the skill as a capability — what it lets an agent do — per [capability-framing.md](./capability-framing.md), which owns the preference and the suffixes to avoid.
- SHOULD use a plain verb name (`address`, `handoff`) for a workflow entry-point skill whose `/<name>` invocation reads as a command.
- MUST rename a skill when its existing name would misroute likely prompts after a scope change.
