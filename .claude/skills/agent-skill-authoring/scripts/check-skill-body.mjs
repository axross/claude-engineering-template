#!/usr/bin/env node
// the document-body rules, across a skill's SKILL.md and every reference.
//
// run it after editing prose. what it judges is the shape of the writing — a
// section that states rules before demonstrating anything, a guideline bullet
// that does not open with an RFC-2119 keyword, and the advisories around
// length, placement, style, hedging, and uncited version claims.
//
// it reads every document a skill has, which is what makes it the slowest of
// the three; the frontmatter command exists partly so that cost is not paid
// when only the frontmatter changed.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { FENCE_RE, scanLines, unterminatedFenceLine } from "./commonmark.mjs";
import {
  GUIDELINES_RE,
  RFC2119_RE,
  ROUTING_LINE_RE,
  scanGuidelines,
} from "./guidelines.mjs";
import {
  runCli,
  siblingHelp,
  skillDocuments,
  splitFrontmatter,
} from "./skill-documents.mjs";
import {
  BYTES_PER_TOKEN,
  estimateTokens,
  PROXY_UNCERTAINTY,
} from "./token-estimate.mjs";

// structural advisories (warnings only — see the header note).

// the byte→token proxy behind the size budget — why bytes rather than a
// tokenizer, how the divisor was calibrated, and why it is only good to
// PROXY_UNCERTAINTY — belongs to token-estimate.mjs, which this imports rather
// than restating. the budget below is expressed in tokens and converted once.
const SKILL_TOKEN_MAX = 5000;

const SKILL_BYTES_MAX = Math.round(SKILL_TOKEN_MAX * BYTES_PER_TOKEN);

// near seven bullets is the target; above ten the rule requires a stated
// reason, which a bare threshold cannot see — so both bands only warn.
const SECTION_BULLETS_NEAR = 8;

const SECTION_BULLETS_MAX = 10;

// adverbs only, and only immediately after the keyword. a wider list, or an
// unanchored match, was measured at ~95% false positives on real skill prose.
const HEDGE_RE =
  /^(generally|usually|typically|ideally|probably|possibly|perhaps|maybe|often|sometimes|normally)\b/i;

// a label the project standard wants emphasized as `**Guidelines:**`.
const PLAIN_LABEL_RE = /^(Guidelines|Examples?):\s*$/;

const TEXT_FENCE_RE = /^text\b/i;

// upstream-citation advisories (warnings only — see the header note).

// the rule pair these mechanize sits in body-content-style.md: a MUST to
// cite the upstream URL in any section that pins a version or mirrors a
// vendor's option surface, and a SHOULD to attach that URL to a `Verified
// against` line. the SHOULD is checkable as written; the MUST is not.

// "mirrors a vendor's option surface" is a judgment no pattern decides —
// exactly the exception clause a threshold would misencode. so this proxies
// only the mechanical half — a version pin — and only in its least
// ambiguous form, a document citing no URL at all.
const VERIFIED_AGAINST_RE = /^\s*(?:[*_]{1,2})?Verified against\b/i;

const URL_RE = /https?:\/\/[^\s)>\]"']+/g;

// separate and non-global, because a /g/ regex carries lastIndex between calls
// and `.test()` on one would skip every other line it was asked about.
const HAS_URL_RE = /https?:\/\//i;

// the RFC-2119 boilerplate every skill carries, and the tracker it redirects
// through. counting these as documentation would make every skill look cited,
// which is why the citation count below is "non-RFC URLs" rather than URLs.
const SPEC_BOILERPLATE_HOST_RE = /^https?:\/\/(?:www\.)?(?:rfc-editor\.org|datatracker\.ietf\.org)\//i;

