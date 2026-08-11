# Naming and Organization

Apply this reference to place changed files where they belong with the name they should carry — while writing them, and while reviewing where someone else put them.

## File Naming

A file that breaks the surrounding naming convention is harder to locate and makes readers and tooling second-guess what kind of module it is.

**Guidelines:**

- MUST name a new source/style file on the project's file-naming convention; a name that breaks it — `RecordHeader.tsx` or `record_header.tsx` in a kebab-case project — is the finding while reviewing.
- MUST give a new component the co-located sibling file its convention requires (e.g., a paired style-module file when the component renders styled DOM); a missing sibling is the finding.
- SHOULD match a co-located sibling's base name to its primary file (e.g., `record-header.tsx` with `record-header.module.css`, not `header.module.css`) when the convention is matched base names.

## Directory Tier

Place shared logic at the lowest tier that has more than one caller. Most projects progress from route-local code, to a group-shared tier, to a global/shared tier — a module planted too high invites unrelated callers, and one planted too low gets copied when a second caller appears.

| Tier            | When to use                                       |
| --------------- | ------------------------------------------------- |
| Route-local     | Used only by the files of one route/feature       |
| Group-shared    | Used by ≥ 2 routes/features within the same group |
| Global / shared | Used broadly across the application               |

Resolve the tier from the caller count, not from where a file is convenient to drop:

```mermaid
flowchart TD
  A[New module to place] --> B{More than one<br/>caller?}
  B -- No --> C[Route-local tier<br/>co-locate with its one caller]
  B -- Yes --> D{All callers within<br/>one feature group?}
  D -- Yes --> E[Group-shared tier]
  D -- No --> F[Global / shared tier]
```

**Guidelines:**

- MUST place a module used by only one route/feature in that route's local tier; the same module sitting in a group-shared or global tier is the finding — pull it down.
- MUST promote a route-local module to the lowest shared tier covering all its callers once a second route/feature imports it; a route-local file imported across routes is the finding.
- MUST keep a helper or component out of any location the framework would misinterpret (e.g., a non-route file dropped directly into a directory the framework treats as a route segment).

## Route File Layout

When a change adds or moves a route/feature, follow the project's own routing convention, if it defines one — placement conventions are project-specific, so this is a conditional rule, skipped where the project has none. Typical co-location expectations include:

- A props/types module co-located with the route entry, declaring the route's input shape (params and query, including any framework-required async typing).
- A not-found / fallback module co-located when the route can fail to resolve (e.g., a dynamic record id/slug that may not exist).
- Social-image / metadata asset files co-located with the route they belong to.
- A request handler living in its own sub-directory, never colliding with a route's page entry.

**Guidelines:**

- MUST place added or moved files per the project's own structure or routing convention, if it defines one, before considering the placement settled; where the project defines none, this rule does not apply.

## Identifier Naming

A symbol named or cased unlike its neighbors makes the reader stop to check whether the difference carries meaning.

**Guidelines:**

- MUST match a new identifier's casing and pattern to its neighborhood; the finding is a symbol that breaks it — e.g.:
  - A symbol cased differently from its siblings (`PascalCase` where siblings use `camelCase`, or vice versa).
  - A data-access function that breaks the sibling naming pattern (`fetchRecord` when siblings are `getRecord`, `getRecords`, `getSettings`).
- SHOULD prefer full words over opaque abbreviations in a new identifier (`record`/`user`, not `rec`/`usr`).
- SHOULD keep a value on the project's established suffix/alias convention for its kind (e.g., an unresolved async value carrying the expected naming alias), per the project's own component convention, if it defines one.

### Default Vocabulary

A project with an established convention has already answered these questions, and its convention wins. So does a capability that owns the kind of value being named, and so does a platform or host API the value crosses into: this table is the fallback for a name nothing else governs, never an override of something that already does. Where nothing governs it, a stated vocabulary keeps two contributors from inventing two — and it makes a name carry its kind, so a reader learns what a value is without chasing its declaration.

| Pattern              | Names                                                                       | Example                     |
| -------------------- | --------------------------------------------------------------------------- | --------------------------- |
| `is<Noun>`           | a boolean, or a function returning one, saying the subject is that noun     | `isUser`                    |
| `is<Adjective>`      | a boolean, or a function returning one, saying the subject is in that state | `isEnabled`, `isApplicable` |
| `<pastParticiple>At` | the instant an event happened, or will happen                               | `expiredAt`                 |
| `<verb>In`           | the span remaining until an event happens                                   | `expiresIn`                 |
| `<plural>`           | a list- or array-shaped value                                               | `users`                     |

**Guidelines:**

- MUST apply this vocabulary only where nothing already governs the name — the project's own convention, a capability that owns that kind of value (a component capability owning prop names, for one), or the platform or host API the value crosses into. Where any of those governs, it wins, and a divergence from the table is not a finding.
- MUST put a boolean value, or a function returning one, on the `is<Noun>` or `is<Adjective>` form wherever it asks whether the subject **is** that thing or is in that state; a boolean asking something else (possession, capability, obligation) is outside this table and takes the form its own question calls for.
- MUST keep a boolean on the bare form a platform or host API already uses where the value crosses that boundary — a DOM-shaped prop mirroring an HTML boolean attribute (`disabled`, `checked`, `required`), a wire field, a configuration key — rather than prefixing it into a name that boundary does not use.
- MUST name an instant with the `At` suffix on a past participle, keeping the past participle when the instant lies in the future (`expiredAt` for an expiry not yet reached), so the suffix marks a timestamp rather than a tense.
- MUST name a span remaining until an event with the `In` suffix on the plain verb (`expiresIn`), so it is never read as the instant the `At` form carries.
- MUST reserve a plural noun for a value that is a list or an array, and MUST NOT pluralize the name of one that is not.
