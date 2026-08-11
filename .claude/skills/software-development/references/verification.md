# Verification

Apply these guidelines to confirm that a change produces the correct output before considering the task done.

This reference owns the **method** — how to decide what a change put at risk, and in what order to confirm it. It does not enumerate the concrete targets: each one belongs to the skill closest to the surface it protects, so whichever skill governs a surface is also the skill that says how to verify it. For the commands that run the project's gate, consult the project's own documentation per [project-docs.md](./project-docs.md).

## Identifying Affected Output Surfaces

A change is verified against what it can break, not against whatever was convenient to check. Deciding that mapping first is what keeps verification from defaulting to the command that happens to be easiest to run.

**Guidelines:**

- MUST map changed files to the output surfaces they put at risk before choosing a verification path, rather than running a habitual command and calling the change confirmed.
- MUST include the surface a change produces even when the edit looks inert — prose with no structural impact still renders, and the rendered output is what a reader consumes.
- MUST run the project's aggregate quality gate whenever a change touches any surface that gate covers.
- SHOULD consult the skill that owns a changed surface for how that surface is verified, instead of re-deriving the check here.

## Manual Verification

Manual verification is the first line of confirmation; the automated gate is the second. Neither replaces the other — the gate cannot tell whether the content is correct, and reading cannot catch a broken link or a wrong exit code as reliably as a checker.

**Guidelines:**

- MUST exercise or read the output surface a change produces, in the form its consumer receives it, before calling the change done — including a runnable script's observed behavior, where the skill owning that surface says how to confirm it.
- MUST NOT call a change done on the strength of a passing format/lint gate alone; the gate does not judge whether the content is correct.
- MUST report a required check that could not be run, naming the reason and the residual risk, instead of presenting the change as fully verified.
