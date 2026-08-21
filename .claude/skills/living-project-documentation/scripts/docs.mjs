// shared docs reading for the specification validators beside this file.
//
// deliberately carries no shebang: this is a module, not a command. a tool that
// identifies a CLI by its shebang would otherwise count it as a sixth validator.
//
// everything here is standard-library Node. the validators ship inside a skill
// that installs into arbitrary projects, so they take no dependencies and assume
// no build step.

import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

/** the conventional docs directory, used when a caller names none. */
export const DEFAULT_DOCS_DIR = "docs";

/** every validator in this set, for the sibling list each one prints in --help. */
export const VALIDATORS = [
  ["check-index.mjs", "every document is listed in the index"],
  ["check-references.mjs", "every relative link resolves"],
  ["check-glossary.mjs", "every spec has a vocabulary entry"],
  ["check-decision-naming.mjs", "every decision filename sorts and stays stable"],
  ["check-decision-supersede.mjs", "the supersede chain is sound and nothing cites stale rationale"],
];

/**
 * print the shared trailer every validator's --help ends with, so finding one
 * command leads to the rest without a run-all script existing to bundle them.
 *
 * @param {string} self file name of the calling validator
 */
export function siblingHelp(self) {
  const others = VALIDATORS.filter(([name]) => name !== self);
  return [
    "",
    "Each validator here answers one question about one kind of change.",
    "The others:",
    ...others.map(([name, what]) => `  ${name.padEnd(30)} ${what}`),
  ].join("\n");
}

/**
 * resolve the single optional positional argument shared by every validator.
 *
 * @param {string[]} argv raw arguments, excluding node and the script path
 * @param {string} usage full --help text
 * @returns {{ dir: string } | { exit: number, message: string }}
 */
