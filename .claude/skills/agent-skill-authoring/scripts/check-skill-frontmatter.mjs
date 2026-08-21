#!/usr/bin/env node
// the discovery contract: the frontmatter block a host reads before it loads a
// skill at all.
//
// run it after editing frontmatter. everything here is decided from the leading
// `---` block alone — nothing below it is read — which is what keeps this the
// cheapest of the three and the one worth reaching for on its own.
//
// the bulk of the file is `readScalar`: whether a `description` YAML would read
// as something other than the text that was typed. that check is here rather
// than beside the length cap because a value that cannot be read has no length
// to measure, and reporting both would name two problems where there is one.

import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

import {
  runCli,
  siblingHelp,
  splitFrontmatter,
} from "./skill-documents.mjs";

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const NAME_MAX = 64;

// the spec states 1024 characters; this measures bytes instead — the
// stricter reading, and the one Codex enforces (its own rejection reports
// "1024 characters", byte-measured). UTF-8 never encodes a character in
// under one byte, so byte-conformant implies character-conformant too.
const DESCRIPTION_MAX_BYTES = 1024;

// a plain (unquoted) YAML scalar is read specially when it carries one of
// the constructs below: it then either fails to parse, or — worse — parses
// to something other than what was written, so the skill loads with a
// description its author never wrote while a regex-based reader sees nothing wrong.

// the set is empirical, derived from a real YAML parser rather than the
// spec's indicator table — the two disagree in both directions. `\` and `~`
// lead a plain scalar legally, so rejecting them would fail correct skills;
// `#` and `-`/`?`/`:` before a space are hazards the table alone would miss.

// silent transformation is why this is a failure rather than a warning:
// `a #b` parses to `a` and `&x text` parses to `text`, no error anywhere, so
// the skill loads carrying a description its author never wrote.

// `:` before whitespace or at end of value — opens a nested mapping.
const YAML_COLON_HAZARD_RE = /:(\s|$)/;

// `#` at the start, or after whitespace — opens a comment and truncates.
const YAML_COMMENT_HAZARD_RE = /(^|\s)#/;

// hazardous in first position whatever follows.
const YAML_LEADING_ALWAYS = new Set(["[", "{", "]", "}", ",", "&", "*", "!", "|", ">", "%", "@", "`", '"', "'", "#"]);

// hazardous as the first character only when a space (or nothing) follows;
// `- x` is a list item, `? x` a complex key, `: x` a value.
const YAML_LEADING_BEFORE_SPACE = new Set(["-", "?", ":"]);

// the escapes YAML defines inside a double-quoted scalar, mapped to what they produce.
// the set is closed: `\d`, `\s`, `\w`, and any other undefined sequence is a parse
// error, not a literal backslash — accepting them would reintroduce this check's
// defect: a value the validator passes and no host can load.

// verified against a real parser rather than transcribed, on the same
// reasoning as the hazard set above.
const YAML_DQUOTE_ESCAPES = new Map([
  ["0", "\0"],
  ["a", "\x07"],
  ["b", "\b"],
  ["t", "\t"],
  ["\t", "\t"],
  ["n", "\n"],
  ["v", "\v"],
  ["f", "\f"],
  ["r", "\r"],
  ["e", "\x1b"],
  [" ", " "],
  ['"', '"'],
  ["/", "/"],
  ["\\", "\\"],
  ["N", "\x85"],
  ["_", "\xa0"],
  ["L", "\u2028"],
  ["P", "\u2029"],
]);

// the numeric forms, each taking a fixed run of hex digits after the marker.
const YAML_DQUOTE_HEX_ESCAPES = new Map([
  ["x", 2],
  ["u", 4],
  ["U", 8],
]);

// capability-framing advisories (warnings only — see the header note).
const DOC_NAME_SUFFIX_RE =
  /-(guidelines|best-practices|principles|conventions|rules|requirements)$/;

const DOC_VOICE_DESC_RE =
  /^(This skill|This document|These guidelines|A collection of|Guidelines for|Rules for|Instructions for|Information about)\b/i;

