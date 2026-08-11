# Pull Request Descriptions

Apply these rules whenever you author or update a pull request body. They govern the description only; the title follows the same header format as a commit — consult the project's Conventional Commits practices when writing it.

## Why Over What

The diff already shows _what_ changed; the description carries the _why_ — the one thing reviewers consistently name as their biggest obstacle, and the thing no diff can show. It is also a permanent artifact: future readers reach the change through its description long after the thread's participants are gone, and machine reviewers consume it as review context, so a vague body degrades automated review the same way it degrades human review.

**Bad Examples:**

> Fix bug

> Phase 1

> Address feedback

**Good Example:**

> Guard the session refresh against concurrent tab wake-ups. Two tabs waking from sleep both saw an expired token and raced to refresh it; the loser's refresh invalidated the winner's new token and logged the user out. Serialize refreshes through a single in-flight promise instead of locking storage — simpler, and the extra latency on the losing tab is bounded by one request.

**Guidelines:**

- MUST state the problem or motivation and why this approach was chosen, not only what changed.
- MUST NOT restate the diff mechanically (file-by-file narration adds nothing the Files tab lacks); summarize at orientation level instead.
- SHOULD name known trade-offs, shortcomings, or deliberately deferred work so the reviewer does not rediscover them as findings.
- MUST keep the description self-contained: when linking an external page for context, summarize its load-bearing points inline — links rot and sit behind access walls.

## Template Usage

The repository ships a pull request template (`.github/pull_request_template.md` on the default branch). GitHub pre-fills it only for pull requests opened through the web UI, and only from the copy on the default branch — a body authored programmatically (as an agent's API call does) starts empty, so the structure must be reproduced deliberately.

**Guidelines:**

- MUST structure every pull request body from the template's sections, reproducing them manually when the body is authored programmatically.
- MUST fill each kept section with real content or delete the section; MUST NOT leave an empty heading, placeholder text, or an unchecked prompt in the submitted body.
- SHOULD delete the template's instructional HTML comments once their section is filled; they never render, but they clutter the raw body that agents and API consumers read.
- MUST keep the Related issues section even when no issue exists, stating that explicitly instead of deleting it — reviewers otherwise cannot tell "no issue" from "forgot to link".

## Issue Linking

A closing keyword ties the pull request to the work it delivers: merging auto-closes the issue, and a later revert can reopen it so the work is not silently lost.

**Guidelines:**

- MUST link the tracking issue with a closing keyword (e.g. `Closes #123`) in the pull request body when one exists.
- MUST NOT put closing keywords or `@`-mentions in commit messages — every copy, cherry-pick, and fork push of the commit re-fires the automation and re-pings the people.
- SHOULD link related non-tracking context (prior pull requests, discussions, design docs) as plain references without closing keywords.

## Verification Evidence

A reviewer weighs claims they can check; "tests pass" is an assertion, not evidence. Evidence states what was run and what was observed, so the reviewer can audit it instead of re-deriving it.

The skipped-check rule below reads much like one a code-review capability states for a review's own evidence section. That overlap is deliberate rather than a duplication to resolve: the two govern **different artifacts** — the pull request body an author writes, and the report a reviewer posts — and a code-review capability is authored to reference no other skill, so neither can defer to the other.

**Guidelines:**

- MUST report the verification commands run and their observed results, per [verification.md](./verification.md).
- MUST name every required check that was skipped and why; a skipped check is residual risk, not silence.
- MUST state the status of each acceptance criterion when the linked issue lists them — the posted review verifies the diff against those criteria.
- SHOULD include before/after screenshots or a recording for any user-visible change.

## Risk Disclosure

Reviewers allocate scrutiny by risk. A description that flags the dangerous parts gets deeper review where it matters; one that hides them gets uniform, shallower review everywhere.

**Guidelines:**

- MUST call out breaking changes: what breaks, who is affected, and the migration path — and mark the title with the breaking-change marker the project's Conventional Commits practices define.
- SHOULD flag risky or contentious areas of the diff explicitly rather than letting the reviewer discover them.
- SHOULD note rollback considerations when the change is hard to reverse (migrations, config, persisted formats).

## Settled Decisions

A plan often tells the author to explain a choice in the description precisely because the diff makes that choice look like a mistake. The instruction is defensive: it exists so a reviewer does not report a deliberate choice as an oversight. Written with its polarity inverted it does the opposite — it hands a question the author already settled with a stakeholder to a reviewer who was never in that conversation, in a venue that stakeholder is not necessarily watching. The two phrasings read almost alike and behave very differently.

**Bad Example:**

> This sits outside our usual standard. If the reasoning does not hold up, it should go.

**Good Example:**

> This sits outside our usual standard, and it was settled with the maintainer while planning rather than left there by oversight. Overturning it wants a new argument, not a restatement of the standard it is already known to sit outside.

Recording a decision as settled does not place it beyond review. It states what objecting is up against, so an objection arrives as new information rather than as a re-run of a conversation that already happened.

**Guidelines:**

- MUST record a decision already settled with a stakeholder as settled when the description explains it, naming that it was settled and with whom.
- MUST NOT offer a settled decision back to the reviewer as an open question, or invite the reviewer to overturn it; take new information that changes such a decision to the person who settled it instead.
- SHOULD flag such a decision rather than passing over it in silence — keeping a reviewer from reporting a deliberate choice as a defect is why it is mentioned at all.
- SHOULD state what revisiting the decision would take, so the reviewer can weigh the cost of objecting rather than guess at it.

## Reviewer Guidance

The description is the author's one chance to shape the review before it starts. Telling reviewers where to begin and what feedback is wanted measurably improves engagement — and costs two sentences.

**Guidelines:**

- SHOULD name the file or change to start reading from when the diff spans more than a few files.
- SHOULD state the kind of feedback wanted (quick sanity check, deep design critique, copy review) when it is not the default full review.
- SHOULD surface genuinely open questions as explicit questions, not buried caveats — a decision already settled with a stakeholder is not one of them.

## Description Freshness

Review rounds change the diff, and a description written for round one silently mis-frames every later round. The body is re-read by each new reviewer and by automation on every pass — it must describe the pull request as it is, not as it started.

**Guidelines:**

- MUST update the description when review-driven changes alter the scope, approach, or risk profile it describes.
- MUST re-check the description against the final diff before the pull request leaves draft.

## Right-Sizing the Pull Request

Everything above works only on a reviewable diff: review effectiveness drops sharply past a few hundred changed lines, and review latency grows with size. Scope discipline itself is owned by [change-management.md](./change-management.md); the description's job is honesty about size.

**Guidelines:**

- SHOULD split work into small, single-purpose pull requests instead of writing a longer description for an oversized one.
- SHOULD justify the size in the description and point reviewers at the substantive parts when a large diff is unavoidable (e.g. a rename sweep or generated files).
