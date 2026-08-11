// commonmark.mjs — which lines of a Markdown document are prose, and which only
// show example text. shared by this skill's validators.
//
// two rules live here, and both exist for the same reason: a validator has to be
// able to read a document that shows the very syntax it checks for.
//
// the fenced-block rule (`scanLines`, `unterminatedFenceLine`). the skill-body
// and check-links.mjs must ignore content inside fenced code blocks, so the
// skill-authoring docs can show `[file.md](./references/file.md)` or a
// `- MUST …` bullet as an example without either validator reading it as the
// real thing. that rule lived twice — once here in JavaScript and once as an awk
// program inside check-links.sh — and the two drifted: both used to toggle state
// on any fence-looking line, so an inner ```ts block inverted the state and
// exposed the enclosing block's content as body text.
//
// the prose rule (`extractProse`). fenced blocks, inline code spans, and HTML
// comments all carry text a reader is meant to see and a checker is not meant to
// believe — and the order in which the three are removed decides whether a
// comment opener that is only being quoted gets believed. that rule also lived
// twice, and the two copies also drifted: check-links.mjs stripped comments from
// the raw source and silently discarded 90 lines of this repository's README
// behind such an opener, while scripts/link-freshness/urls.mjs blanked code
// spans first and did not.
//
// one implementation is what keeps either drift from recurring. this module is
// not an executable: it carries no CLI, and is imported by the two scripts
// beside it — which ship together in this skill — and by any repository tooling
// that must read the same corpus the same way.
//
// it is dependency-light (no imports at all) and makes no assumption about what
// a document means — it reports which lines are outside a fence and which text
// is prose, and callers decide what to read from them.

/**
 * a line that opens or closes a fenced block: 3+ backticks or 3+ tildes after
 * optional leading whitespace. group 1 is the marker, group 2 the rest of the
 * line (an info string on an opening fence, blank on a closing one).
 */