/**
 * read a frontmatter scalar the way a YAML parser would, without being one.
 * returns `{ value, error }`: `value` is the unwrapped string a parser would
 * produce, or null when `error` is set.
 *
 * three forms are recognized. a double-quoted value unwraps and unescapes; a
 * single-quoted value unwraps and collapses `''` to `'`; anything else is a
 * plain scalar, which is returned as-is unless it carries a construct from the
 * hazard set above.
 *
 * unwrapping has to happen before the byte cap and the framing check run, not
 * after. otherwise quotes and escapes count against the 1024-byte budget an
 * author did not spend, and the document-voice regex matches a leading `"`
 * instead of the first word.
 *
 * this is deliberately not a YAML implementation. it covers the forms a
 * frontmatter scalar is written in, and its job is to refuse anything it
 * cannot read confidently rather than to guess.
 */
function readScalar(raw) {
  // whitespace around a scalar is syntax, not value — a parser strips it on
  // both sides. both matter: with only the trailing side stripped,
  // `description:  "x"` (a second space before the quote) would not be seen
  // as quoted, and would read as plain text starting with a quote character.
  const text = raw.trim();
  if (text === "") return { value: "", error: null };

  const quote = text[0];
  if (quote === '"' || quote === "'") {
    if (text.length < 2 || text[text.length - 1] !== quote) {
      return {
        value: null,
        error: `opens with ${quote === '"' ? "a double" : "a single"} quote but does not close — a quoted value must end with the same quote.`,
      };
    }
    const inner = text.slice(1, -1);

    if (quote === "'") {
      // inside single quotes only `''` is special. an odd-length run of quotes
      // means one of them terminates the scalar early.
      for (const run of inner.match(/'+/g) ?? []) {
        if (run.length % 2 !== 0) {
          return {
            value: null,
            error: "carries an unpaired `'` inside a single-quoted value — double it to `''` to mean a literal quote.",
          };
        }
      }
      return { value: inner.replace(/''/g, "'"), error: null };
    }

    // inside double quotes a `"` must be backslash-escaped. walk the string so
    // an escaped backslash before a quote (`\\"`) is read as terminating.
    let out = "";
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (ch !== "\\") {
        if (ch === '"') {
          return {
            value: null,
            error: 'carries an unescaped `"` inside a double-quoted value — write it as `\\"`.',
          };
        }
        out += ch;
        continue;
      }
      const next = inner[i + 1];
      if (next === undefined) {
        return { value: null, error: "ends with a dangling `\\` inside a double-quoted value." };
      }
      const hexDigits = YAML_DQUOTE_HEX_ESCAPES.get(next);
      if (hexDigits !== undefined) {
        const digits = inner.slice(i + 2, i + 2 + hexDigits);
        if (digits.length < hexDigits || !/^[0-9a-fA-F]+$/.test(digits)) {
          return {
            value: null,
            error: `carries \`\\${next}\` with fewer than ${hexDigits} hex digits after it inside a double-quoted value.`,
          };
        }
        out += String.fromCodePoint(Number.parseInt(digits, 16));
        i += 1 + hexDigits;
        continue;
      }
      if (!YAML_DQUOTE_ESCAPES.has(next)) {
        return {
          value: null,
          error: `carries \`\\${next}\`, which YAML does not define as an escape inside a double-quoted value — use single quotes, or double the backslash.`,
        };
      }
      out += YAML_DQUOTE_ESCAPES.get(next);
      i++;
    }
    return { value: out, error: null };
  }

  const lead = text[0];
  if (YAML_LEADING_ALWAYS.has(lead)) {
    return {
      value: null,
      error: `begins with \`${lead}\`, which YAML reads as an indicator rather than text — quote the value.`,
    };
  }
  if (YAML_LEADING_BEFORE_SPACE.has(lead) && (text.length === 1 || /\s/.test(text[1]))) {
    return {
      value: null,
      error: `begins with \`${lead}\` followed by a space, which YAML reads as an indicator rather than text — quote the value.`,
    };
  }
  if (YAML_COLON_HAZARD_RE.test(text)) {
    return {
      value: null,
      error: "contains `: ` (a colon before a space or at the end), which YAML reads as opening a nested mapping — quote the value.",
    };
  }
  if (YAML_COMMENT_HAZARD_RE.test(text)) {
    return {
      value: null,
      error: "contains ` #`, which YAML reads as starting a comment and silently truncates the value — quote it.",
    };
  }
  return { value: text, error: null };
}

