# UI Design Section Framing

Apply this reference when drafting or reviewing the **UI design** section of a spec — nested under Functional requirements — covering hierarchy, interaction states, accessibility intent, responsive behavior, and copy constraints, described in spec terms, not implementation. Sourced from PRD/design-spec practice, design-system precedent, and accessibility standards: [Shape Up's breadboarding](https://basecamp.com/shapeup/1.3-chapter-04), [Shopify Polaris on interaction states](https://polaris-react.shopify.com/design/interaction-states), [Material Design 3 on states](https://m3.material.io/foundations/interaction/states/applying-states), [NN/g on empty states](https://www.nngroup.com/articles/empty-state-interface-design/) and [error messages](https://www.nngroup.com/articles/error-message-guidelines/), [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [GOV.UK's accessibility acceptance criteria practice](https://insidegovuk.blog.gov.uk/2018/01/24/improving-accessibility-with-accessibility-acceptance-criteria/), and [A List Apart on responsive design](https://alistapart.com/article/responsive-web-design/). The implementation mechanics for these same concerns — component structure, CSS, ARIA markup — stay with your project's own UI and component conventions; this reference owns only how to _describe_ them in a spec.

## When to Include a UI Design Section

Not every change earns a UI design section, and forcing one onto a non-view-affected change is its own form of waste. Google's design-doc guidance ties documentation weight to a change's actual complexity and risk rather than applying it uniformly, and Basecamp's "Don't Do Dead Documents" argues a document only earns its keep when it will actually shape a decision. When a section is warranted, keep it at breadboard fidelity — Shape Up's "fat marker sketch" technique is deliberately coarse because too much early detail forecloses design and engineering judgment that belongs later.

**Guidelines:**

- MUST include a UI design section only when the change is view-affected (adds, removes, or materially alters a user-visible surface); MUST NOT include one for non-UI changes (data migrations, internal refactors, config, backend-only logic).
- SHOULD keep the section at wireframe/breadboard fidelity — places, affordances, and flow — rather than pixel-perfect mockup description.
- SHOULD link an existing wireframe or prototype instead of describing layout in prose when one exists, since a picture resolves ambiguity paragraphs cannot.

## Design Record and Linked Design Artifacts

When the change goes through a design-exploration step — wireframes, mockups, or a prototype reviewed before build — the UI design section is the natural home for the durable design record: it names the options that were considered, the option chosen, and links to the design artifacts (wireframe, hi-fi mockup, prototype) so the designs and the decision trail stay reachable from the spec after the exploration is over. A link to a living design source beats a prose paraphrase that drifts out of date, but keep an inline description or a checked-in image as a fallback for readers who cannot open the linked tool.

**Guidelines:**

- SHOULD record, when a design-exploration step ran, the options considered and the one chosen, with links to the design artifacts, so the decision survives in the spec.
- SHOULD reference a living design source (the design tool, a checked-in image) rather than paraphrasing the visual in prose alone.
- SHOULD keep an inline description or embedded image as a fallback so the record stays legible without opening an external tool.

## State Before Mechanics

A UI design section describes hierarchy, layout intent, and content priority in spec terms — what's primary, what's secondary, what's optional — not specific components, class names, or markup. That separation is what keeps this section from duplicating your project's UI and component conventions: the spec states _what_ the surface must convey, the implementation owns _how_ it's built.

**Guidelines:**

- MUST describe hierarchy and content priority in spec-level terms (primary/secondary/optional), not component names or markup.
- MUST NOT prescribe implementation details (specific components, CSS properties, class names) that belong to the implementation.
- SHOULD state layout intent as relationships between elements (e.g., "the confirmation sits below the primary action") rather than pixel positions.

## Interaction States

Real interfaces spend most of their life outside the default state. Design systems converge on a shared minimum taxonomy — Shopify Polaris ties each state to a "signifier" that sets expectations before an action happens, and requires that whatever happens on hover also happens on focus; Material Design defines hover, focus, pressed, and disabled as combinable primitives, with disabled explicitly excluded from hover/focus response. NN/g's research grounds two of these in evidence: users tolerate waits far better with visible feedback, so any action that can plausibly exceed about a second needs a specified loading state, and a well-designed empty state explains the absence and offers a next action rather than rendering nothing. Error-state content needs to be visible, precise, and constructive without blaming the user.

**Guidelines:**

- MUST enumerate, for any new or changed interactive element, its default, disabled (if applicable), loading (if it triggers an async action), error (if it can fail), and empty (if it can be data-less) states.
- MUST specify that whatever behavior is stated for hover also applies to keyboard focus, and describe disabled elements as non-focusable/non-interactive, not merely visually muted.
- MUST state what the user sees and what action resolves an error or empty state, not just that the condition exists.
- SHOULD state an expected feedback threshold for loading states (e.g., "show a loading indicator if the action can take longer than ~1s").

## Accessibility Intent

Accessibility intent belongs in the spec as testable outcomes, not a compliance footnote or implementation instructions. GOV.UK's accessibility-acceptance-criteria practice exists because generic "must meet WCAG" language gets skipped, while criteria that extract the specific rule relevant to the change and link back to WCAG for context actually get used and tested against. WCAG's own success-criterion language is precise enough to cite directly — "keyboard focus indicator is visible" (SC 2.4.7) and "no loss of content or functionality without requiring two-dimensional scrolling" (SC 1.4.10) are both spec-ready sentences on their own.

**Guidelines:**

- MUST state accessibility intent as testable, outcome-level criteria referencing specific WCAG success criteria (e.g., "meets 2.4.7 Focus Visible") rather than a blanket "must be accessible."
- SHOULD describe keyboard and screen-reader expectations as user-observable behavior (visible focus indicator, logical tab order, meaningful state announcement on change), deferring specific ARIA attribute choices to the implementation and the [W3C ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).
- SHOULD scope accessibility criteria to the specific interaction being changed rather than restating all of WCAG.

## Responsive Behavior Intent

Responsive intent belongs in the spec as content/layout behavior at defined viewport ranges, not fixed device names or pixel breakpoints — breakpoints belong where content or layout breaks, not at arbitrary device widths. WCAG's reflow criterion gives a concrete, citable floor: no layout requires two-dimensional scrolling at narrow viewports or high zoom.

**Guidelines:**

- MUST state responsive intent in terms of content/layout behavior (what reflows, reorders, collapses, or hides) at defined viewport ranges, not fixed device names or pixel values.
- MUST NOT permit a layout that requires two-dimensional scrolling at narrow viewports or high zoom.

## Copy and Microcopy Constraints

A spec includes enough copy detail to size and review the surface, without becoming the final content-design pass. "Intent text" — realistic-length, purpose-accurate draft copy — communicates length and tone without the risk that a reviewer mistakes polished placeholder copy for the final string. Durable voice/tone rules belong in a standalone style guide the spec can point to, not be re-authored per spec.

**Guidelines:**

- SHOULD include realistic-length "intent text" for any string whose length or tone affects layout or comprehension, rather than Lorem ipsum or a fully polished final string.
- SHOULD defer final microcopy wordsmithing (exact final strings, tone polish) to implementation or a linked content style guide rather than authoring it inline in the spec.
