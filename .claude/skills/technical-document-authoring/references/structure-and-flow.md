# Structure and Flow

Apply these rules in two modes. **Author:** lay the document out — the order of sections, the headings, the paragraph sizing, and the path a reader walks from arrival to answer. **Review:** read the draft the way its reader will, top-down and impatient, and raise as a finding every place the answer is buried, a heading fails to say what it answers, or a section appears with no reason to be there.

## Lead With the Answer

Engineering readers scan top-down and bail early; an answer buried under context is an answer that does not exist for most readers. Put the primary takeaway at the top, and let the supporting argument follow.

**Guidelines:**

- MUST put the document's primary takeaway — the decision, the recommendation, the result, the TL;DR — at the top, before the supporting argument.
- SHOULD open a design doc / RFC with a one-paragraph summary stating the decision and the headline trade-off; the rationale follows.
- SHOULD open a how-to or runbook with the success criterion and the prerequisites checklist before the first step.
- SHOULD state the finding in the opening of a post-mortem or an investigation write-up; building suspense is a fiction technique, not a technical-writing one.
- MUST make the opening summary stand on its own — a reader who reads only the lede should walk away with the correct headline, even if incomplete.

## Motivation and Stakes

Strategy, direction, and decision documents ask the reader to invest attention or change behavior, so the "why this matters" or "context" section must motivate the proposed change rather than merely describe the current state. A motivational opening answers _why now / why this approach / what's the cost of not acting_, where a descriptive opening only answers _what does the world look like_ — the same facts, but a weaker effect on the reader.

**Good Examples:**

> On-call has been paged for this same disk-full alert nine times this quarter, and each page costs about forty minutes of manual cleanup.

**Bad Examples:**

> The disk sometimes fills up.

**Guidelines:**

- MUST motivate the proposed change in the "why this matters" or "context" section, not describe the current state.
- MUST close the reader's implicit question — "why am I being asked to read this?" — in the opening; the rest of the document MUST NOT have to.
- MUST name the cost of inaction explicitly when the existing state genuinely is the motivation (a structural ceiling, a recurring incident, an approaching deadline).
- SHOULD frame proposed elements in a discussion document (RFC for input, proposal for review, direction document inviting feedback) as _candidates_ rather than _commitments_; candidate framing invites pushback, while commitment framing asks for sign-off and gets silence.

## Headings That Map to Reader Tasks

Headings are the document's outline and its entry points from search and tables of contents, so phrase them in the reader's vocabulary and make each one specific enough to signal what it answers.

**Good Examples:**

> Configure the database connection

> Why we chose Postgres over MySQL

**Bad Examples:**

> Database layer

> Overview

> Details

**Guidelines:**

- MUST use task-based or question-based headings phrased in the reader's vocabulary over implementation-internal labels.
- SHOULD use sentence case, not title case, and SHOULD NOT end a heading in punctuation.
- SHOULD make a heading specific enough that a reader landing on it from a search result or table-of-contents link knows whether it answers their question — `Overview` and `Details` fail this test.
- MUST NOT stack headings with no body text between them (an H2 immediately followed by an H3 with nothing in between); add at least one sentence of orientation under each heading.
- MUST NOT skip heading levels (jumping from H2 to H4); the hierarchy is also the document's outline for accessibility tools.
- SHOULD parallel headings in form within a section — if one H3 is a question, sibling H3s SHOULD also be questions.

## Skimmable Paragraphs

Readers scan first sentences to decide whether to read the rest, so paragraphs should be short, single-idea, and lead with their conclusion. Visual breaks like bullets, callouts, and code blocks pull the eye and should be deployed where attention matters most, not for decoration.

**Guidelines:**

- SHOULD put the key concept or conclusion in the first sentence of a paragraph; readers scan first sentences to decide whether to read the rest.
- SHOULD cover one idea per paragraph; when a paragraph spans two ideas, split it.
- SHOULD keep paragraphs short — 2–4 sentences is a working target for screen reading; long paragraphs read as walls of text and get skipped.
- MAY use a bolded inline phrase to mark a key term or decision point in a long paragraph, but bold-everything is the same as bold-nothing — reserve it.
- SHOULD use bullet lists, callouts, and code blocks at the moment the reader most needs to spot the content, not decoratively — they break the visual rhythm and pull the eye.

## Progressive Disclosure Within a Document

Introduce ideas just in time and order content from simple to complex so the reader never has to hold distant context in memory. Push rarely needed detail out of the main flow, and prefer forward references over backward ones.

**Guidelines:**

- SHOULD introduce a concept immediately before the instruction that uses it, not in a distant "background" section the reader has to hold in memory.
- SHOULD order content from simple to complex — the common path first, edge cases and advanced configurations after.
- SHOULD include a brief table of contents or section overview near the top of a long document; a reader with one specific question SHOULD be able to jump straight to the relevant section.
- SHOULD place detail that fewer than ~20% of readers will need behind a link, in a collapsible section, or in an appendix — not inline in the main flow.
- SHOULD prefer forward references ("we'll explain why in the next section"), which are cheap, over backward references ("as discussed above"), which force the reader to remember or scroll.

## Links and Addressability

Links carry information and are read out of context by screen readers and TOC scanners, so their text must name the destination. Treat anchors as a stable, long-lived API and prefer canonical and relative targets so links survive content drift and directory moves.

**Good Examples:**

> see the deployment README

**Bad Examples:**

> click here

> this page

> see the README

**Guidelines:**

- MUST use descriptive link text that names the destination — `the Postgres connection-pooling guide`, never `click here` or `this page`.
- SHOULD make a link's text make sense when read out of context, since screen readers and TOC scanners read link text alone.
- SHOULD prefer linking to canonical sources over restating their content; restated content drifts away from the original.
- SHOULD keep section anchors stable — once published, treat heading IDs as part of the document's API; renaming a heading without preserving the old anchor breaks every external link.
- SHOULD use relative links for cross-document references inside a doc set so the doc set survives directory moves and re-hosting.

## Section Transitions

A section should open by orienting the reader to what it covers and how it relates to what came before, and connective words should mark the actual logical relationship between ideas. Choppy heading-to-content jumps and unmotivated section ordering leave the reader wondering why a section appears where it does.

**Guidelines:**

- SHOULD open a new section with a sentence that orients the reader to what this section covers and how it relates to the previous one — pure heading-to-content transitions read as choppy.
- SHOULD name an earlier section's result in the opening sentence when this section depends on it, rather than assuming the reader carried it forward.
- SHOULD use transitions like "However", "Therefore", "In contrast", "For example" to mark the actual logical relationship — they are load-bearing, not filler.
- SHOULD either add a one-line transition or reorder a section that ends with no clear handoff into the next; the reader should never wonder why a section appears where it does.
