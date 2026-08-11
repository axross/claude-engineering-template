// urls.mjs — external-URL extraction for the link-freshness audit.
//
// answers "which external URLs does this tree claim, and where is each one
// written?" and nothing else. it performs no network I/O, so every rule here is
// testable offline and deterministically — which is what keeps the audit's
// extraction covered by `npm test` while the probing stays out of it.
//
// what counts as prose is not re-implemented here: it comes from
// commonmark.mjs, the same module check-links.mjs and the skill-structure
// validators read. a skill that documents a URL inside a ```bash sample is
// showing it, not citing it, and probing an illustrative `https://example.com`
// would report a finding nobody can fix. that module also owns the order the
// fenced blocks, code spans, and HTML comments come out in — see
// `extractProse`, and the 90 README lines that order cost when this file and
// check-links.mjs each carried their own copy of it.
//
// why this is a separate concern from check-links.mjs. that script resolves
// relative `.md` links against the file system and deliberately ignores
// `http(s)://` targets — the two checks share no target set at all. it is also a
// merge gate, and gates here stay offline and deterministic; this is a scheduled
// audit that reaches the network. same tree, disjoint questions.

import { readdir, readFile, stat } from "node:fs/promises";

import { extractProse } from "../commonmark.mjs";

/**
 * directory names never worth walking, mirroring check-links.mjs's list for the
 * same reason: a `.md` under one of these is not authored content, and
 * node_modules alone would dominate the walk.
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

/**
 * an `http(s)` URL, ending at the first character that cannot continue one in
 * running Markdown.
 *
 * `)` and `]` are excluded so an inline link's closing delimiter is not swallowed;
 * `<`, `>`, and the quote characters end an autolink or an HTML attribute. the
 * known limit is a URL that legitimately contains a closing paren — a Wikipedia
 * `…_(disambiguation)` target is the classic one — which truncates here. that is
 * accepted rather than solved: the truncated URL is probed, and a truncation
 * surfaces as a finding a human reads rather than as silence.
 */
const URL_RE = /https?:\/\/[^\s)\]"'`<>]+/g;

/**
 * trailing characters that end a sentence rather than the URL. stripped after
 * matching, because `…/api.` and `…/api,` are overwhelmingly prose punctuation
 * and a path segment ending in one of these is vanishingly rare.
 */
const TRAILING_PUNCTUATION_RE = /[.,;:!?]+$/;

/**
 * every external URL a document cites, with the 1-based line carrying it.
 *
 * three kinds of text are blanked first, all of them showing a URL rather than
 * claiming it: fenced code blocks, inline code spans, and HTML comments — in
 * that order, which is `extractProse`'s to enforce and this file's to rely on. a
 * commented-out URL is text the reader never sees, so probing it would report
 * rot in prose nobody reads and nobody renders; this repository's own status
 * blocks and `count:` markers are HTML comments, and a section parked behind one
 * is a normal way to retire content here.
 *
 * @param {string} source raw file content
 * @returns {Array<{ url: string, line: number }>}
 */
export function extractUrls(source) {
  const found = [];

  for (const { line, text } of extractProse(source).lines) {
    for (const match of text.matchAll(URL_RE)) {
      const url = match[0].replace(TRAILING_PUNCTUATION_RE, "");
      if (url.length > 0) found.push({ url, line });
    }
  }
  return found;
}

/**
 * Markdown files under one root. a file argument is taken as-is when it is
 * Markdown, a directory argument is walked. dot-directories are included —
 * `.claude/skills/` is exactly where the installed skill copies live — while
 * PRUNED_DIRS are not.
 *
 * a root that does not exist contributes no files rather than failing: the
 * question is "which URLs live under these roots", and an absent root holds none.
 *
 * @param {string} root
 * @returns {Promise<string[]>}
 */
export async function listMarkdownFiles(root) {
  let stats;
  try {
    stats = await stat(root);
  } catch {
    return [];
  }
  if (stats.isFile()) return root.endsWith(".md") ? [root] : [];
  if (!stats.isDirectory()) return [];

  const found = [];
  const pending = [root.length > 1 ? root.replace(/\/+$/, "") : root];

  while (pending.length > 0) {
    const dir = pending.pop();
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      continue; // an unreadable directory cites nothing
    }
    for (const entry of entries) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!PRUNED_DIRS.has(entry.name)) pending.push(path);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        found.push(path);
      }
    }
  }
  return found.sort();
}

/**
 * collect every external URL under the given roots, deduplicated by URL and
 * carrying every site that cites it.
 *
 * deduplication is what makes the generated `.claude/skills/` copies free: a
 * distributable skill's URL appears in both tiers and is probed once. it is also
 * what makes the RFC-2119 boilerplate — cited by every skill in the tree — one
 * request rather than one per skill.
 *
 * sites are reported for every occurrence, because the finding a human acts on
 * is "this URL is dead, here is each file that cites it".
 *
 * @param {string[]} roots
 * @returns {Promise<{
 *   urls: Array<{ url: string, sites: string[] }>,
 *   fileCount: number,
 *   siteCount: number,
 * }>} `urls` is sorted by URL, and each `sites` list is sorted, so successive
 *   runs over an unchanged tree produce byte-identical output.
 */
export async function collectUrls(roots) {
  const sites = new Map();
  const files = new Set();

  for (const root of roots) {
    for (const file of await listMarkdownFiles(root)) files.add(file);
  }

  for (const file of [...files].sort()) {
    const source = await readFile(file, "utf8");
    for (const { url, line } of extractUrls(source)) {
      if (!sites.has(url)) sites.set(url, []);
      sites.get(url).push(`${file}:${line}`);
    }
  }

  const urls = [...sites.entries()]
    .map(([url, found]) => ({ url, sites: found.sort() }))
    .sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));

  return {
    urls,
    fileCount: files.size,
    siteCount: urls.reduce((sum, entry) => sum + entry.sites.length, 0),
  };
}