export const FENCE_RE = /^[ \t]*(`{3,}|~{3,})(.*)$/;

/**
 * per CommonMark, a fence closes only on a marker of the same character, at
 * least as long as the opener, carrying no info string. that is what lets a
 * longer fence legally contain shorter ones — a ````markdown block wrapping a
 * ```ts block, as this repository's own references do. toggling on any
 * fence-looking line inverts the state inside such a block and exposes its
 * content as body text.
 *
 * @param {RegExpMatchArray | null} marker a FENCE_RE match, or null
 * @param {string} char the open fence's marker character
 * @param {number} length the open fence's marker length
 * @returns {boolean}
 */
export function closesFence(marker, char, length) {
  return (
    marker !== null &&
    marker[1][0] === char &&
    marker[1].length >= length &&
    marker[2].trim() === ""
  );
}

/**
 * walk a document once, tracking fenced blocks.
 *
 * the single state machine behind every export here — `scanLines` and
 * `unterminatedFenceLine` are two views of this one result, so a caller can
 * never observe the two disagreeing about where a fence opened or closed.
 *
 * @param {string} body
 * @returns {{
 *   lines: Array<{ line: number, text: string, fence: boolean }>,
 *   unterminatedAt: number | null,
 * }} `lines` holds every line outside a fence plus each fence's opening line
 *   marked `fence: true`; `unterminatedAt` is the 1-based line of a fence still
 *   open at end of file, or null.
 */
function scanDocument(body) {
  let fenceChar = null; // open fence's marker character, or null outside a fence
  let fenceLength = 0; // and its length — a closer must be at least this long
  let fenceOpenedAt = 0;
  const lines = [];
  const source = body.split("\n");

  for (let index = 0; index < source.length; index += 1) {
    const text = source[index];
    const marker = text.match(FENCE_RE);
    if (fenceChar !== null) {
      if (closesFence(marker, fenceChar, fenceLength)) fenceChar = null;
      continue;
    }
    if (marker) {
      fenceChar = marker[1][0];
      fenceLength = marker[1].length;
      fenceOpenedAt = index + 1;
      lines.push({ line: index + 1, text, fence: true });
      continue;
    }
    lines.push({ line: index + 1, text, fence: false });
  }

  return { lines, unterminatedAt: fenceChar === null ? null : fenceOpenedAt };
}

/**
 * every line outside a fenced block, plus each fence's opening line marked
 * `fence: true`, as `{ line, text, fence }`.
 *
 * surfacing the opener is what lets a caller treat a fenced block as content
 * without seeing inside it. the section-intro check needs exactly that: a
 * section whose demonstration is a code block must not read as a heading
 * abutting its `**Guidelines:**` label. callers that only care about prose skip
 * the marked lines.
 *
 * @param {string} body
 */
export function* scanLines(body) {
  yield* scanDocument(body).lines;
}

/**
 * the 1-based line where a fence was opened and never closed, or null when
 * every fence closed.
 *
 * an unterminated fence is legal CommonMark — the block simply runs to the end
 * of the document — so this is a caller's cue to WARN rather than fail. it
 * matters because everything after that opener went unread.
 *
 * @param {string} body
 * @returns {number | null}
 */
export function unterminatedFenceLine(body) {
  return scanDocument(body).unterminatedAt;
}

/**
 * an inline code span: a run of backticks, at least one character that is not a
 * backtick, then a closing run. text inside one is being shown, not used — a
 * link or a comment opener written there is an example, not the real thing.
 */
const CODE_SPAN_RE = /`+[^`]+`+/g;

/**
 * a string of just the newlines in `text`, so a removed span leaves the lines
 * after it at their original numbers.
 *
 * @param {string} text
 * @returns {string}
 */
function newlinesOf(text) {
  return "\n".repeat((text.match(/\n/g) ?? []).length);
}

/**
 * drop every HTML comment, replacing each span with its own newlines.
 *
 * a dangling unclosed `<!--` is kept as content. it comments out the rest of a
 * rendered document, but honouring it here would silently stop reading at that
 * point — the failure mode that looks like a clean result rather than like a
 * failure.
 *
 * @param {string} content
 * @returns {string}
 */
function stripHtmlComments(content) {
  let stripped = "";
  let rest = content;

  for (;;) {
    const openAt = rest.indexOf("<!--");
    if (openAt === -1) break;
    const closeOffset = rest.slice(openAt + 4).indexOf("-->");
    if (closeOffset === -1) break;

    const spanLength = closeOffset + 7; // "<!--" + body + "-->"
    stripped += rest.slice(0, openAt) + newlinesOf(rest.slice(openAt, openAt + spanLength));
    rest = rest.slice(openAt + spanLength);
  }
  return stripped + rest;
}

/**
 * a document with everything that only shows text blanked out — fenced blocks,
 * inline code spans, and HTML comments — every line left in place, so line N of
 * the result is line N of the source.
 *
 * the order is the point here, and getting it backwards fails silently rather
 * than loudly. comments are stripped last, from text whose fences and code
 * spans are already blank, so a `<!--` has to be real prose to open one.
 * stripped first, from the raw source, an opener that is only being quoted is
 * believed and everything up to the next `-->` disappears: this repository's
 * own README documents the `count:` marker rule with the sentence "a line
 * beginning with `<!--` is an HTML block in CommonMark", and reading that raw
 * discarded the 90 lines after it, links and all, while every check over them
 * still reported clean.
 *
 * the limit that order accepts: a real comment whose closing `-->` sits inside a
 * fenced block loses that closer to the blanking pass, so the comment reads as
 * dangling and its body survives as content. strictly, CommonMark parses neither
 * construct that way — an HTML comment's contents are not Markdown at all — and
 * only a single interleaved pass gets both right. that is deliberately not built
 * here: it changes behavior only for a shape no document in this corpus has, and
 * this failure leaks text into the checks rather than hiding it from them, which
 * is the direction worth failing in.
 *
 * @param {string} body raw file content; `\r` is normalised away here so no
 *   caller has to remember to
 * @returns {{
 *   lines: Array<{ line: number, text: string }>,
 *   unterminatedFenceAt: number | null,
 * }} `lines` holds one entry per source line, numbered from 1;
 *   `unterminatedFenceAt` is the 1-based line of a fence still open at end of
 *   file, or null. both come from a single walk, so a caller can never observe
 *   the two disagreeing.
 */
export function extractProse(body) {
  const source = body.replace(/\r/g, "");
  const { lines, unterminatedAt } = scanDocument(source);

  // scanDocument omits fenced content entirely and marks each opening fence, so
  // a line it does not yield is blanked here by absence.
  const byLine = [];
  for (const { line, text, fence } of lines) {
    byLine[line] = fence ? "" : text.replace(CODE_SPAN_RE, "");
  }

  const lineCount = source.split("\n").length;
  const blanked = Array.from(
    { length: lineCount },
    (_, index) => byLine[index + 1] ?? "",
  ).join("\n");

  return {
    lines: stripHtmlComments(blanked)
      .split("\n")
      .map((text, index) => ({ line: index + 1, text })),
    unterminatedFenceAt: unterminatedAt,
  };
}
