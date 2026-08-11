# Project Documentation

Apply this reference whenever a task needs to perform a project-specific operation — running tests, starting a development server, building, formatting, linting, deploying, or any other command whose correct invocation depends on how this particular project is set up.

Its subject is the project's **own** contributor-facing documentation, conventionally `README.md` (substitute the project's equivalent — a `CONTRIBUTING.md`, a docs site, a developer handbook — where it keeps that content elsewhere). For **vendor** documentation — a framework, service, or tool whose own behavior may have changed — see [current-docs.md](./current-docs.md) instead.

The loop is three steps: consult the documentation, ask the human when it is silent, and record the answer so the next run does not have to ask. Each step exists because the alternative costs someone time — a reinvented command costs the agent's, an unanswered gap costs the next agent's, and a guessed command written down costs everyone's.

## Consult the Documentation First

A project's documentation is the cheapest available source for how to operate it, and it is authoritative in a way inference is not: a manifest shows which scripts exist but not which one a contributor is meant to run, and a plausible-looking command can succeed while doing the wrong thing.

**Guidelines:**

- MUST read the project's contributor-facing documentation for an operation before performing it, whenever the correct invocation is project-specific rather than universal.
- MUST prefer a documented invocation over one inferred from the manifest, from a sibling project, from a similar toolchain, or from memory.
- SHOULD consult it early — while planning the work — rather than at the moment a command is needed, so a documentation gap surfaces before it blocks progress.
- MUST NOT treat the absence of a documented command as license to invent one; that case is covered by [Ask Instead of Guessing](#ask-instead-of-guessing).

## Ask Instead of Guessing

When the documentation does not cover the operation, the honest position is that the project's intent is unknown. A guessed command is the failure mode this step prevents: it can appear to succeed — the process exits zero, some tests run — while skipping the suite the project actually gates on, targeting the wrong environment, or bypassing a required setup step. That failure is expensive precisely because it looks like success.

**Guidelines:**

- MUST ask the human how to perform the operation when the project's documentation does not exist, cannot be found, or is silent on it.
- MUST ask through the human-question channel the harness provides, following the project's own rules for asking a human where it defines them; this reference does not restate them.
- SHOULD frame the question with the most plausible candidate — a script from the manifest, a command from a similar project — as an option to confirm or correct, so the human can answer by selecting rather than by composing.
- MUST NOT substitute the agent's own preferred default for an answer that never arrived, and MUST NOT report an operation as performed as documented when the invocation was inferred.
- SHOULD batch several unresolved operations into one question rather than interrupting repeatedly for each.

## Record the Answer, With Approval

An answered question that goes unrecorded is asked again on the next task, by the next agent, forever. Writing it into the project's documentation converts a one-time interruption into a permanent answer — which is why recording it is the productive end of the loop rather than an optional courtesy.

Two conditions bound the recording, and both matter. The answer must have been **exercised**, because a command written into documentation is trusted by everyone who reads it next and a recorded guess is worse than a documented gap. And the update must be **approved**, because writing into a project's documentation on the agent's own initiative turns every unfamiliar command into an unrequested change.

**Guidelines:**

- MUST ask the human's approval to add the answer to the project's documentation, once the operation has been performed and observed to work.
- MUST record only the invocation that was actually run and seen to succeed — never an unverified answer, an assumed variant, or a generalization beyond what was exercised.
- MUST write the entry the way the surrounding documentation is written: the command, a concise description of what it does, and when a contributor runs it — legible to a human reader and precise enough for an agent to act on.
- MUST treat this update as a sanctioned documentation improvement rather than out-of-scope drive-by work, since the human's approval is what authorizes it; the scope rules in [change-management.md](./change-management.md) are not a reason to skip it.
- MUST leave the mechanics of landing the update to the project's change-authorization rules: include it in the current change when the task already carries one, and when the task changes nothing otherwise — a question, an investigation, a review — offer the update instead of performing it, so a no-change task stays a no-change task.
- MUST report a documentation gap that was found but not recorded — approval withheld, deferred, or never sought — in the task summary, so the gap stays visible instead of being silently rediscovered later.
