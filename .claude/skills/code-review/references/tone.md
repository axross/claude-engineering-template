# Review Tone

Apply these rules to every line of every review the agent emits. Tone is not decoration — it decides whether a finding gets acted on or argued with.

## Constructive Language

Feedback aimed at a person invites defensiveness and pulls the discussion away from the work; feedback aimed at the code stays actionable.

**Guidelines:**

- MUST address the **code**, not the **author** — "this function does X", not "you wrote a function that does X".
- MUST NOT use blame-laden phrasing such as "you forgot", "you should have", "obviously", "as everyone knows", or "this is wrong because you".
- MUST NOT use sarcasm, emphatic exclamation marks, or rhetorical questions ("really?", "seriously?").
- SHOULD frame a concern as a question or observation when uncertain, and as a direct statement only when the violation is clearly documented.

## Stating the Why

An author weighing whether to act on a finding needs to see the cost of leaving it, not just which rule it cites.

**Guidelines:**

- MUST include a "Risk:" or "Why:" line for every Critical and Major finding, so the author sees the cost of the issue and not only the rule name.
- SHOULD prefer a concrete failure mode ("a non-string `id` would bypass the filter and return unauthorized records") over an abstract appeal ("violates principle X").

## Acknowledging Strengths

A review that lists only faults reads as an attack and leaves the author no signal about what is working and worth preserving.

**Guidelines:**

- MUST include at least one **Strengths** item in every review unless the diff is trivially small (roughly five changed lines or fewer, with no new files).
- SHOULD name something specific — "extracts the cache-key derivation into a helper, which makes the call site readable" — not generic praise like "good code".

## Handling Style and Preference

Blocking a merge over taste erodes trust in the severity labels that real defects depend on.

**Guidelines:**

- MUST NOT report a personal-style preference as Major or Critical. When a point is neither documented convention nor a clear correctness, security, or performance issue, label it Nit and prefix it "Optional:".
- SHOULD propose rather than impose when the codebase has not chosen a convention — "consider …" rather than "must …".

## Flagging Assumptions

An unstated assumption can silently invert whether a finding is even valid; naming it lets the author confirm or correct it instead of dismissing the whole finding.

**Guidelines:**

- MUST state an assumption explicitly when the reviewer cannot verify a fact from the diff alone (e.g., "Assuming `STORAGE_TOKEN` is set in production; if not, this branch never runs.").
- MUST ask a clarifying question rather than guess when the assumption would change a finding's severity.

## Human-Authored Content

Copy and translations belong to their authors; a reviewer editing them spends review attention on work that sits outside code review's remit.

**Guidelines:**

- MUST NOT correct or comment on the wording, copy, or translation of human-authored content; content correctness is a separate responsibility.
- SHOULD flag only the rendering, escaping, or localization-handling bugs in the surrounding code, not the words themselves.
