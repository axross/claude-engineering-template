---
status: accepted
---

<!-- INIT: this record is this repository's own, decided before your project
existed. Delete every file under `docs/decisions/` during adaptation — your log
starts at your own first decision — and reword `docs/index.md`'s Decisions entry
so it stops linking a directory that is no longer there. -->

# Follow an upstream skill rename rather than pinning or forking

The shared library this project installs its agent skills from renamed one of
them on 2026-08-20: `living-product-specification` became
`living-project-documentation`, carrying the same references, scripts, and
example tree under the new name. The rename did not stay inside the library.
Two files here ran that skill's `docs/` validators by path, and four documents
named it in prose, so a rename made upstream was a rename owed here.

Installing these skills from a shared library rather than authoring them here
was settled in
`2026-08-11-install-skills-from-a-shared-library-rather-than-authoring-them.md`,
and that still holds. What it left open is what this project owes when the
library renames one of the skills it installs.

Reinstalled every skill under the new name and carried the rename through this
repository in the same change. The alternative of pinning the previous upstream
revision was rejected: it would freeze eleven other skills' improvements to
avoid one renamed directory, and it defers the same work rather than removing
it. Forking the skill under this project's own ownership was rejected for the
reason the shared-library model was chosen in the first place — a forked copy
stops receiving upstream corrections and its divergence is invisible until it
bites.

Two consequences are accepted. A rename lands as a large diff of generated
files, so the change that carries one is read by its lockfile and its call
sites rather than by its line count. And every place that names an installed
skill by path — a workflow step, a script, a document — is a cost paid at
rename time, which is the argument for referring to a skill by name in prose
and by path only where something has to execute it.
