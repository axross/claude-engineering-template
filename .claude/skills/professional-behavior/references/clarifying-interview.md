# Clarifying Interview

Apply this reference once the triage has separated the items you may settle from the decisions the human owns, and you are holding at least one of the latter. It covers what to do with that bucket. It is one continuous conversation, not a form to fill in: each answer changes which questions are still worth asking, so the question set is derived as you go rather than fixed up front.

How each question actually reaches the human — the channel, the option framing, and whether two questions may share a single prompt — is owned by [asking-the-human.md](./asking-the-human.md); dependency, established below, is what its one-decision-per-prompt rule keys on.

## Walking the Decision Tree

Decisions form a tree, not a list. Some are **upstream**: their answer changes which downstream questions exist, which options those questions may offer, or whether they survive at all. A question set fixed before the first answer arrives therefore asks moot questions, offers options an earlier answer already excluded, and misses the questions that answer exposed.

> Ask first: _is this surface public or authenticated?_ Answering **authenticated** deletes the anonymous-rate-limit question, turns the empty-state question from "what does a stranger see" into "what does a signed-in user with no data see," and exposes a new one about the unauthorized redirect. Asked in the other order — or asked all at once — three of those four questions are wrong.

**Guidelines:**

- MUST identify which open decisions are upstream of others — whose answer changes another's options, relevance, or existence — and ask the upstream decision first.
- MUST re-derive the remaining questions after each answer: drop the ones it made moot, revise the options it narrowed, and add the ones it exposed.
- MUST resolve one branch down to its leaves before starting the next, so the human reasons within one context at a time instead of switching between them.
- MUST reopen only the affected branch when a later answer contradicts an earlier one, rather than restarting the interview.
- SHOULD state the dependency when asking a downstream question ("since this is authenticated, …"), so the human can recognize an upstream answer they want to revisit.

## Exhaustive by Default

The interview carries no question budget. What ends it is the tree being walked out, never the interview having run long.

It does not scale down for a small-looking piece of work. The cost of an unasked decision is not proportional to the size of what is produced: a one-line change built on a wrong assumption is still wrong, and it surfaces later — in review, or in front of a user — where it costs more to correct. What keeps the interview finite is the triage. Exhaustiveness ranges over the decisions the request leaves open; a request that leaves none earns no questions at all.

**Guidelines:**

- MUST put every decision the request leaves open to the human, stopping only when the tree is walked out.
- MUST NOT end the interview because it has run long, because the human seems impatient, or because the remaining questions feel minor.
- MUST NOT scale the interview down because the work looks small — the count of open decisions sets its depth, never the size of the expected output.
- MUST keep exhaustiveness ranging over decisions only; asking what investigation could answer is a sorting failure, not thoroughness.

## Confirming Shared Understanding

The gate clears on the human's confirmation, not on your judgment that you have asked enough. Restating what you now believe is the cheapest place to catch a misread: correcting a three-bullet restatement costs a moment, while correcting finished work costs a careful read to find where the misunderstanding was laundered into detail.

The restatement is not the work. It is short enough to check at a glance — what is being done, each decision and the answer it got, and what is explicitly out of scope. It comes before the work is produced, so that whatever gate reviews that work reviews something whose premise the human has already agreed to.

**Guidelines:**

- MUST restate the shared understanding compactly once the tree is walked — the scope, each decision and its answer, and the explicit non-goals — and put it to the human for a confirm-or-adjust before acting on it.
- MUST keep the restatement short enough to verify at a glance; it checks alignment and is not a draft of the work.
- MUST treat an adjustment as reopening the affected branch — ask what the correction newly exposes, then re-confirm — rather than proceeding on a patched understanding.
- SHOULD surface, in the restatement, any item you settled yourself that would be expensive to have wrong, so a bad lookup fails here rather than downstream.
