# Manual Verification Evidence

Apply these rules to verify the author exercised the change in the running app. Manual verification is the **first line** of confirmation per the project's verification rules.

## Required Manual Checks

The reviewer MUST ask the author to confirm (in the PR description or the review thread) that the following were checked when the diff touches the listed surface. Rows marked _(optional)_ apply only if the project has the corresponding capability. Which surfaces a change puts at risk is decided by the skill that owns each changed surface, and the method for mapping them belongs to the project's verification rules; this table does not re-derive either — it adds only the review-side check the reviewer demands for each surface.

| Diff touches                                                                                                             | Required manual check                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any user-facing view, screen, or route-local component                                                                   | The affected surface was exercised — in a runnable app, loaded via the project's dev-server command; in a project with no runnable app, the produced output was reviewed in its rendered form |
| Any data-driven surface that supports non-default content states _(optional)_                                            | The surface was exercised in each non-default content state the data layer supports (e.g., a draft or unpublished state)                                                                      |
| A live-preview / CMS preview path _(optional)_                                                                           | The preview path was loaded inside the data layer's preview/admin surface                                                                                                                     |
| Not-found handling or any routing change                                                                                 | A non-existent identifier was requested and the not-found UI rendered correctly                                                                                                               |
| Metadata generation, if the project produces any (e.g., page metadata, sitemap, robots, social-share image) _(optional)_ | The metadata response was inspected (e.g., view-source, the generated sitemap/robots endpoint, social-share preview)                                                                          |
| The content/markup rendering pipeline _(optional)_                                                                       | A record containing the affected construct was rendered end-to-end                                                                                                                            |
| Error-tracker / instrumentation config _(optional)_                                                                      | The app starts without throwing, and a test exception was confirmed to reach the error tracker (or the author confirmed reporting is intentionally disabled in dev)                           |

**Guidelines:**

- MUST flag a Major when the diff touches a row in the table above and the author has not confirmed the corresponding check.

## Dev-Server Output Inspection

New warnings in the dev log are the app's earliest signal that something regressed or is misconfigured, well before it becomes a visible failure.

**Guidelines:**

- MUST flag a Major when running the project's aggregate check on the changed branch produces warning-level output that the same command does not produce on the base branch (or when a warning present on the base branch disappears without an explanation in the change).
- MUST flag a Critical when the diff causes the running app to throw an uncaught exception during a normal interaction — the error tracker may capture it, but users will see the top-level error UI.
- SHOULD ask the author to include the aggregate check's output snippet for the affected surface in the PR description when the change adds new data-layer calls or new logging.

## What Manual Verification Cannot Replace

A manual pass confirms the change worked once, on one machine; the automated format and lint gate re-runs that check on every future change.

**Guidelines:**

- MUST NOT accept "the app didn't error" as a substitute for the lint gate per [lint-and-format-gate.md](./lint-and-format-gate.md). Lint runs separately.
