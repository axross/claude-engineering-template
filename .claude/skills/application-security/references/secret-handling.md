# Secret and Environment-Variable Handling

Handle secrets in two modes. **Build:** write code that keeps every secret behind one boundary and out of client bundles, logs, and telemetry. **Review:** verify a diff commits no secret and keeps `process.env` access inside the project's whitelisted boundary. The review rules name a severity; align it to the host project's review vocabulary.

## Build Securely

A secret is safest when the code has only one place to read it and no path to leak it. Reach for the safe construction up front rather than a guard you must remember later.

**Guidelines:**

- MUST read every secret through the project's single env boundary — an env-derived runtime barrel that re-exports typed values — where the project defines one, and never through `process.env.*` scattered across modules; on a project with no such boundary, confine env access to one module and treat introducing that boundary as the fix.
- MUST NOT hardcode a credential, token, DSN, connection string, or password literal in source, tests, or fixtures — even temporarily; read it from an env var and document a placeholder in `.env.example`.
- MUST keep secret-bearing files (`.env.local`, `.env.*.local`, `*.pem`, `*.key`) gitignored so they never enter a commit.
- MUST apply the framework's public/client env-var prefix ONLY to values safe for every visitor to read; treat the prefix as the public-bundle boundary, not a naming convenience.
- MUST keep secrets out of log lines, error-report extras, and analytics payloads — pass a non-sensitive identifier, never the secret itself.
- SHOULD prefer scoped, short-lived credentials, and rotate any secret the moment it reaches version control or a shared log — deletion does not undo the exposure.
- SHOULD add a placeholder line to `.env.example` in the same change that introduces a new runtime env var, so a fresh checkout documents what it needs.

## Committed Secrets

Git history is permanent and replicated to every clone, so a secret that lands in one commit is leaked for good and needs rotation even after a follow-up commit deletes it.

**Guidelines:**

- MUST flag a Critical when the diff contains any literal value matching the shape of:
  - A service credential — a long random string assigned to an application-secret variable outside the single sanctioned config file that legitimately holds it
  - A service token with an embedded auth secret (e.g., a connection URL or DSN that includes credentials past the host)
  - A storage / blob access token (recognizable by its provider-specific prefix)
  - A database auth token (often JWT-shaped)
  - A test-user password literal anywhere outside `.env.example`
  - A third-party analytics or service token outside the whitelisted env-access files
- MUST flag a Critical when `.env.local`, `.env.production`, `.env`, or any `*.pem` / `*.key` file appears in the diff. They are gitignored — appearance means the gitignore was bypassed.
- MUST flag a Major when a value previously read from `process.env.*` is hard-coded into the diff "for testing".

## `process.env` Whitelist

The project restricts `process.env.*` access to a small set of whitelisted files (often enforced by a linter rule). The reviewer MUST flag a Critical for any new `process.env.*` access outside those files. The whitelist typically covers only:

| File category                  | Why it is whitelisted                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| The env-derived runtime barrel | The single sanctioned module that reads env vars and re-exports typed runtime values (origin, environment name, service DSNs/tokens, etc.) |
| Data-layer config              | The data/content layer needs DB/storage credentials at build/startup time                                                                  |
| App-framework config           | Build/config-time access to CI and deployment env vars                                                                                     |
| Test config                    | Test config-time access to CI flags, base URL, and automation-bypass secrets                                                               |

**Guidelines:**

- MUST flag a Critical when a component, repository, helper, request handler, or data-layer resource reads `process.env` directly, where the project defines a single env-derived runtime barrel it should go through instead; where the project defines none, flag the scattered access as the finding and name the missing boundary.

## Public / Client-Exposed Env-Var Boundary

Most app frameworks expose a subset of env vars to the browser/client via a prefix convention (e.g., a `*_PUBLIC_*`-style prefix). Anything carrying that prefix is shipped to every client. Review focuses on critical-severity cases where a secret value is read via a client-exposed env var.

- The project legitimately uses a handful of client-exposed env vars for public-by-design values (environment name, build/commit identifier, error-tracker DSN, analytics token).

**Guidelines:**

- MUST flag a Critical when a secret value is read via a client-exposed (public-prefixed) env var. The public prefix is the public-bundle boundary — anything prefixed is shipped to every client.
- MUST flag a Major when a new client-exposed env var is introduced without a one-line justification of why it must be public.

## Logging and Telemetry

Every telemetry channel copies its payload into third-party retention the project cannot purge on demand, so a secret reaching any of them stays compromised for as long as those systems keep it.

**Guidelines:**

- MUST flag a Critical when a secret value (DSN, token, password, session ID, auth header) is interpolated into any log or console output, any error-report extras, or any analytics event payload. Logs are captured by the hosting platform; the error tracker and analytics ship payloads off-server.
- MUST account for a "send default PII" option being enabled in the error-tracker config (if the project enables it) because IP addresses, cookies, and request bodies may already be attached.
- MUST flag a Major when a change adds explicitly sensitive context (e.g., a bearer token) on top of that default.

## `.env.example`

An undocumented env var fails at runtime on the next fresh checkout or deployment, long after the change that introduced it merged.

**Guidelines:**

- MUST flag a Major when the diff introduces a new env var consumed at runtime but does not add a placeholder line to `.env.example`. The example file is the only documentation of which env vars exist.
