<!-- Example. Part of the example docs tree shipped with living-project-documentation. -->

# Directory Structure

Where a file goes in this repository, what it is called, and which package may import
which.

The general discipline — put shared logic at the lowest tier with more than one
caller, name a file for what it holds — belongs to the installed code-maintainability
capability. What follows is this repository's own tiers and paths, which nothing
outside it could infer.

## The Tree

```text
<root>
├── api/                       # the API package: creates jobs, serves the dashboard
│   ├── routes/<route>/
│   │   ├── _components/       # used by this route only
│   │   └── handler.ts
│   └── _/                     # feature-agnostic modules shared across routes
├── worker/                    # the worker package: claims jobs, runs attempts
└── shared/                    # the few modules both packages import
```

## Tiers

A module sits at the lowest tier that has more than one caller, and MUST NOT be
promoted in anticipation of a second — a module promoted early is one every package
pays to read while one of them uses it.

`shared/` MUST stay deliberate. A module there is imported by two deployables that
release independently, so a change to it changes both at once. It belongs there only
when both packages need the same _behaviour_, never merely the same shape.

The import direction is one-way: `api/` and `worker/` MAY import `shared/`; `shared/`
MUST NOT import either, and the two packages MUST NOT import each other. They deploy
separately, so a cross-package import compiles locally and fails in production, where
the other side's version is whatever was deployed last.

## Naming

A file is named for what it holds, in kebab-case; a directory, for the thing its files
are about. A route directory MUST match the URL segment it serves — the router derives
one from the other, so a mismatch is a 404 nobody can see in review.

`_`-prefixed directories are not routed. Anything under `routes/` without the prefix
becomes a URL, so a helper dropped there unprefixed is published.