// a version pin, in the four shapes this corpus actually writes. each requires
// a digit bound to a version-bearing word, so prose numbers ("8px grid", "Top
// 10") cannot match: a package at a semver, an SDK or release line, a `v`-
// prefixed major, and a spelled-out "version <n>".
const VERSION_PIN_RES = [
  /(?:^|[\s`(])@?[a-z0-9][a-z0-9.@/-]*[a-z0-9]\s+\d+\.\d+\.\d+\b/i,
  /\bSDK\s+\d+\b/i,
  /(?:^|[\s`(])v\d+(?:\.\d+)*\b/,
  /\bversion\s+\d+\b/i,
];

/**
 * an unclosed fenced block: fatal, not advisory, because of what it does to
 * every other check here. `scanLines` (and every walk built on it —
 * `scanGuidelines` included) treats an unterminated fence as open for the
 * rest of the document, so every line after it is silently dropped from
 * every check below, this file's own routing-block rule included. A `SKILL.md`
 * that would otherwise fail the build instead reports PASS, which is worse
 * than reporting nothing: it is a merge gate a malformed document defeats
 * rather than trips. `check-links.mjs` treats the same condition as a WARN,
 * because its own contract already tolerates reading less than the whole
 * file; this command's does not.
 */
function unterminatedFenceFailures(body, file, offset) {
  const at = unterminatedFenceLine(body);
  if (at === null) return [];
  return [
    `fence: ${file}:${at + offset} fenced block opened here is never closed — every check below this line was skipped, since nothing after an unterminated fence can be read as prose.`,
  ];
}

/**
 * sections that state requirements without demonstrating the topic first: a
 * `##`+ heading separated from its `**Guidelines:**` block by nothing but blank
 * lines. any other line — including a fence opener — is the demonstration.
 */
function sectionIntroFailures(body, file, offset) {
  const failures = [];
  let pending = null;

  for (const { line, text, fence } of scanLines(body)) {
    if (!fence) {
      const heading = text.match(/^#{2,}\s+(.*)$/);
      if (heading) {
        pending = { line, title: heading[1].trim() };
        continue;
      }
      if (text.trim() === "") continue;
      if (pending && GUIDELINES_RE.test(text)) {
        failures.push(
          `section: "${pending.title}" (${file}:${pending.line + offset}) lists requirements with nothing between the heading and its \`**Guidelines:**\` block.`,
        );
      }
    }
    pending = null;
  }
  return failures;
}

/**
 * top-level bullets inside a `**Guidelines:**` block that do not open with an
 * RFC-2119 keyword.
 *
 * the block boundary — what opens it, and why neither a blank line nor a fence
 * closes it — belongs to guidelines.mjs, which this reads through
 * `scanGuidelines`. `guidelineStructureWarnings` reads that same walk, so the
 * two cannot disagree about whether a given bullet is inside a block.
 */
function guidelineKeywordFailures(body, file, offset) {
  const failures = [];

  for (const event of scanGuidelines(body)) {
    if (event.kind !== "bullet" || !event.inBlock || event.keyword) continue;
    failures.push(
      `guidelines: ${file}:${event.line + offset} bullet does not open with an RFC-2119 keyword: "${event.rule.slice(0, 60)}…"`,
    );
  }
  return failures;
}

/**
 * a read obligation: an RFC-2119 bullet whose keyword is followed immediately
 * by "read" and a link to a reference file — `MUST read
 * [name.md](./references/name.md) before …`, the shape every genuine read
 * obligation across the corpus already takes. Recognized structurally — the
 * word right after the keyword, and a link into `./references/` somewhere in
 * the bullet — rather than by testing for the substring "read" anywhere in
 * the text.
 *
 * the word is matched literally, not against every RFC-2119-adjacent synonym
 * a bullet could use ("REQUIRED reading of …" and the like) — a deliberate
 * narrowing, not an oversight. every read obligation in the corpus already
 * writes `read`, and broadening the match to catch a synonym that does not
 * exist yet would also admit looser phrasings this rule exists to reject;
 * tighten this only against a real bullet the corpus actually needs.
 *
 * @param {string} rule the bullet's trimmed text
 * @param {string} keyword the RFC-2119 keyword `rule` opens with
 * @returns {boolean}
 */
function isReadObligation(rule, keyword) {
  const rest = rule.slice(keyword.length).trimStart();
  return (
    /^read\b/i.test(rest) &&
    /\[[^\]]+\.md\]\(\.\/references\/[^)]+\)/.test(rule)
  );
}

