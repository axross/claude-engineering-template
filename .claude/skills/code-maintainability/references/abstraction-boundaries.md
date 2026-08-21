# Abstraction Boundaries

Apply this reference to decide what belongs inside one unit, and to keep a change on the right side of the project's separation of concerns — while writing new code, and while reviewing where a change put it.

## Cohesion

Cohesion is what the parts of a unit are grouped by, and it decides whether an abstraction was worth making at all. A unit built on a weak grouping cannot be named, tested, or changed as one thing, so every later reader pays for a grouping that was convenient once.

| Level (strongest first) | Its parts are grouped because                     | Where it stands                              |
| ----------------------- | ------------------------------------------------- | -------------------------------------------- |
| Functional              | every one is essential to a single job            | the target at every granularity              |
| Sequential              | each one's output is the next one's input         | the floor for a module bundling several jobs |
| Communicational         | they all read from or write to the same data      | the same floor                               |
| Procedural              | they run in a fixed order, for different jobs     | below the floor — split it                   |
| Temporal                | they happen at the same moment                    | not a basis for an abstraction               |
| Logical                 | they are the same kind of thing, picked by a flag | not a basis for an abstraction               |
| Coincidental            | they happened to be sitting together              | not a basis for an abstraction               |

The scale is **non-linear**: functional cohesion sits far stronger than the rest, and coincidental and logical sit far weaker than the intermediate levels — so a procedural grouping should not read as nearly as strong as a communicational one just because the table lists it one row down.

A unit's own name is the cheapest test of where it sits, and it reads straight off the diff without reconstructing the design:

| The name                                                        | What it says about the unit                                             |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| one verb plus one object (`deserializeTemplate`, `sendRequest`) | one job — functionally cohesive                                         |
| two verbs, or an `and` (`parseAndSendRequest`)                  | two concerns wearing one name                                           |
| a vague object (`parseData`)                                    | the data model is under-schematised, or the unit covers several targets |

**Guidelines:**

- MUST build a function or class on functional cohesion — one job every part is essential to — and treat one whose parts are grouped by shared timing, by a kind selected through a flag, or by nothing at all as the finding.
- MUST hold a module that bundles several jobs to sequential or communicational cohesion at worst, and split one whose parts merely run in a fixed order for unrelated jobs.
- SHOULD read a name carrying two verbs or an `and` as two concerns in one unit and split it rather than renaming around it; a name of that shape denoting one settled operation is the exception to argue for, not to assume.
- MUST treat a vague object in a name as evidence that the data model needs schematising or that the unit spans several targets, and fix whichever it is rather than accepting the name.
- MUST justify a new abstraction by what its cases have in common — their kind, or the purpose they serve — and state that commonality; whether two similar-looking blocks qualify at all is decided by the duplication rules in [scope-discipline.md](./scope-discipline.md).
- SHOULD treat a name that needs a descriptive clause to stay accurate as evidence the unit should be split.

## Server / Client Boundary

Fetching from the client ships data-access code into the browser bundle and adds a network round-trip the server could have avoided. This whole section is conditional on the project drawing a server/client split — defer to the project's own component convention, if it defines one, and skip these rules where it does not.

**Guidelines:**

- MUST keep data fetching (a network request, opening a data-layer connection, calling a data-access function) out of a client-side component; lift it into the parent server-side component or its data-access module. A client component that fetches is the finding.
- MUST keep a client-side component from importing data-access modules, the data-layer SDK, or any server-only module — that leaks server code into the client bundle.
- MUST split a server-side component that needs client-only state, lifecycle, event handlers, or browser APIs into a server-side container and an interactive client child rather than converting the whole component.
- MUST NOT pass a server-only value type (e.g., an unresolved async/promise prop) into a client component where the framework forbids it.

## Domain Pipeline Boundary

A shared pipeline copied into a second place drifts out of sync, so a fix applied to one copy silently skips the rest.

**Guidelines:**

- MUST keep a shared domain pipeline (e.g., a content-transformation chain) behind its single owning module; a new component that re-creates the chain outside that module is the finding, per the project's own domain convention, if it defines one.
- MUST run domain processing on the side of any server/client boundary the pipeline belongs to (server-side only, where the project defines it so).
- MUST pair a new node/element type added to a renderer's component-mapping table with its component import, per the project's own domain convention, if it defines one.

## Cross-Tier Imports

An import that runs against the tier hierarchy couples layers meant to stay independent, eroding the boundaries the tiers exist to enforce.

**Guidelines:**

- MUST keep tier imports pointed the right way: a group-shared or global module MUST NOT import from a specific route's route-local code, so shared code never depends on route-local code. An import that crosses a tier in the wrong direction is the finding.
- SHOULD prefer the project's configured path aliases over deep relative imports (`../../../`) that cross more than two directory levels.