export function parseArgs(argv, usage) {
  if (argv.includes("--help") || argv.includes("-h")) {
    return { exit: 0, message: usage };
  }
  const flags = argv.filter((arg) => arg.startsWith("-"));
  if (flags.length > 0) {
    return { exit: 2, message: `Unknown option: ${flags[0]}\n\n${usage}` };
  }
  if (argv.length > 1) {
    return { exit: 2, message: `Expected at most one directory.\n\n${usage}` };
  }
  return { dir: argv[0] ?? DEFAULT_DOCS_DIR };
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * strip fenced code blocks and inline code spans, replacing each removed line
 * with an empty one so every surviving line keeps its original number. a link
 * or heading inside a fence is an example, not a reference.
 *
 * @param {string} text
 * @returns {string[]} one entry per source line
 */
function scannableLines(text) {
  const lines = text.split("\n");
  const out = [];
  let fence = null;

  for (const line of lines) {
    const opener = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      out.push("");
      if (opener && opener[1][0] === fence[0] && opener[1].length >= fence.length) {
        fence = null;
      }
      continue;
    }
    if (opener) {
      fence = opener[1];
      out.push("");
      continue;
    }
    out.push(line.replace(/`[^`]*`/g, ""));
  }
  return out;
}

const LINK_RE = /\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * every relative Markdown link in a document, with the fragment stripped and
 * the source line recorded. external schemes are skipped: whether a published
 * URL still resolves is a different question, answered by a different tool.
 *
 * @param {string} text
 * @returns {{ target: string, line: number }[]}
 */
export function extractLinks(text) {
  const found = [];
  scannableLines(text).forEach((line, index) => {
    for (const match of line.matchAll(LINK_RE)) {
      const raw = match[1];
      if (EXTERNAL_RE.test(raw)) continue;
      const target = raw.split("#")[0];
      if (target === "") continue; // A bare fragment addresses this file.
      found.push({ target, line: index + 1 });
    }
  });
  return found;
}

/**
 * every ATX heading at one level.
 *
 * @param {string} text
 * @param {number} level
 * @returns {{ text: string, line: number }[]}
 */
export function extractHeadings(text, level) {
  const pattern = new RegExp(`^#{${level}}\\s+(.+?)\\s*#*\\s*$`);
  const found = [];
  scannableLines(text).forEach((line, index) => {
    const match = line.match(pattern);
    if (match) found.push({ text: match[1].trim(), line: index + 1 });
  });
  return found;
}

/**
 * lowercase a heading or file stem to the shared comparison form, so a
 * `## Job Templates` heading and a `job-templates.md` file are recognised as
 * naming the same domain.
 *
 * @param {string} value
 * @returns {string}
 */
export function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * parse a leading YAML frontmatter block into flat string values. only the flat
 * `key: value` shape is supported, which is all a decision record uses; a
 * document with no frontmatter yields an empty object.
 *
 * @param {string} text
 * @returns {{ data: Record<string, string>, present: boolean }}
 */
export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return { data: {}, present: false };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { data: {}, present: false };

  const data = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    value = value.replace(/\s+#.*$/, "").trim();
    value = value.replace(/^["'](.*)["']$/, "$1");
    data[match[1]] = value;
  }
  return { data, present: true };
}

async function collectMarkdown(dir, root, out) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectMarkdown(full, root, out);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

/**
 * read the docs tree, or report that the project has none.
 *
 * `index.md` is the single adoption marker. its absence means the project has
 * not opted in — an unrelated `docs/` directory must never turn red just
 * because these validators are installed — so every caller treats a null return
 * as "nothing to check" and exits 0.
 *
 * @param {string} dir
 * @returns {Promise<null | {
 *   root: string,
 *   documents: { path: string, relative: string, text: string }[],
 *   hasSpecs: boolean,
 *   hasDecisions: boolean,
 * }>}
 */
export async function loadDocs(dir) {
  const root = resolve(dir);
  if (!(await isDirectory(root))) return null;
  if (!(await isFile(join(root, "index.md")))) return null;

  const paths = (await collectMarkdown(root, root, [])).sort();
  const documents = await Promise.all(
    paths.map(async (path) => ({
      path,
      relative: relative(root, path).split(sep).join("/"),
      text: await readFile(path, "utf8"),
    })),
  );

  return {
    root,
    documents,
    hasSpecs: await isDirectory(join(root, "specs")),
    hasDecisions: await isDirectory(join(root, "decisions")),
  };
}

/**
 * every decision record under docs/, sorted by filename — which, given the
 * naming rule, is chronological.
 *
 * @param {{ documents: { relative: string }[] }} docs
 */
export function decisionRecords(docs) {
  return docs.documents.filter((doc) => doc.relative.startsWith("decisions/"));
}

/** every document that is not a decision record. */
export function nonDecisionDocuments(docs) {
  return docs.documents.filter((doc) => !doc.relative.startsWith("decisions/"));
}

/**
 * resolve a link target against the document that contains it.
 *
 * @param {string} documentPath absolute path of the linking document
 * @param {string} target relative link target
 * @returns {string} absolute path the link addresses
 */
export function resolveLink(documentPath, target) {
  return resolve(dirname(documentPath), target);
}

/**
 * print findings in the shared house format and return the process exit code.
 *
 * @param {string} subject what was checked, for the PASS/FAIL line
 * @param {{ category: string, message: string }[]} findings
 * @param {string} passSummary printed under a clean run
 * @returns {number}
 */
export function report(subject, findings, passSummary) {
  if (findings.length === 0) {
    console.log(`PASS  ${subject}\n`);
    console.log(passSummary);
    return 0;
  }
  console.log(`FAIL  ${subject}`);
  for (const { category, message } of findings) {
    console.log(`        - ${category}: ${message}`);
  }
  console.log(
    `\n${subject} has ${findings.length} finding${findings.length === 1 ? "" : "s"}.`,
  );
  return 1;
}

/**
 * run a validator's body with the shared argument handling, no-docs exit, and
 * error reporting, so each command file states only what it checks.
 *
 * @param {{
 *   usage: string,
 *   argv: string[],
 *   needs?: "specs" | "decisions",
 *   absent: string,
 *   run: (docs: object) => { category: string, message: string }[] | Promise<{ category: string, message: string }[]>,
 *   pass: (docs: object) => string,
 * }} spec
 */
export async function main({ usage, argv, needs, absent, run, pass }) {
  const parsed = parseArgs(argv, usage);
  if ("exit" in parsed) {
    (parsed.exit === 0 ? console.log : console.error)(parsed.message);
    return parsed.exit;
  }

  let docs;
  try {
    docs = await loadDocs(parsed.dir);
  } catch (error) {
    console.error(`Could not read ${parsed.dir}: ${error.message}`);
    return 2;
  }

  if (docs === null) {
    console.log(`No docs at ${parsed.dir} (no index.md). Nothing to check.`);
    return 0;
  }
  if (needs === "specs" && !docs.hasSpecs) {
    console.log(`No specs/ under ${parsed.dir}. ${absent}`);
    return 0;
  }
  if (needs === "decisions" && !docs.hasDecisions) {
    console.log(`No decisions/ under ${parsed.dir}. ${absent}`);
    return 0;
  }

  return report(parsed.dir, await run(docs), pass(docs));
}

/** the file name of the running script, for its sibling list. */
export function selfName(url) {
  return basename(new URL(url).pathname);
}
