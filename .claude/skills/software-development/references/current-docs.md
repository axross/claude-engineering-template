# Current External Documentation

Apply this reference when a change depends on framework, platform, service, or tool behavior that may have changed since the local skill was written. Official docs are part of the implementation context for these surfaces.

Its subject is **vendor** documentation — someone else's product, whose behavior can change without notice. For the project's own contributor documentation, and what to do when it is silent, see [project-docs.md](./project-docs.md).

## When to Refresh Docs

A dependency that ships breaking changes or new defaults between releases makes memory an unreliable source: guidance written months ago describes a version the project may no longer be on. Which of a project's dependencies move that fast is a property of the project, so it is the project's own documentation that names them.

The underlying principle — that anything the outside world can change is verified against a current source rather than recalled — is owned by the project's external-research practices, together with the source hierarchy, version-matching, the stop condition, and the rule on naming what was consulted. Consult those whenever a claim about a vendor's behavior is in play. This section covers only what that principle requires of a code change.

**Guidelines:**

- MUST consult current official docs before changing behavior governed by a fast-moving framework, service, or tool the project depends on.
- MUST treat the dependencies the project documents as fast-moving as the ones this rule covers, and add a dependency to that list when the project takes on another.

## Configuration and Discovery Files

Some files are especially sensitive because a small mismatch breaks tooling or agent discovery outright rather than degrading one document — a linter configuration, a formatter configuration, an agent skill's frontmatter, a hook or settings file. A change there fails globally, and it fails on syntax the vendor controls.

**Guidelines:**

- MUST refresh the owning tool's official docs before changing a configuration or discovery file whose mismatch would break the toolchain or agent discovery rather than a single output.
- SHOULD consult the project's documentation for which of its files carry that risk, rather than inferring it from a filename.