/**
 * the `**Guidelines:**` block a routing list introduces — SKILL.md only,
 * since a routing list is a SKILL.md construct — must carry read obligations
 * and nothing else. This is the contract `progressive-disclosure.md` states:
 * a body-resident rule may stand before a routing list, or after it behind a
 * paragraph explaining why, but never folded in among the list's own read
 * obligations, where a reader looking for "what do I open, and when" would
 * find a requirement instead.
 *
 * the routing list's own boundary — the `See […](./references/…) for:` line
 * — is shared from guidelines.mjs's `ROUTING_LINE_RE`, the same one
 * check-skill-references.mjs's `routingBullets` keys on, so the two
 * validators cannot disagree about where a routing list starts. Finding
 * which `**Guidelines:**` block (if any) that list introduces — no
 * intervening `#` heading, no intervening prose paragraph, where a blank
 * line, a routing bullet, and an indented continuation are none of them
 * prose — is this rule's own, since only check-skill-body.mjs asks it.
 *
 * a fenced block encountered while looking for that guidelines block is
 * skipped rather than treated as the prose that would rule one out — the same
 * choice guidelines.mjs's own block-boundary makes, for the same reason: an
 * author interleaving an illustrative fence should not silently stop this
 * rule from reaching the block after it.
 *
 * @param {string} body
 * @param {string} file
 * @param {number} offset
 * @returns {string[]}
 */
