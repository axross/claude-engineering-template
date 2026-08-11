# Sentence and Word Craft

Apply these rules in two modes. **Author:** write at the sentence and word level — voice, tense, person, sentence length, terminology consistency, and pronoun discipline. **Review:** read for the places a reader has to stop and reparse, and raise each as a finding on the sentence that causes it. These rules compound in both modes: each one removes a small ambiguity, and together they decide whether a paragraph reads cleanly or makes the reader work.

## Voice, Tense, and Person

Active voice, present tense, and a consistent point of view keep prose direct and force the writer to name the actor. Passive voice and future tense are reserved for the narrow cases where the actor is genuinely beside the point or the action truly happens later.

**Good Examples:**

> The scheduler retries the job.

> The function returns a Promise.

> The record was deleted. (passive — when the actor is not the point)

**Bad Examples:**

> The job is retried by the scheduler.

> The function will return a Promise.

**Guidelines:**

- SHOULD use active voice by default, naming the actor that performs the action.
- MAY use passive voice when the actor is genuinely unknown, irrelevant, or when the object is the legitimate topic of the sentence.
- SHOULD use present tense for descriptions of how the system behaves, reserving future tense for actions that genuinely happen later.
- SHOULD use second person ("you") to address the reader directly; avoid "we" except for a collective decision the writer and reader share, and avoid "the user" when "you" is what is meant.
- MUST NOT switch person mid-document (oscillating between "you", "we", and "the developer") — pick one and hold it.

## One Idea Per Sentence

Each sentence should carry a single idea. Long sentences and run-in sequences usually hide a list or a second idea waiting to be split off, and any sentence that forces a re-read is a sentence to rewrite.

**Bad Examples:**

> Configure the pool by first setting the size, then enabling overflow, and finally tuning the timeout.

**Good Examples:**

> Configure the pool in three steps:
>
> 1. Set the size.
> 2. Enable overflow.
> 3. Tune the timeout.

**Guidelines:**

- SHOULD limit each sentence to a single idea; a sentence with two `and`-joined main clauses SHOULD usually be split into two sentences.
- SHOULD re-examine any sentence longer than ~25 words — long is not automatically wrong, but most long sentences hide either a list or a second idea.
- MUST convert a sentence describing a sequence of three or more steps, items, or conditions into a list — embedded run-in lists read worse than bullets or numbered steps.
- SHOULD rewrite a sentence that requires the reader to re-read it, rather than keep it "for the careful reader".

## Strong Verbs and Cut Filler

Concrete verbs and a real subject make a sentence do work; filler phrases, hedging adverbs, hedging modals, and colon-lead-in labels add words without information. Cut them on the second pass.

**Good Examples:**

> Three flags control retries.

**Bad Examples:**

> There are three flags that control retries.

Common word-swaps to cut filler:

- "in order to" → "to"
- "at this point in time" → "now"
- "due to the fact that" → "because"
- "is able to" → "can"

**Guidelines:**

- SHOULD prefer concrete verbs (`returns`, `triggers`, `parses`, `retries`, `deploys`) over weak ones (`is`, `has`, `does`, `makes`, `performs`, `provides`).
- SHOULD rewrite "there is / there are" openings with a real subject and verb.
- MUST cut filler phrases that add words without information ("in order to" → "to", "at this point in time" → "now", "due to the fact that" → "because", "is able to" → "can").
- SHOULD delete hedging adverbs (`basically`, `essentially`, `actually`, `simply`, `just`) on the second pass — they signal nothing and patronize when paired with anything that is not basic.
- SHOULD NOT use hedging modals (`might`, `could`, `should be able to`) inside a normative or descriptive sentence; pair certainty with definite verbs and reserve modals for genuinely uncertain claims.
- SHOULD NOT open body paragraphs with colon-lead-in labels (`The principle:`, `The rule:`, `The takeaway:`, `The point:`); the pattern is appropriate only when the colon introduces a diagram, code block, list, or table that follows immediately.

## Define Terms Once, Use Consistently

A domain-specific term must be defined on first use and then named the same way every time it appears. A reader who encounters two synonyms wonders whether the writer is signaling a distinction, so consistent terminology is precision, not stylistic monotony.

**Good Examples:**

> a _connection pool_ — a cache of reusable database connections

**Bad Examples:**

> The system has a "tenant" … later referred to as "customer", "organization", or "workspace" with no definitional bridge.

**Guidelines:**

- MUST define a domain-specific term on first use, either inline or by linking to an authoritative definition.
- MUST use the same term every time it appears — do not later swap in "customer", "organization", or "workspace" for "tenant" without an explicit definitional bridge.
- SHOULD maintain a short glossary at the end of long documents (or a project-wide glossary) when more than ~5 domain terms appear; introduce each term once, link to the glossary thereafter.
- MUST pick one term and note the synonym once — not switch between them — when two existing terms in the codebase or doc set conflict.

## Acronyms and Abbreviations

Spell out an acronym on first use with the acronym in parentheses, then use the acronym thereafter. Introduce acronyms only when they earn their keep, and lean on industry-standard ones only when the named primary reader can be expected to know them.

**Good Examples:**

> Time To Live (TTL)

**Guidelines:**

- MUST spell out an acronym on first use with the acronym in parentheses ("Time To Live (TTL)"), and use the acronym thereafter.
- SHOULD only introduce an acronym when it is significantly shorter than the spelled-out form and appears multiple times in the document; one-shot acronyms are noise.
- MUST NOT invent project-internal acronyms in a document aimed at a broader audience; spell them out or rename them.
- MAY use industry-standard acronyms (`HTTP`, `JSON`, `SQL`, `API`, `URL`, `TLS`) without expansion when the audience can be expected to know them; calibrate to the named primary reader.

## Ambiguous Pronouns

The worst offenders in technical writing — `it`, `this`, `that`, and `they` — can each refer to several preceding nouns and force the reader to guess. Repeat the noun whenever the referent is distant or the antecedent is in doubt.

**Good Examples:**

> …the request handler. The request handler then…

> This behavior … This setting …

**Bad Examples:**

> …the request handler. It then… (referent unclear)

> This is important. (bare pronoun referring to the previous sentence)

**Guidelines:**

- MUST eliminate ambiguous pronouns, especially `it`, `this`, `that`, and `they` when each could refer to several preceding nouns.
- SHOULD repeat the noun when the referent is more than ~5 words away rather than rely on `it`.
- MUST follow sentence-initial "this" and "that" with a noun ("This behavior", "This setting"), not use them as a bare pronoun referring to the previous sentence.
- MUST replace a pronoun whose antecedent could plausibly be either of two preceding nouns with the explicit noun — the reader should never have to choose.
- SHOULD place an unavoidable pronoun within the same sentence or the immediately following one; pronouns crossing paragraph breaks are nearly always ambiguous.
