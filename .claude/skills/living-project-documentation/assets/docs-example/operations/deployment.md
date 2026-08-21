<!-- Example. Part of the example docs tree shipped with living-project-documentation. -->

# Deployment

Releasing to production, and getting back off a release that went wrong.

## Releasing

```bash
npm run build
npm run migrate:up -- --env production
npm run deploy
```

Migrations MUST run before the deploy, never after. The new code assumes the new
schema and the old code tolerates it, because every migration here is written to be
safe against the version already running. Deploying first inverts that and opens a
window where live code queries columns that do not exist yet.

The worker package deploys from the same command and the same commit. It MUST NOT be
deployed on its own to pick up a fix: the two packages share `shared/`, and a split
deploy runs two versions of it against one queue.

## Rolling back

```bash
npm run deploy -- --revision <previous>
```

Rolling the code back MUST NOT be paired with rolling the migration back. A
destructive change is split into an expand and a contract, and only the contract
removes anything — so roll back to the revision before the contract, then write a
forward migration.

If the contract already ran and the data is gone, this is a restore rather than a
rollback, and it goes through the on-call procedure instead of this document.

## Verifying a release

The deploy is not finished when the command returns. Watch the worker's claim rate for
five minutes: a release that broke the queue consumer deploys cleanly, reports
success, and simply stops claiming. Nothing else surfaces it, because no request
fails.