function routingBlockFailures(body, file, offset) {
  const failures = [];
  const lines = [...scanLines(body)];

  let i = 0;
  while (i < lines.length) {
    const { text, fence } = lines[i];
    if (fence || !ROUTING_LINE_RE.test(text)) {
      i += 1;
      continue;
    }

    // walk past the routing list itself: bullets, and the blank lead-in gap
    // before the first one. anything else — including a blank line once
    // bullets have started — ends it.
    let j = i + 1;
    let seenBullet = false;
    while (j < lines.length) {
      const cur = lines[j];
      if (cur.fence) {
        j += 1;
        continue;
      }
      if (/^#{1,6}\s+/.test(cur.text)) break;
      if (/^-\s+/.test(cur.text)) {
        seenBullet = true;
        j += 1;
        continue;
      }
      if (cur.text.trim() === "" && !seenBullet) {
        j += 1;
        continue;
      }
      break;
    }

    // from there, look for the `**Guidelines:**` block this list introduces.
    let k = j;
    let blockIndex = null;
    while (k < lines.length) {
      const cur = lines[k];
      if (cur.fence) {
        k += 1;
        continue;
      }
      if (cur.text.trim() === "" || /^-\s+/.test(cur.text) || /^\s/.test(cur.text)) {
        k += 1;
        continue;
      }
      if (/^#{1,6}\s+/.test(cur.text)) break; // no block introduced
      if (GUIDELINES_RE.test(cur.text)) blockIndex = k;
      break; // either the block found, or a prose paragraph ruling one out
    }

    if (blockIndex === null) {
      i = j;
      continue;
    }

    let m = blockIndex + 1;
    while (m < lines.length) {
      const cur = lines[m];
      if (cur.fence) {
        m += 1;
        continue;
      }
      if (/^#{1,6}\s+/.test(cur.text)) break;
      if (cur.text.trim() === "" || GUIDELINES_RE.test(cur.text)) {
        m += 1;
        continue;
      }
      const bullet = cur.text.match(/^-\s+(.*)$/);
      if (bullet) {
        const rule = bullet[1].trim();
        const keyword = rule.match(RFC2119_RE);
        if (keyword && !isReadObligation(rule, keyword[0])) {
          failures.push(
            `routing-block: ${file}:${cur.line + offset} guidelines block introduced by a routing list carries a bullet that is not a read obligation: "${rule.slice(0, 60)}…"`,
          );
        }
        m += 1;
        continue;
      }
      if (/^\s/.test(cur.text)) {
        m += 1;
        continue;
      }
      break;
    }
    i = m;
  }

  return failures;
}

/**
 * the advisory warnings a document's guideline structure raises, in one walk:
 * section length, bullet placement, and hedging.
 *
 * reads the same `scanGuidelines` walk `guidelineKeywordFailures` does, so
 * "outside a block" is exactly the complement of "inside" one. that shared
 * boundary is the point: two definitions would let the two checks disagree about
 * the same bullet, each silently believing the other covered it.
 *
 * a section is the span under one heading of any level whatever, so a nested
 * subsection is counted independently of its parent: the ceiling rule applies
 * to each.
 */
function guidelineStructureWarnings(body, file, offset) {
  const warnings = [];
  let section = null; // { line, title, bullets } of the heading in scope

  const flushSection = () => {
    if (!section || section.bullets < SECTION_BULLETS_NEAR) return;
    const at = `${file}:${section.line + offset}`;
    warnings.push(
      section.bullets > SECTION_BULLETS_MAX
        ? `length: "${section.title}" (${at}) has ${section.bullets} guideline bullets — over the ceiling of ten; split it or state why the exception is necessary.`
        : `length: "${section.title}" (${at}) has ${section.bullets} guideline bullets — approaching the ceiling of ten; the target is near seven.`,
    );
  };

  for (const event of scanGuidelines(body)) {
    if (event.kind === "heading") {
      flushSection();
      section = { line: event.line, title: event.title, bullets: 0 };
      continue;
    }
    const { line, rule, keyword, inBlock } = event;
    if (inBlock) {
      if (section) section.bullets += 1;
      const hedge = keyword
        ? rule.slice(keyword.length).trimStart().match(HEDGE_RE)
        : null;
      if (hedge) {
        warnings.push(
          `hedging: ${file}:${line + offset} "${keyword}" is followed by the hedge "${hedge[0]}": "${rule.slice(0, 60)}…"`,
        );
      }
    } else if (keyword) {
      warnings.push(
        `placement: ${file}:${line + offset} RFC-2119 bullet sits outside any \`**Guidelines:**\` block: "${rule.slice(0, 60)}…"`,
      );
    }
  }
  flushSection();
  return warnings;
}

/**
 * stale document style: a plain `Guidelines:`/`Example:` label where the
 * standard is a bold subheading-like paragraph, and a fenced `text` block where
 * a blockquote usually reads better.
 *
 * two findings rather than one, because they mechanize different rules at
 * different requirement levels and their remedies are unrelated — one merged
 * message would have to misstate one of them.
 */
function staleStyleWarnings(body, file, offset) {
  const warnings = [];

  for (const { line, text, fence } of scanLines(body)) {
    if (fence) {
      // the scanner yields a fence's opener so callers can treat the block as
      // content; re-matching it here is how its info string is read, which
      // keeps the shared scanner's shape unchanged.
      if (TEXT_FENCE_RE.test(text.match(FENCE_RE)[2].trim())) {
        warnings.push(
          `fences: ${file}:${line + offset} fenced \`text\` block — a blockquote under a bold example label is usually clearer.`,
        );
      }
      continue;
    }
    const label = text.match(PLAIN_LABEL_RE);
    if (label) {
      warnings.push(
        `labels: ${file}:${line + offset} plain "${label[1]}:" label — emphasize it as a bold paragraph (\`**${label[1]}:**\`).`,
      );
    }
  }
  return warnings;
}

/**
 * upstream-citation advisories for one document.
 *
 * signal 1 fires once per uncited `Verified against` line, so a document
 * carrying several reports several. signal 2 fires at most once, and only when
 * signal 1 found nothing. no document in this corpus repeats a `Verified
 * against` line today, which makes the two indistinguishable here — an
 * observation about this tree, not a cap the code enforces.
 *
 * two signals, in priority order:
 *
 *   1. a `Verified against …` line carrying no URL on the line itself. this
 *      one is exact, and needs no document-level context: the line asserts
 *      that something was checked at some point, the rule is that the URL
 *      rides the claim, and a citation three sections away does not discharge
 *      it.
 *   2. failing that, a document that pins a version anywhere in its prose while
 *      citing no documentation URL at all.
 *
 * the second is deliberately the weaker half of its rule. the MUST it proxies
 * turns on "pins a version or mirrors a vendor's option surface", and only the
 * first disjunct is mechanical — so a document that reproduces an option table
 * without naming a version stays silent here, and remains a reviewer's finding.
 * it is document-level rather than section-level because this corpus puts the
 * citation in a document's opening line, which a section-scoped check would read
 * as absent from every section below it. and it fires only at a count of zero,
 * so one URL anywhere silences it: at one citation the question stops being
 * "was anything checked?" and becomes "is this the right page?", which is
 * judgment.
 *
 * signal 1 suppresses signal 2 in the same document. both have the identical
 * remedy — add the URL — and reporting one missing citation twice would inflate
 * the count that scopes the cleanup.
 *
 * URLs are counted across the whole document, fenced blocks included, because a
 * link in a code sample still tells a reader where to look. version pins are
 * read from prose only, so a lockfile excerpt showing `"vitest": "^4.1.10"` is
 * not read as the document pinning Vitest. both choices push toward silence.
 */
function citationWarnings(body, file, offset) {
  const warnings = [];
  let pin = null;

  for (const { line, text, fence } of scanLines(body)) {
    if (fence) continue;

    if (VERIFIED_AGAINST_RE.test(text)) {
      // judged on the line itself, not on the document: the rule is that the
      // URL rides the claim, so a citation three sections away does not
      // discharge it. this is the exact half, and it needs no document-level
      // context.
      if (!HAS_URL_RE.test(text)) {
        warnings.push(
          `citation: ${file}:${line + offset} "${text.trim().slice(0, 60)}…" states a verification with no URL to check it against.`,
        );
      }
      continue;
    }
    if (!pin && VERSION_PIN_RES.some((pattern) => pattern.test(text))) {
      pin = { line, text };
    }
  }

  if (warnings.length > 0 || !pin) return warnings;

  const cited = (body.match(URL_RE) ?? []).some(
    (url) => !SPEC_BOILERPLATE_HOST_RE.test(url),
  );
  if (cited) return warnings;

  return [
    `citation: ${file}:${pin.line + offset} pins a version ("${pin.text.trim().slice(0, 60)}…") but the document cites no documentation URL.`,
  ];
}

/**
 * the SKILL.md size advisory, or null when the file is within budget. reports
 * the raw byte count alongside the estimate so a reader can redo the division
 * and judge a borderline case themselves — the proxy is only good to ±5%.
 */
function skillSizeWarning(raw) {
  const bytes = Buffer.byteLength(raw, "utf8");
  if (bytes <= SKILL_BYTES_MAX) return null;
  const estimate = estimateTokens(bytes);
  return `size: SKILL.md is ${bytes} bytes, ~${estimate} estimated tokens (÷ ${BYTES_PER_TOKEN}, ${PROXY_UNCERTAINTY}) — over the ~${SKILL_TOKEN_MAX}-token budget of ${SKILL_BYTES_MAX} bytes; move detail into references/.`;
}

/** the body findings for one skill directory. */
async function check(dir) {
  const failures = [];
  const warnings = [];

  let raw;
  try {
    raw = await readFile(join(dir, "SKILL.md"), "utf8");
  } catch (error) {
    return { failures: [`SKILL.md is unreadable: ${error.message}`], warnings };
  }

  const size = skillSizeWarning(raw);
  if (size) warnings.push(size);

  const { body, offset } = splitFrontmatter(raw);
  const { documents } = await skillDocuments(dir, body, offset);

  for (const { file, body: text, offset: at } of documents) {
    failures.push(...unterminatedFenceFailures(text, file, at));
    failures.push(...sectionIntroFailures(text, file, at));
    failures.push(...guidelineKeywordFailures(text, file, at));
    if (file === "SKILL.md") failures.push(...routingBlockFailures(text, file, at));
    warnings.push(...guidelineStructureWarnings(text, file, at));
    warnings.push(...staleStyleWarnings(text, file, at));
    warnings.push(...citationWarnings(text, file, at));
  }

  return { failures, warnings };
}

const USAGE = `Usage: check-skill-body.mjs <skill-dir | skill-root> [more paths…]

Check the document-body rules across a skill's SKILL.md and every
references/*.md: an unclosed fenced block (fatal — every check below it is
silently skipped otherwise), a section that states requirements with nothing
demonstrating the topic first, and a guidelines bullet that does not open with
an RFC-2119 keyword. In SKILL.md only, also check that the \`**Guidelines:**\`
block a routing list introduces carries read obligations — \`MUST read
[file.md](...) before …\` — and nothing else; an ordinary rule folded in
among them is a failure, naming the file, the line, and the offending bullet.
Advisories cover size, section length, bullet placement, stale label and
fence style, hedging, and a version claim with nothing to check it against.
Run it after editing prose.

A <path> is either a skill directory (one holding SKILL.md) or a directory whose
immediate subdirectories are skills. A symlinked entry is followed.

Exit codes: 0 all skills passed, 1 one or more failed, 2 bad invocation.
Advisory WARN lines never affect the exit code.
${siblingHelp("check-skill-body.mjs")}`;

await runCli({ usage: USAGE, check });
