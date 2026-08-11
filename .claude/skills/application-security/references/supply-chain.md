# Supply Chain

Keep the dependency graph justified, trustworthy, and free of risky transitive or install-time code, in two modes. **Build:** admit a dependency deliberately — justified, maintained, pinned, and installed without unvetted lifecycle scripts. **Review:** verify a manifest or lockfile change does not introduce an unjustified, heavyweight, or risky addition. (This is A03 Software Supply Chain Failures, new in OWASP Top 10:2025.)

## Build Securely

Every dependency is a permanent liability and an entry point for someone else's code to run in your build and runtime. Admit one only when a standard-library or platform API cannot do the job, and lock down how it installs.

**Guidelines:**

- MUST prefer a standard-library or platform API over a new dependency, and weigh ≥ 2 alternatives before admitting one — choosing the most popular, best-maintained, and platform-agnostic option.
- MUST move the manifest and lockfile together in one change and install from the lockfile (e.g., `npm ci`) so every build resolves the versions you tested.
- MUST inspect a new dependency's install scripts (`postinstall`, `preinstall`, `prepare`, `prepublish`) before adding it, and install with lifecycle scripts disabled (`--ignore-scripts`) unless a script is understood and required.
- MUST pin dependency versions through the lockfile rather than leaving floating ranges to resolve at install time.
- MUST confirm a permissive license (MIT / ISC / Apache-2.0) and reject copyleft (GPL / AGPL) where the project's license posture is incompatible.
- SHOULD run the audit command (e.g., `npm audit`) after a lockfile change and resolve or explicitly defer `high` and `critical` findings.
- SHOULD inline the logic instead of adding a dependency that is a thin wrapper around a single function used once.

## Dependency Justification

A dependency is a permanent liability — maintenance, security surface, and weight — that outlives the task that introduced it, so admitting one is never a free decision.

**Guidelines:**

- MUST flag a Major when the diff adds a new entry to the dependency manifest (runtime or dev dependencies) without a justification. If the project defines a software-development or change-management skill, hold the addition to its dependency rules; regardless, the author should have considered ≥ 2 alternatives and chosen the most popular / well-maintained / platform-agnostic option.
- MUST flag a Major when a new dependency duplicates functionality already available in:
  - A package already in the manifest
  - A built-in standard-library API of the runtime
  - A built-in platform API already available to the project
- SHOULD flag a Minor when the new dependency is a thin wrapper around a single function and the diff only uses one export — inline the logic.

## Lockfile

When the manifest and lockfile drift apart, installs stop being reproducible and CI or a teammate can resolve versions the author never tested.

**Guidelines:**

- MUST flag a Critical when the diff modifies the dependency manifest but the lockfile is unchanged, or vice versa — they must move together.
- MUST flag a Major when a lockfile change introduces ≥ 50 new transitive packages for a single new direct dependency. That is a signal the dependency is heavyweight.

## Dependency Quality Signals

For each new direct dependency, the reviewer SHOULD verify (and request from the author if not stated in the PR description):

- Recent activity (commits within the last 12 months, ideally)
- Reasonable adoption (loosely: a download/usage count appropriate for the dependency's niche)
- Active issue tracker, no recent unaddressed CVEs
- Type definitions either built-in or available as a companion types package (for a typed Markdown (with occasional JavaScript for scripting) project)
- Permissive license (MIT / ISC / Apache-2.0); flag a Critical on copyleft licenses (GPL, AGPL) when the project's license posture is incompatible with them

**Guidelines:**

- MUST verify direct-dependency quality signals before approving a new dependency, or request the author provide them.

## Postinstall and Lifecycle Scripts

Install-time scripts run arbitrary code on every developer and CI machine before any application code executes, which makes them a favored supply-chain attack vector.

**Guidelines:**

- MUST flag a Critical when a new dependency declares a `postinstall`, `preinstall`, `prepare`, or `prepublish` script in its own manifest (visible in the lockfile) that runs a shell command, downloads a binary, or runs the runtime against an arbitrary file. Already-vetted binary-installer dependencies are acceptable; new ones in that category need explicit justification.

## Platform Specificity

A dependency bound to one OS or runtime breaks whichever environment it does not support — either the deployment target or a contributor's machine.

**Guidelines:**

- MUST flag a Major when a new dependency is platform-specific (e.g., a single-OS native module) when a platform-agnostic alternative exists. The deployment platform and the development environment must both work.
- MUST flag a Major when a new dependency requires a runtime feature not present in the project's minimum supported runtime version (or in a constrained runtime such as an edge/serverless runtime, when the consuming module runs there).

## Transitive CVEs

A single new direct dependency can pull in dozens of transitive packages the author never inspects, and any of them can already carry a known vulnerability.

**Guidelines:**

- SHOULD recommend the author run the npm audit command and report findings before merge when the diff changes the lockfile. `high` and `critical` severities MUST be resolved or explicitly deferred with rationale.
