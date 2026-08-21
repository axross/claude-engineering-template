#!/usr/bin/env node
// check-links.mjs — relative-link integrity check for a skill tree's Markdown links.
//
// walks every Markdown file under the given roots — including dot-directories
// such as `.claude/`, which a `glob('**/*.md')` sweep silently skips unless it
// is asked for them — and reports relative links whose target file does not
// exist.
//
// ships with the agent-skill-authoring skill (see
// ../references/cross-referencing.md) so link verification survives template
// adaptation and stays runnable in any project that keeps the skill. it is
// dependency-light (Node standard library only), and reads what counts as prose
// from commonmark.mjs beside it — the same module check-skill-body.mjs reads, so the
// two can never disagree about what is example text.
//
// usage:
//   node check-links.mjs           # check the whole tree
//   node check-links.mjs PATH ...  # check specific roots
//   node check-links.mjs --help
//
// only links to `.md` targets are checked; `http(s)://`, `mailto:`, and pure
// `#anchor` links are ignored. illustrative example links inside fenced code
// blocks, inline code spans, and HTML comments are skipped so the
// skill-authoring docs can show `[file.md](./references/file.md)` without
// tripping the check. which text that leaves — and the order the three are
// removed in, which decides whether a merely quoted comment opener gets
// believed — is commonmark.mjs's `extractProse`, not this file's own.
//
// a path argument that does not exist is skipped rather than reported: the
// check answers "do the links under these roots resolve", and a root that is
// not there contributes no links.
//
// exit codes:
//   0  all relative links resolve
//   1  one or more broken links
//   2  bad invocation

import { readFile, readdir, realpath, stat } from "node:fs/promises";

import { extractProse } from "./commonmark.mjs";

const USAGE = `Usage: check-links.mjs [<path> ...]

Check that every relative Markdown link under <path> resolves on disk.
With no <path>, the whole tree below the working directory is checked.

Exit codes: 0 all links resolve, 1 broken links found, 2 bad invocation.`;

/**
 * directory names never worth walking: version control, dependency trees, and
 * build output. a generated `.md` under one of these is not authored content,
 * and node_modules alone would dominate the run.
 */
const PRUNED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".venv",
]);

/** an absolute URI (http:, https:, mailto:, …), which resolves to no file. */
const EXTERNAL_TARGET_RE = /^(https?:\/\/|mailto:)/;

/**
 * a Markdown inline link whose target names a `.md` file, optionally with an
 * `#anchor`. `[^)]*` cannot cross the closing paren, so the match ends at the
 * first `)` following the `.md`.
 */
