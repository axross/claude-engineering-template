# Voice, Tone, and Maintenance

Apply these rules in two modes. **Author:** set the document's voice, choose inclusive and global-friendly phrasing, plan how the document will be kept current, and self-edit before publication. **Review:** read for phrasing that will alienate or exclude a reader, and for the ownership and currency signals whose absence means the document will rot; raise each as a finding. Voice and maintenance look like soft topics next to grammar rules, but a document that alienates a reader or rots in place fails just as badly as one with broken sentences.

## Voice and Tone

The target voice is conversational but professional — the way a senior engineer explains something at a whiteboard to a colleague, not the way a vendor whitepaper performs authority. The narrator stays out of the way: a technical document is about the system, not the writer.

**Guidelines:**

- SHOULD aim for **conversational but professional** — write the way a senior engineer explains something at a whiteboard to a colleague, not the way a vendor whitepaper performs authority.
- MUST NOT be jokey, sarcastic, or self-deprecating in technical documentation; humor that lands for one reader fails for the next, and dated jokes age the document.
- SHOULD use plain words over inflated ones — `find out` over `ascertain`, `many` over `plethora`, `earlier` over `aforementioned`. A word that carries a precise technical sense is not "inflated"; see the exempt list under [Vocabulary Level](#vocabulary-level--cefr-c1-ceiling).
- SHOULD NOT hedge with "obviously", "simply", "just", "of course", or "as everyone knows" — these phrases shame any reader for whom the topic is not obvious.
- SHOULD keep the narrator invisible — a technical document is about the system, not the writer; "I think" and "I prefer" have no place in a team or product document.

## Don't Blame the Reader

Phrasing that anticipates reader error or labels a step "easy" reads as accusatory and alienates anyone who is stuck. The system, not the person, owns the failure mode, and the document should assume an intelligent, time-pressed reader rather than a lazy or inattentive one.

**Guidelines:**

- MUST NOT phrase instructions as if the reader will get them wrong — "If you forget to..." or "Make sure you don't..." reads as accusatory; rewrite as a positive instruction.
- MUST NOT blame the reader for the error in error-handling and troubleshooting prose ("You probably mistyped the command"); blame the situation ("This error appears when the command is mistyped or when..."). The system, not the person, owns the failure mode.
- MUST cut "Easy", "simple", "trivial", "just" applied to a step — if the step is genuinely easy the adjective is unnecessary, and if it is not easy the adjective alienates the reader who is stuck on it.
- SHOULD assume the reader is intelligent and time-pressed, not lazy or inattentive; this assumption shapes every word choice.

## Inclusive and Global Language

Inclusive phrasing avoids gendered and ableist language, and global-friendly phrasing avoids idioms, cultural references, and locale-implicit formats that trip up non-native readers and translators.

**Guidelines:**

- MUST use gender-neutral phrasing — "the developer can configure their pool" or rewritten in second person ("you can configure your pool"); avoid generic "he" or "she".
- MUST avoid ableist language (`crazy`, `insane`, `dumb`, `lame`, `sanity check`) — substitute precise alternatives (`unexpected`, `surprising`, `confidence check`).
- SHOULD avoid English idioms, sports metaphors, and US-cultural references — "out of the park", "ballpark figure", "Hail Mary", "low-hanging fruit" — non-native readers and translators stumble on them.
- MUST use unambiguous date formats (ISO 8601 `YYYY-MM-DD`, or spelled-out months `28 April 2026`); never the ambiguous numeric form `04/28/26`, which reads differently across locales.
- SHOULD include units and timezone explicitly in time and currency references — `200 ms`, `$2.50 USD`, `2026-04-28 14:00 UTC` — locale-implicit forms misroute global readers.

## Vocabulary Level — CEFR C1 Ceiling

The [Common European Framework of Reference for Languages (CEFR)](https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions) classifies language proficiency from A1 (beginner) through C2 (mastery). Most working software engineers who use English as a second language sit between B2 and C1; vocabulary above C1 — rare, literary, or Latinate words that native speakers absorb passively — forces non-native readers to stop and look words up, and often defeats machine translation. Keep working vocabulary at **CEFR C1**.

Word-level CEFR grading here follows the [Oxford 5000 by CEFR level](https://www.oxfordlearnersdictionaries.com/about/wordlists/cefr), which grades words A1 through C2; words rarer than C2 are simply not on the list. Graded lists occasionally disagree by one level on the same word — where a second list you consult disagrees, write to the lower (more conservative) ceiling.

**The ceiling governs general English only, never terms of art.** Graded lists are built from general-English corpora, so they measure how rare a word is across all writing — not how rare it is in the writing your reader actually does. A word an engineer meets constantly in specifications, code, and review comments is not rare _for that reader_, however a general corpus grades it. `terminate` is what `SIGTERM` means; `paradigm` is the word in "programming paradigm"; `utilization` is what a CPU graph is labelled; `obfuscate` is what a minifier does; `ubiquitous` is the U in Domain-Driven Design's Ubiquitous Language. Replacing any of them with a plainer synonym loses precision instead of gaining clarity, and the substitute reads as though the writer did not know the field.

So apply the ceiling to the words a document could have chosen freely, and exempt the vocabulary the named primary reader is assumed to know (see [audience-and-document-types.md](./audience-and-document-types.md)) — `idempotent`, `eventual consistency`, `mutex`, `epoch`, and the domain words below.

The ceiling is a strong default rather than an absolute: a doc set whose entire readership reads English natively pays less for an above-C1 word than a globally distributed one does. Weigh the deviation deliberately, and hold the ceiling wherever the readership is unknown — which, for anything published beyond one team, it usually is.

**Guidelines:**

- SHOULD keep word choice at CEFR C1 or below — if a plain everyday alternative carries the same meaning, use it. The test is not "could a native speaker understand this" but "would a B2/C1 reader read it without a dictionary".
- SHOULD NOT use words above C1 — both explicitly C2-graded words _and_ words rarer than C2 (off-list in the Oxford 5000) count. Off-list words are often _more_ obscure than C2 words, not less; rarity is the harm, not the label.
- SHOULD prefer Germanic-rooted everyday words over Latinate or literary synonyms even when both sit at C1 — `stop` over `cease`, `try` over `endeavor`, `despite` over `notwithstanding`, each of which the table below grades C1 and therefore allows. C1 is the ceiling, not the target; aim lower when a B1/B2 word fits.
- MUST NOT treat a domain term of art as a ceiling violation, whatever its CEFR grade — the graded lists measure rarity in general English, not in the reader's field, and a plainer synonym for a precise technical word costs meaning. Check the exempt list below before flagging a word.
- SHOULD avoid uncommon phrasal verbs and metaphorical idioms (`drill down into`, `roll out`, `iron out`, `shake out`, `walk back`); plain verbs (`investigate`, `release`, `resolve`, `surface`, `revise`) translate cleanly.
- MAY use the common Latin abbreviations `i.e.`, `e.g.`, and `etc.` freely — they are conventional in technical writing and reliably understood by B2/C1 readers. Rarer Latinisms (`ergo`, `ipso facto`, `inter alia`, `qua`) SHOULD be avoided.
- SHOULD run unfamiliar word choices through the [Oxford 5000 by CEFR level](https://www.oxfordlearnersdictionaries.com/about/wordlists/cefr) when in doubt; the cost of looking up a word once is far smaller than the cost of every reader looking it up forever.

**Reference:**

The following table pairs general-English offenders with plainer alternatives. Every entry is a word a technical document could have chosen freely — none carries a technical sense a synonym would lose, which is what separates this list from the exempt one after it. The **Level** column gives the CEFR grading where it exists; `above C2` means the word is rarer than the C2 list in the [Oxford 5000](https://www.oxfordlearnersdictionaries.com/about/wordlists/cefr). Rows are grouped from worst (rarest) to best (allowed but plainer alternative exists):

| Avoid                           | Level    | Prefer (plainer)                           |
| ------------------------------- | -------- | ------------------------------------------ |
| `ascertain`                     | above C2 | `find out`, `confirm`                      |
| `myriad`                        | above C2 | `many`, `several`                          |
| `exacerbate`                    | above C2 | `make worse`                               |
| `henceforth`, `heretofore`      | above C2 | `from now on`, `until now`                 |
| `tantamount to`                 | above C2 | `the same as`, `equal to`                  |
| `ostensibly`                    | above C2 | `apparently`, `seemingly`                  |
| `aforementioned`                | above C2 | `earlier`, `the previous` (or repeat noun) |
| `egregious`                     | above C2 | `very bad`, `serious`                      |
| `panacea`                       | above C2 | `complete fix`, `cure-all`                 |
| `quintessential`                | above C2 | `typical`, `classic`                       |
| `esoteric`                      | above C2 | `obscure`, `specialized`                   |
| `vis-à-vis`                     | above C2 | `compared to`, `in relation to`            |
| `leverage` (verb)               | above C2 | `use`, `take advantage of`                 |
| `plethora`                      | C2       | `many`                                     |
| `endeavor` / `endeavour` (noun) | C2       | `effort`, `attempt`                        |
| `commence`                      | C1       | `start`, `begin`                           |
| `albeit`                        | C1       | `although`, `even though`                  |
| `cease`                         | C1       | `stop`, `end`                              |
| `endeavor` / `endeavour` (verb) | C1       | `try`                                      |
| `notwithstanding`               | C1       | `despite`, `even so`                       |

The C1 entries are still allowed by the rule, but plainer alternatives exist and SHOULD be preferred.

**Exempt — do not flag these.** Each grades above C1 in general English and is nonetheless standard software-engineering vocabulary, so the ceiling does not reach it. The plainer synonym in the right-hand column of the table above would be wrong here, not merely plainer:

| Term of art                | The technical sense that a synonym loses                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `terminate`, `termination` | `SIGTERM`; terminating a process, connection, or instance; a loop's termination condition |
| `initiate`                 | Initiating a connection, a handshake, or a transaction                                    |
| `paradigm`                 | Programming paradigm — imperative, functional, object-oriented                            |
| `utilize`, `utilization`   | CPU, memory, and resource utilization                                                     |
| `obfuscate`, `obfuscation` | The deliberately unreadable output of a minifier or packer                                |
| `ubiquitous`               | Ubiquitous Language in Domain-Driven Design; ubiquitous computing                         |
| `manifold`                 | The geometric object in mathematics and machine learning                                  |
| `circumvent`               | Circumventing a security control, in security and threat-model writing                    |

Two further words — `cumbersome` and `facilitate` — are **not** terms of art, but they appear often enough in ordinary engineering prose that a B2/C1 reader does not stumble on either. Neither is worth flagging. This list is not closed: when a word carries a precise meaning in the document's own domain, exempt it and move on rather than reaching for a synonym.

**Bad Examples:**

> Ascertain whether the migration has commenced before you cut over.

> The legacy adapter, albeit slow, still runs on a myriad of hosts.

> Notwithstanding the aforementioned caveats, the change is tantamount to a rewrite.

**Good Examples:**

> Check whether the migration has started before you cut over.

> The legacy adapter is slow, but it still runs on many hosts.

> Despite the earlier caveats, the change is effectively a rewrite.

## Accessibility

Accessible documents convey meaning through more than one channel so the content survives screen readers and color-blind readers. Several accessibility wins are downstream consequences of other rules — descriptive link text and declared code-block languages help everyone.

**Guidelines:**

- MUST provide alt text for every non-decorative image; the alt text SHOULD describe the information the image conveys, not the image's appearance.
- MUST NOT rely on color alone to convey meaning (red text, green badges); pair color with a label, icon, or text marker so the meaning survives screen readers and color-blind readers.
- SHOULD use descriptive link text (covered in [structure-and-flow.md](./structure-and-flow.md)) — accessibility is a downstream consequence of the same rule.
- MUST follow a strict heading hierarchy without skipped levels; screen readers use the hierarchy as the document outline.
- SHOULD declare the language for syntax highlighting in code blocks (` ```ts `, ` ```bash `) — the highlighting helps sighted readers, and the explicit language helps automated tooling.

## Maintenance and Currency

Stale documentation is worse than missing documentation: a doc that confidently asserts last year's behavior misroutes readers who would otherwise read the code. ARID — _Accept Repetition In Documentation_ — applies: minor restatement for navigation is fine, but full duplication of a non-trivial passage is a maintenance trap, so link the second occurrence to the first.

**Guidelines:**

- MUST treat **stale documentation as worse than missing documentation** — a doc that confidently asserts last year's behavior misroutes readers who would otherwise read the code.
- SHOULD pair every published doc with an owner, a review cadence, or a "last verified" date; ownerless docs decay silently.
- SHOULD give a doc set **one source of truth** for each fact; when the same fact lives in two places, both will drift, and the reader will land on whichever copy ranks higher in search.
- SHOULD link the second occurrence to the first rather than fully duplicating a non-trivial passage (ARID); minor restatement for navigation is fine, but full duplication is a maintenance trap.
- SHOULD keep documentation near the code it describes (in the repo, ideally under version control) so changes to the code prompt changes to the docs in the same review.
- SHOULD delete a doc when its content is wrong and not worth fixing; an actively misleading doc is a liability, and removing it is a positive contribution.

## Self-Editing Before Publication

Good docs are edited, not just written: a first pass gets the content down and a second pass cuts and reorders. Distance from the draft, reading aloud, and a target reader's skim all surface problems the author's eye has already accepted.

**Guidelines:**

- MUST write at least two drafts — a first pass to get the content down, a second pass to cut and reorder. Single-draft docs read as single-draft docs.
- SHOULD take a break (hours, ideally a day) between drafting and editing; editing immediately after drafting reads past the same blind spots that produced the draft.
- SHOULD read the document aloud or use text-to-speech on the final pass — the ear catches awkward phrasing, run-on sentences, and missing words that the eye has already accepted.
- SHOULD cut on the second pass before adding — the first instinct on review is to clarify by adding more words; the better instinct is usually to remove the unclear sentence and rewrite shorter.
- SHOULD ask a target reader to skim the document and report what they think it says — the gap between intent and reception is the highest-value editing signal.
- MUST verify before publishing: every link resolves, every code example runs, every cross-reference points where it claims, and the scope statement still matches the body.