/** the frontmatter findings for one skill directory. */
async function check(dir) {
  const failures = [];
  const warnings = [];
  const dirName = basename(dir);

  let raw;
  try {
    raw = await readFile(join(dir, "SKILL.md"), "utf8");
  } catch (error) {
    return { failures: [`SKILL.md is unreadable: ${error.message}`], warnings };
  }

  const { fields } = splitFrontmatter(raw);
  if (!fields) {
    failures.push("frontmatter: missing or unterminated leading \`---\` block.");
    return { failures, warnings };
  }

  const name = fields.name;
  if (!name) {
    failures.push("frontmatter: \`name\` is missing.");
  } else {
    if (!NAME_RE.test(name)) {
      failures.push(`frontmatter: \`name\` "${name}" is not kebab-case (^[a-z0-9]+(-[a-z0-9]+)*$).`);
    }
    if (name.length > NAME_MAX) {
      failures.push(`frontmatter: \`name\` is ${name.length} chars (max ${NAME_MAX}).`);
    }
    if (name !== dirName) {
      failures.push(`frontmatter: \`name\` "${name}" does not match directory "${dirName}".`);
    }
    const suffix = name.match(DOC_NAME_SUFFIX_RE);
    if (suffix) {
      warnings.push(
        `framing: \`name\` ends in "${suffix[0]}" — names the document, not the capability; consider the activity beneath it.`,
      );
    }
  }

  const rawDescription = fields.description;
  const scalar = rawDescription === undefined ? { value: null, error: null } : readScalar(rawDescription);
  const description = scalar.value;
  if (scalar.error) {
    // reported instead of the length and framing checks, not alongside them:
    // until the value can be read, its length and opening words are unknown.
    failures.push(`frontmatter: \`description\` ${scalar.error}`);
  } else if (!description) {
    failures.push("frontmatter: \`description\` is missing or empty.");
  } else {
    const descriptionBytes = Buffer.byteLength(description, "utf8");
    if (descriptionBytes > DESCRIPTION_MAX_BYTES) {
      const width =
        descriptionBytes === description.length
          ? `${descriptionBytes} bytes`
          : `${descriptionBytes} bytes (${description.length} chars)`;
      failures.push(
        `frontmatter: \`description\` is ${width} (max ${DESCRIPTION_MAX_BYTES} bytes) — a host that measures the cap in bytes refuses to load the skill.`,
      );
    }
    const opening = description.match(DOC_VOICE_DESC_RE);
    if (opening) {
      warnings.push(
        `framing: \`description\` opens in document voice ("${opening[0]}…") — name the ability the skill gives the agent.`,
      );
    }
  }

  return { failures, warnings };
}

const USAGE = `Usage: check-skill-frontmatter.mjs <skill-dir | skill-root> [more paths…]

Check the discovery contract: that \`name\` and \`description\` are present and
well-formed, that \`name\` is kebab-case, within 64 characters, and matches its
directory, and that \`description\` reads back as the text that was typed and
stays within its byte cap. Run it after editing frontmatter.

A <path> is either a skill directory (one holding SKILL.md) or a directory whose
immediate subdirectories are skills. A symlinked entry is followed.

Exit codes: 0 all skills passed, 1 one or more failed, 2 bad invocation.
Advisory WARN lines never affect the exit code.
${siblingHelp("check-skill-frontmatter.mjs")}`;

await runCli({ usage: USAGE, check });
