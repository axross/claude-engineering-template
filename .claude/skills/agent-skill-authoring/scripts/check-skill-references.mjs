#!/usr/bin/env node
// the wiring between a SKILL.md and its references/ directory.
//
// run it after adding, moving, or renaming a reference file. four things have
// to hold for progressive disclosure to work at all: every reference is reached
// from the parent, every relative link stays inside the skill, every heading
// fragment resolves, and a routing bullet routes rather than states a rule.
//
// a link whose target file does not resolve is deliberately not reported here —
// that is check-links.mjs's finding, and reporting it in both would put one
// defect behind two gates.

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

import { scanLines } from "./commonmark.mjs";
import { RFC2119_RE } from "./guidelines.mjs";
import {
  isDir,
  runCli,
  siblingHelp,
  skillDocuments,
  skillRelative,
  splitFrontmatter,
} from "./skill-documents.mjs";

// an absolute URI (http:, https:, mailto:, …) or a protocol-relative URL: not a
// path this validator can resolve on disk.
const EXTERNAL_TARGET_RE = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

// routing-concreteness advisory (warnings only — see the header note).

// the abstract nouns a gestural routing bullet reaches for, held to the set the rule
// and its examples enumerate. wider sets were tried and cost more than they found:
// `function`, `property`, `value`, `field`, and `parameter` already name their subject
// well enough, so including them bought only noise.
const GESTURE_NOUNS =
  "flags?|limits?|files?|rules?|options?|settings?|approaches|details?|caveats?|conditions?|requirements?|thresholds?|caps?";

// three refinements, measured against the corpus: emphasis markers are skipped, so a
// bolded gesture still reads as one; `(?![\w-])` not `\b`, so "the file-notation set"
// doesn't match on its "file" prefix; and a gerund right before it exempts the phrase
// — "naming the file" performs the naming, not withholds it.
const ROUTING_GESTURE_RE = new RegExp(
  `(?<!ing\\s)\\bthe\\s+[*_]{0,2}(?:${GESTURE_NOUNS})(?![\\w-])`,
  "i",
);

// a bullet instructing the reader to name something is stating this rule, not
// breaking it. `agent-skill-authoring`'s own A2 bullet — "the flag, limit, or
// rule by name" — is the case every hand-run count of this defect has
// mis-flagged, so the exclusion is deliberate rather than incidental.

// held to that one phrase: "rather than" and "instead of" were tried and
// silenced a real gesture — next-app-development's "the options that change
// behaviour rather than tune it" — because those carry no connection to
// naming, and hiding a defect this way is worse than the false positive it bought.
const ROUTING_META_RE = /\bby name\b/i;

/**
 * a heading's GitHub anchor slug: lowercase, delete everything that is not a
 * letter, number, mark, ASCII space, `-`, or `_`, then replace each remaining
 * space with a hyphen.
 *
 * replacing spaces one at a time rather than collapsing runs is the
 * load-bearing detail. GitHub deletes an em dash and leaves both flanking
 * spaces, so `## Phase 1 — Plan` is `phase-1--plan`, not `phase-1-plan`; a
 * collapsing implementation reports every such link as broken. link syntax is
 * reduced to its text first, since the slug comes from the rendered heading.
 * emphasis markers are not unwrapped — `_x_` would slug as `_x_` rather than
 * `x` — which is a known divergence with no instances in a heading to date.
 */
function slugify(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+#+\s*$/, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M} _-]/gu, "")
    .replace(/ /g, "-");
}

/**
 * every anchor a document's headings define, including GitHub's `-1`, `-2`
 * suffixes for repeated headings. headings inside fences are illustrative and
 * define no anchor.
 *
 * line endings are normalized here rather than by the caller: this reads an
 * anchor's target file, which need not be one of the documents already
 * normalized on the way in. a CRLF-authored target would otherwise leave a
 * trailing `\r` on every heading — which `.` does not match — so the file would
 * report zero anchors and every link into it would read as broken.
 */
