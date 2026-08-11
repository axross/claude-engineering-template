// guidelines.mjs — the `**Guidelines:**` block boundary and the RFC-2119
// obligation rule, shared by this skill's validator and by tooling that counts
// obligations.
//
// what counts as a rule in a skill document is one definition with several
// readers. check-skill-body.mjs asks two questions of it — "is this in-block bullet
// missing a keyword?" (a failure) and "is this keyword bullet outside a block?"
// (an advisory) — and those two used to walk the document separately, each with
// its own copy of the boundary, under a comment reading "Change one and you must
// change both". a third reader that counts obligations would have made three.
//
// one walk with one boundary is what keeps them from disagreeing about the same
// bullet, each silently believing another covered it. this is the same move that
// collapsed two drifted fence scanners into commonmark.mjs; see that module's
// header for the drift it was written to end.
//
// the boundary's load-bearing edges, and why each is what it is:
//
//   * A `**Guidelines:**` label opens a block. the label is a documentation
//     convention, not a CommonMark construct, so nothing about it is derivable
//     from the Markdown alone.
//   * A blank line does not close it — a loose list is still one list.
//   * A fenced block does not close it. authors interleave an illustrative block
//     between rules naturally, and treating it as a boundary would silently stop
//     checking every bullet after it.
//   * A heading, or an unindented non-bullet line, does close it.
//   * Only bullets at zero indentation are rules. nested items carry
//     continuation detail.
//
// this module is not an executable: it carries no CLI, is dependency-light
// (Node standard library only, plus the fence scanner beside it), and ships in
// this skill so its importers stay runnable from an installed copy.

import { scanLines } from "./commonmark.mjs";

/**
 * an RFC-2119 requirement keyword at the start of a rule, uppercase only.
 *
 * order matters: the longer alternatives precede the shorter ones they contain,
 * so "MUST NOT" never matches as a bare "MUST". a prohibition read as an
 * obligation would invert the rule's sense.
 */
export const RFC2119_RE =
  /^(MUST NOT|MUST|SHOULD NOT|SHOULD|NOT RECOMMENDED|RECOMMENDED|REQUIRED|OPTIONAL|MAY)\b/;

/** the bold label that opens a guidelines block, alone on its line. */
export const GUIDELINES_RE = /^\*\*Guidelines:\*\*\s*$/;

/**
 * walk a document's guideline structure once, yielding an event per heading and
 * per top-level bullet outside a fenced block.
 *
 * bullets are yielded whether or not they sit inside a block, and whether or not
 * they open with a keyword, because "outside a block" is defined as the
 * complement of "inside" one: a caller that needs either needs both, from the
 * same walk.
 *
 * line endings are normalized here rather than by the caller, so a CRLF-authored
 * document reads identically to an LF one. line numbers are unaffected.
 *
 * @param {string} body
 * @yields {{ kind: "heading", line: number, title: string }
 *        | { kind: "bullet", line: number, rule: string, keyword: string | null, inBlock: boolean }}
 *   `line` is 1-based; `rule` is the bullet's trimmed text; `keyword` is the
 *   matched RFC-2119 keyword or null; `inBlock` is whether a `**Guidelines:**`
 *   block was open at that bullet.
 */
export function* scanGuidelines(body) {
  let inBlock = false;

  for (const { line, text, fence } of scanLines(body.replace(/\r\n/g, "\n"))) {
    // a fence is continuation. the scanner hides a fenced block's interior and
    // yields only its opener, so skipping that opener leaves the block spanning
    // it — and leaves an illustrative `- MUST …` inside it uncounted.
    if (fence) continue;

    const heading = text.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      inBlock = false;
      yield { kind: "heading", line, title: heading[1].trim() };
      continue;
    }
    if (GUIDELINES_RE.test(text)) {
      inBlock = true;
      continue;
    }

    const bullet = text.match(/^-\s+(.*)$/);
    if (bullet) {
      const rule = bullet[1].trim();
      const keyword = rule.match(RFC2119_RE);
      yield { kind: "bullet", line, rule, keyword: keyword ? keyword[0] : null, inBlock };
      continue;
    }

    if (!inBlock) continue;
    if (text.trim() === "" || /^\s/.test(text)) continue;
    inBlock = false;
  }
}

/**
 * how many obligations a document states: top-level bullets inside a
 * `**Guidelines:**` block that open with an RFC-2119 keyword.
 *
 * this is the quantity a reader of the document is being asked to hold, so it
 * deliberately excludes a keyword bullet placed outside a block (which
 * check-skill-body.mjs reports as a `placement:` advisory rather than counting) and
 * an in-block bullet with no keyword (which it reports as a `guidelines:`
 * failure). the three views partition the same bullets.
 *
 * @param {string} body
 * @returns {number}
 */
export function countObligations(body) {
  let count = 0;
  for (const event of scanGuidelines(body)) {
    if (event.kind === "bullet" && event.inBlock && event.keyword) count += 1;
  }
  return count;
}
