# Project Skill Archetypes

Apply this reference when creating the project-specific skills a project-initialization pass scaffolds (such as Claude Code's `/init`) — a structure skill, a component skill, and a UI/design skill — or when auditing whether an existing project skill covers the topics its archetype expects.

## The Ownership Triangle

The three scaffolded project skills divide one surface without overlap: the structure skill owns where files live, the component skill owns how surfaces are built, and the UI/design skill owns how they look. When each skill's opening paragraph names what its neighbors own, an agent that loads the wrong skill is rerouted immediately instead of finding duplicated rules.

**Guidelines:**

- MUST give each of the three skills exactly one side of the triangle: placement (structure), construction (component), appearance (UI/design).
- MUST name, in each skill's opening paragraph, which neighboring skill owns the adjacent concerns, by topic (resolved via skill discovery), not by path link.
- MUST keep the detailed wording of a shared rule in one owning skill and let neighbors reference it by topic, per [cross-referencing.md](./cross-referencing.md).
- SHOULD route appearance decisions ("which color role, which control") to the UI/design skill even when they arise mid-implementation.

## Structure-Skill Skeleton

A structure skill is a map, not a rulebook: the stack facts an agent needs before editing, a path table, and placement rules that delegate semantic decisions to the skills that own them.

**Skeleton:**

1. Opening paragraph: what the project is, plus the neighbor-ownership sentence.
2. **Stack** — factual bullets: runtime/framework, language, package manager, lint/format tooling, test tooling, directory-structure convention, business-logic structure, state-management and validation libraries, database engine and ORM/db-wrapper, styling approach.
3. **Top-level layout** — a `| Path | Owns |` table covering every directory an agent will touch.
4. **File placement** — guideline bullets for where each kind of new file goes.

**Guidelines:**

- MUST list stack facts as short factual bullets (versions, import aliases, config filenames), not tutorials.
- MUST describe each significant path by what it _owns_, in a two-column path table.
- MUST delegate placement semantics — such as which component tier a file belongs to — to the component skill; the structure skill states only the resulting directory.
- SHOULD keep colocation rules (tests and styles next to their subject) in the structure skill, since they are pure placement.

## Component-Skill Topics Checklist

The component skill owns construction strategy and mechanics. At full size it usually splits into reference files; each topic below is a candidate reference.

**Topics:**

- **Catalog / inventory** — the existing component list, with a "compose, don't re-create" rule; re-implementing an existing control's look is a review finding.
- **Tier / placement boundary** — what separates generic building blocks from domain components.
- **Promotion criteria** — when a repeated pattern earns a shared component and when a one-off stays local.
- **Styling composition** — how consumers extend a shared component's styling instead of re-declaring it.
- **Logic extraction** — when logic belongs in the component, a hook, or a plain non-UI module.
- **Component anatomy** — naming, exports, prop typing, server/client boundaries where applicable, and test-id hooks.
- **Accessibility** — semantic elements, accessible names, keyboard operability.

**Guidelines:**

- MUST include a component catalog with a "compose existing components instead of re-creating their look" rule, kept current as components are added or removed.
- MUST define the tier boundary with a mechanically checkable import rule: an explicit allowed/forbidden import list plus the check command (e.g., a grep expected to return nothing) that verifies it.
- MUST state promotion criteria: how much duplication earns a shared component, and when a single-consumer pattern stays local.
- MUST cover component anatomy including test-id hooks, and cross-reference the project's testing practices by topic (when it defines them) for how those hooks are consumed.
- SHOULD cover styling composition and logic extraction as their own sections or reference files once the codebase exercises them.

## UI-Design-Skill Pattern

The UI/design skill is decision vocabulary, written in design language; its strongest tools are decision tables and budget rules rather than open-ended prose.

**Patterns:**

- **Role tables** — map each color/token role to its permitted uses (`| Role | Tokens | Used for |`).
- **Decision-shape tables** — map the shape of a user decision to the control that renders it (`| Decision shape | Control |`).
- **Budget rules** — countable limits, in the style of "at most one accent-colored primary action per surface".
- **Multi-channel rules** — never encode meaning in color alone; pair color with an icon, wording, or shape cue.

**Guidelines:**

- MUST express appearance choices as decision tables (role → use, decision shape → control) rather than open-ended prose.
- MUST require a non-color channel (icon, wording, shape) alongside any color that carries meaning.
- SHOULD state budget rules as countable limits an agent can verify on a rendered surface.
- MUST keep the skill in design vocabulary and link the component skill for implementation mechanics, per the ownership triangle.

## Growth Guidance

Archetype skeletons start thin; authority accumulates from the codebase's own history. Worked examples of past decisions teach a boundary better than restated rules.

**Guidelines:**

- SHOULD add worked promoted/not-promoted counter-examples to the component skill as the codebase produces them.
- SHOULD give each boundary rule a mechanical check (a grep or lint rule) when one is possible, and record the command in the skill.
- SHOULD split a topic into a reference file only when it has real content, per [progressive-disclosure.md](./progressive-disclosure.md).
