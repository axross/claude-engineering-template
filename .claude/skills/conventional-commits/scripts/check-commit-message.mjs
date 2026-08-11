#!/usr/bin/env node
// check-commit-message.mjs — Conventional Commits header validator.
//
// unless a project installs a commit hook or a CI check that rejects a
// malformed commit message, the format is self-enforced (see
// ../SKILL.md). this validator makes
// that catch mechanical: it checks a message's header against the project's
// Conventional Commits rules and reports every violation. the same header
// format governs pull request titles, so it validates those too — pass the
// title as a one-line message.
//
// it is dependency-light (Node standard library only) so it runs anywhere the
// skill is installed. it validates the parts a header check can decide
// mechanically — type, scope, breaking marker, separator, description — and the
// header/body blank-line separation; it does not judge whether the description
// accurately summarizes the diff.
//
// usage:
//   node check-commit-message.mjs <file>   # read the message from a file
//   node check-commit-message.mjs -        # read the message from stdin
//   <producer> | node check-commit-message.mjs   # read stdin when no arg
//
// exit codes:
//   0  the header conforms (warnings may still be printed)
//   1  one or more MUST violations (each is listed)
//   2  bad invocation — no message could be read

import { readFile } from "node:fs/promises";

// the required type and the additional types allowed for non-release changes,
// per SKILL.md › Type.
const ALLOWED_TYPES = new Set([
  "feat",
  "fix",
  "build",
  "chore",
  "ci",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "revert",
]);

// `<type>[optional scope][!]: <description>` — a required `: ` separator with a
// single space. scope, when present, must be non-empty parentheses.
const HEADER_RE = /^([A-Za-z]+)(\(([^)]*)\))?(!)?: (.*)$/;
const HEADER_SOFT_MAX = 72; // SHOULD stay under this; a warning, not a failure.

function fail2(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

const USAGE = `Usage: check-commit-message.mjs [<file> | -]

Validate a Conventional Commits header. The same format governs pull request
titles, so pass a title as a one-line message. With no argument, or with "-",
the message is read from stdin.

Exit codes: 0 the header conforms, 1 MUST violations found, 2 bad invocation.`;

/**
 * read the commit message from the first CLI argument (a file path, or `-` for
 * stdin) or, when no argument is given, from stdin. exits 2 when nothing can be
 * read, so an empty invocation is a bad invocation rather than a silent pass.
 */
async function readMessage() {
  const arg = process.argv[2];
  if (arg === "--help" || arg === "-h") {
    process.stdout.write(`${USAGE}\n`);
    process.exit(0);
  }
  if (arg && arg !== "-") {
    try {
      return await readFile(arg, "utf8");
    } catch (error) {
      fail2(`Cannot read message file "${arg}": ${error.message}`);
    }
  }

  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (text.trim() === "") {
    fail2("No commit message supplied (pass a file path, or pipe one on stdin).");
  }
  return text;
}

/**
 * strip the parts git itself discards before committing: a leading byte-order
 * mark and every line starting with the default comment char `#`. what remains
 * is the author's real message.
 */
function stripGitNoise(text) {
  const withoutBom = text.replace(/^﻿/, "");
  return withoutBom
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n");
}

/**
 * validate one commit message. returns { failures, warnings } — failures are
 * MUST violations that fail the run; warnings are SHOULD deviations that print
 * but do not change the exit code.
 */
function checkMessage(text) {
  const failures = [];
  const warnings = [];

  const lines = stripGitNoise(text).replace(/\n+$/, "").split("\n");
  const header = lines[0] ?? "";

  if (header.trim() === "") {
    failures.push("the header (first line) is empty.");
    return { failures, warnings };
  }

  const match = header.match(HEADER_RE);
  if (!match) {
    failures.push(
      `header does not match "<type>[optional scope][!]: <description>" (needs a type, a colon, and a single space): "${header}"`,
    );
    return { failures, warnings };
  }

  const [, type, , scope, , description] = match;

  const lowerType = type.toLowerCase();
  if (!ALLOWED_TYPES.has(lowerType)) {
    failures.push(
      `type "${type}" is not one of: ${[...ALLOWED_TYPES].join(", ")}.`,
    );
  } else if (type !== lowerType) {
    warnings.push(`type "${type}" should be lowercase ("${lowerType}").`);
  }

  // a scope was written but is empty: `type(): ...`.
  if (scope !== undefined && scope.trim() === "") {
    failures.push("scope parentheses are empty — omit them or name a scope.");
  }

  if (description.trim() === "") {
    failures.push("description after the colon is empty.");
  } else if (description.endsWith(".")) {
    failures.push('description must not end with a period (".").');
  }

  if (header.length > HEADER_SOFT_MAX) {
    warnings.push(
      `header is ${header.length} chars; keep it under ~${HEADER_SOFT_MAX} for readable "git log --oneline".`,
    );
  }

  // the line after the header must be blank when a body or footer follows.
  if (lines.length > 1 && lines[1].trim() !== "") {
    failures.push("the line after the header must be blank (header/body separation).");
  }

  // BREAKING CHANGE token must be uppercase; catch a mis-cased footer that would
  // otherwise be parsed as ordinary body text and lose its release-bump meaning.
  for (const line of lines.slice(1)) {
    const m = line.match(/^(breaking[ -]change)(?=:| #)/i);
    if (m && m[1] !== "BREAKING CHANGE" && m[1] !== "BREAKING-CHANGE") {
      failures.push(
        `breaking-change footer token "${m[1]}" must be uppercase ("BREAKING CHANGE" or "BREAKING-CHANGE").`,
      );
    }
  }

  return { failures, warnings };
}

async function main() {
  const raw = await readMessage();
  const { failures, warnings } = checkMessage(raw);

  for (const warning of warnings) {
    process.stderr.write(`warning: ${warning}\n`);
  }

  if (failures.length === 0) {
    process.stdout.write("Commit message header conforms to Conventional Commits.\n");
    process.exit(0);
  }

  process.stderr.write("Commit message header has violations:\n");
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`);
  process.exit(1);
}

main();