function headingAnchors(source) {
  const anchors = new Set();
  const seen = new Map();
  const text = source.replace(/\r\n/g, "\n");

  for (const { text: line, fence } of scanLines(text)) {
    if (fence) continue;
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (!heading) continue;
    const base = slugify(heading[1].trim());
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

/**
 * every on-disk link target in a document — relative paths and bare `#fragment`
 * references — outside fenced blocks and inline code spans. external schemes
 * are dropped: this validator resolves files, not URLs.
 */
function documentLinks(body) {
  const links = [];

  for (const { line, text, fence } of scanLines(body)) {
    if (fence) continue;
    const prose = text.replace(/`+[^`]+`+/g, "");
    for (const match of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (EXTERNAL_TARGET_RE.test(match[1])) continue;
      links.push({ line, target: match[1] });
    }
  }
  return links;
}

/**
 * every routing bullet in a SKILL.md, with the section heading above it.
 *
 * only the contiguous bullet list immediately following a
 * `See […](./references/…) for:` line is a routing list; a later
 * `**Guidelines:**` block in the same section (as a self-contained workflow
 * skill may carry) is left alone.
 *
 * one walk with one boundary, for the same reason guidelines.mjs owns the
 * `**Guidelines:**` boundary: two readers ask different questions of a routing
 * bullet — "does it open with an RFC-2119 keyword?" (a failure) and "does it
 * name what it points at?" (an advisory) — and a second copy of this boundary
 * would let them disagree about which bullets are routing bullets at all.
 *
 * @yields {{ line: number, section: string, rule: string }} `line` is 1-based
 *   within `body`; `rule` is the bullet's trimmed text.
 */
function* routingBullets(body) {
  let section = "(top)";
  let inRouting = false; // inside the See…for: bullet list (or its lead-in gap)
  let seenBullet = false; // a routing bullet has appeared since the See line

  for (const { line, text, fence } of scanLines(body)) {
    if (fence) continue;

    const heading = text.match(/^#{2,}\s+(.*)$/);
    if (heading) {
      section = heading[1].trim();
      inRouting = false;
      seenBullet = false;
      continue;
    }
    if (/See \[[^\]]+\.md\]\(\.\/references\/[^)]+\) for:/.test(text)) {
      inRouting = true;
      seenBullet = false;
      continue;
    }
    if (!inRouting) continue;

    const bullet = text.match(/^\s*-\s+(.*)$/);
    if (bullet) {
      seenBullet = true;
      yield { line, section, rule: bullet[1].trim() };
      continue;
    }
    // a blank line before the first bullet is the lead-in gap; any other line,
    // or a blank line after the bullets, ends the routing list.
    if (text.trim() === "" && !seenBullet) continue;
    inRouting = false;
  }
}

/** routing-section bullets must stay descriptive — no RFC-2119 keywords. */
function routingKeywordFailures(body) {
  const failures = [];

  for (const { section, rule } of routingBullets(body)) {
    if (!RFC2119_RE.test(rule)) continue;
    failures.push(
      `routing: section "${section}" has a routing bullet starting with an RFC-2119 keyword: "${rule.slice(0, 60)}…"`,
    );
  }
  return failures;
}

/**
 * whether a routing bullet names anything a reader could look up: a code span,
 * a camelCased identifier, an acronym, or a proper noun past the first word.
 *
 * the first word is excluded from the proper-noun test because a leading
 * capital may only be opening the sentence. every other form is positional
 * evidence that a specific thing is being named rather than alluded to.
 */
function namesSomething(rule) {
  if (/`[^`]+`/.test(rule)) return true;
  return rule
    .split(/\s+/)
    .some(
      (word, index) =>
        /[a-z]\w*[A-Z]/.test(word) ||
        /^[A-Z]{2,}/.test(word) ||
        (index > 0 && /^[A-Z][a-z]/.test(word)),
    );
}

/**
 * routing bullets that gesture at a fact instead of stating it.
 *
 * a bullet warns only when all three hold: it opens an abstract noun with a
 * bare `the`, it names nothing anywhere in the bullet, and it is not itself
 * describing the rule. all three conditions push toward silence, which is what
 * the advisory tier is for — the prose rule owns the judgment about whether a
 * particular bullet earns its reference, and a pattern cannot make it.
 *
 * the third condition is not a nicety. `agent-skill-authoring`'s own bullet for
 * this rule reads "the flag, limit, or rule by name", and every hand-run count
 * of this defect has reported it as a violation of the rule it states. a metric
 * that reproduces the error it was built to replace is worse than no metric.
 *
 * a known false positive, stated rather than papered over: a compound noun
 * whose modifier is a gesture noun — "the file system", "the rule set" — reads
 * as a gesture and is not one. it cannot be separated by pattern, because the
 * shape is identical to a real gesture that happens to be compound ("the option
 * sets that differ between them"), and silencing one silences the other. on
 * this corpus that is one hit in ten. an advisory surfaces candidates for a
 * human to weigh, so the miscount is visible where a suppression would not be.
 */
function routingConcretenessWarnings(body, file, offset) {
  const warnings = [];

  for (const { line, section, rule } of routingBullets(body)) {
    if (!ROUTING_GESTURE_RE.test(rule)) continue;
    if (ROUTING_META_RE.test(rule) || namesSomething(rule)) continue;
    warnings.push(
      `routing: ${file}:${line + offset} section "${section}" gestures at a fact without naming it: "${rule.slice(0, 60)}…"`,
    );
  }
  return warnings;
}

/** the reference-wiring findings for one skill directory. */
async function check(dir) {
  const failures = [];
  const warnings = [];

  let raw;
  try {
    raw = await readFile(join(dir, "SKILL.md"), "utf8");
  } catch (error) {
    return { failures: [`SKILL.md is unreadable: ${error.message}`], warnings };
  }

  const { body, offset } = splitFrontmatter(raw);

  const refDir = join(dir, "references");
  if (await isDir(refDir)) {
    const refFiles = (await readdir(refDir)).filter((file) => file.endsWith(".md")).sort();
    for (const file of refFiles) {
      if (!body.includes(`](./references/${file})`)) {
        failures.push(`references: "references/${file}" is not linked from SKILL.md (orphan reference).`);
      }
    }
  }

  failures.push(...routingKeywordFailures(body));
  warnings.push(...routingConcretenessWarnings(body, "SKILL.md", offset));

  // the unreadable-reference failure belongs here rather than in the body
  // command: it is a fact about the reference existing and being readable, and
  // reporting it from both would put one defect behind two commands.
  const { documents, unreadable } = await skillDocuments(dir, body, offset);
  failures.push(...unreadable);

  const skillRoot = resolve(dir);
  const anchorCache = new Map();

  /** a document's anchor set, or null when it cannot be read. */
  const anchorsOf = async (path) => {
    if (!anchorCache.has(path)) {
      try {
        anchorCache.set(path, headingAnchors(await readFile(path, "utf8")));
      } catch {
        anchorCache.set(path, null);
      }
    }
    return anchorCache.get(path);
  };

  for (const { file, path, body: text, offset: at } of documents) {
    for (const { line, target } of documentLinks(text)) {
      const where = `${file}:${line + at}`;
      const hash = target.indexOf("#");
      const targetPath = hash === -1 ? target : target.slice(0, hash);
      const fragment = hash === -1 ? "" : target.slice(hash + 1);

      let resolved = path;
      if (targetPath !== "") {
        resolved = resolve(dirname(path), targetPath);
        if (relative(skillRoot, resolved).startsWith("..")) {
          failures.push(
            `links: ${where} relative link "${target}" resolves outside the skill directory.`,
          );
          continue; // reported once, and nothing outside the skill is read
        }
      }

      if (fragment === "" || !resolved.endsWith(".md")) continue;
      const anchors = await anchorsOf(resolved);
      // a target that does not resolve is check-links.mjs's finding, not this
      // one; reporting it here would put the same defect behind two gates.
      if (anchors === null) continue;
      if (!anchors.has(fragment)) {
        failures.push(
          `anchors: ${where} link "${target}" resolves to no heading in ${skillRelative(skillRoot, resolved)}.`,
        );
      }
    }
  }

  return { failures, warnings };
}

const USAGE = `Usage: check-skill-references.mjs <skill-dir | skill-root> [more paths…]

Check the wiring between a SKILL.md and its references/: a reference file the
parent never links (an orphan), a relative link that escapes the skill
directory, a heading fragment that resolves to no heading, and a routing bullet
that opens with an RFC-2119 keyword. Run it after adding, moving, or renaming a
reference file.

A link whose target file does not resolve is left to check-links.mjs rather than
reported twice.

Exit codes: 0 all skills passed, 1 one or more failed, 2 bad invocation.
Advisory WARN lines never affect the exit code.
${siblingHelp("check-skill-references.mjs")}`;

await runCli({ usage: USAGE, check });