const MD_LINK_RE = /\]\([^)]*\.md(#[^)]*)?\)/;

function fail2(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

/**
 * split `target#fragment` at the fragment: the target is the prefix up to the
 * first `.md` that is followed by `#` or ends the parenthesised text. scanning
 * for the first qualifying `.md` rather than the last is what keeps a path like
 * `./a.md.backup.md` resolving against the name it actually links.
 *
 * @param {string} inside the text between `](` and `)`
 * @returns {string}
 */
function linkTarget(inside) {
  let position = inside.indexOf(".md");

  while (position !== -1) {
    const after = inside.slice(position + 3);
    if (after === "" || after.startsWith("#")) return inside.slice(0, position + 3);
    const nextOffset = after.indexOf(".md");
    if (nextOffset === -1) break;
    position = position + 3 + nextOffset;
  }
  return inside;
}

/**
 * every candidate `.md` link target in a document, plus whether a fence was
 * left open at end of file.
 *
 * fenced code blocks, inline code spans, and HTML comments are blanked first —
 * all three carry illustrative links a reader is meant to see and a checker is
 * not meant to resolve. `extractProse` owns that pass and its ordering, and
 * returns the fence state from the same walk, so the warning below always
 * describes the scan the targets actually came from.
 *
 * @param {string} source raw file content
 * @returns {{ targets: string[], unterminatedFenceAt: number | null }}
 */
function extractLinkTargets(source) {
  const { lines, unterminatedFenceAt } = extractProse(source);
  const targets = [];

  for (const { text } of lines) {
    let line = text;
    for (;;) {
      const match = line.match(MD_LINK_RE);
      if (!match) break;
      line = line.slice(match.index + match[0].length);

      const target = linkTarget(match[0].slice(2, -1));
      if (!EXTERNAL_TARGET_RE.test(target)) targets.push(target);
    }
  }
  return { targets, unterminatedFenceAt };
}

/**
 * Markdown files under one root: a file argument is taken as-is when it is
 * Markdown, a directory argument is walked. dot-directories are included —
 * `.claude/` is exactly where a skill tree lives — while PRUNED_DIRS are not.
 *
 * @param {string} root
 * @returns {Promise<string[]>}
 */
async function listMarkdownFiles(root) {
  let stats;
  try {
    stats = await stat(root);
  } catch {
    return []; // a root that is not there contributes no links
  }
  if (stats.isFile()) return root.endsWith(".md") ? [root] : [];
  if (!stats.isDirectory()) return [];

  const found = [];
  const pending = [root.length > 1 ? root.replace(/\/+$/, "") : root];
  // real paths already descended into, to catch a cycle. `withFileTypes` reports a
  // symlinked directory as neither a file nor a directory, so a symlinked skill source
  // would look empty of Markdown unless the link is followed — but following risks a
  // cycle, since a link pointing at an ancestor walks forever.
  const descended = new Set();

  while (pending.length > 0) {
    const dir = pending.pop();
    try {
      const real = await realpath(dir);
      if (descended.has(real)) continue;
      descended.add(real);
    } catch {
      continue; // a broken link resolves to nothing: nothing to walk
    }
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      continue; // unreadable directory: nothing to check inside it
    }
    for (const entry of entries) {
      const path = `${dir}/${entry.name}`;
      let isDirectory = entry.isDirectory();
      let isFile = entry.isFile();
      if (entry.isSymbolicLink()) {
        try {
          const target = await stat(path);
          isDirectory = target.isDirectory();
          isFile = target.isFile();
        } catch {
          continue; // a broken link points at nothing to check
        }
      }
      if (isDirectory) {
        if (!PRUNED_DIRS.has(entry.name)) pending.push(path);
      } else if (isFile && entry.name.endsWith(".md")) {
        found.push(path);
      }
    }
  }
  return found;
}

/** byte-wise sorted, deduplicated Markdown files under every root. */
async function collectMarkdownFiles(roots) {
  const files = new Set();
  for (const root of roots) {
    for (const file of await listMarkdownFiles(root)) files.add(file);
  }
  return [...files].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
}

/** file content, or null when it cannot be read. */
async function readFileText(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

/** true when `path` names something that exists (a dangling symlink does not). */
async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${USAGE}\n`);
    process.exit(0);
  }
  for (const arg of args) {
    if (arg.startsWith("--")) fail2(`Unknown option "${arg}".\n${USAGE}`);
  }

  const files = await collectMarkdownFiles(args.length > 0 ? args : ["."]);
  const broken = [];
  let linksChecked = 0;

  for (const file of files) {
    const source = await readFileText(file);
    if (source === null) continue;

    const { targets, unterminatedFenceAt } = extractLinkTargets(source);
    const base = file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : ".";

    for (const target of targets) {
      linksChecked += 1;
      const resolved = target.startsWith("/") ? target : `${base}/${target}`;
      if (!(await exists(resolved))) broken.push(`  ${file} -> ${target}`);
    }

    if (unterminatedFenceAt !== null) {
      process.stderr.write(
        `warning: unterminated fence in ${file} (opened at line ${unterminatedFenceAt}); the rest of the file was not checked\n`,
      );
    }
  }

  if (broken.length > 0) {
    process.stdout.write(
      `BROKEN LINKS (${broken.length}) across ${files.length} files:\n${broken.join("\n")}\n`,
    );
    process.exit(1);
  }
  process.stdout.write(
    `links OK (${linksChecked} links across ${files.length} Markdown files checked)\n`,
  );
}

main();
