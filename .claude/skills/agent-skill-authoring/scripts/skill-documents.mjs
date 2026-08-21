// shared machinery for the three skill-structure validators beside this file.
//
// deliberately carries no shebang: this is a module, not a command. a tool that
// identifies a CLI by its shebang would otherwise count it as a fourth
// validator.
//
// what lives here is what all three need to agree on — how a path resolves to a
// skill directory, what documents a skill is made of, how two copies of one
// skill collapse into a single verdict, and the report shape and exit contract.
// a rule belongs in the command that owns it, never here.

import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative, sep } from "node:path";


export function fail2(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

export async function isDir(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * expand each argument into skill directories. an argument that holds a
 * SKILL.md is a skill; otherwise its immediate subdirectories holding a
 * SKILL.md are the skills. exits 2 on a path that yields neither.
 */
export async function resolveSkillDirs(paths) {
  const skills = [];
  const seen = new Set();
  const add = (dir) => {
    if (!seen.has(dir)) {
      seen.add(dir);
      skills.push(dir);
    }
  };

  for (const path of paths) {
    if (!(await isDir(path))) fail2(`Not a directory: "${path}".`);
    if (await isFile(join(path, "SKILL.md"))) {
      add(path);
      continue;
    }
    const entries = await readdir(path, { withFileTypes: true });
    let found = 0;
    for (const entry of entries) {
      // `isDirectory()` is false for a symlink pointing at a directory, so testing it
      // here would skip a symlinked skill root and report "All 0 skill(s) passed" — a
      // pass that checked nothing. `isDir` stats through the link instead: symlinking
      // one source into two agents' roots is a real, supported layout.
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const child = join(path, entry.name);
      if (!(await isDir(child))) continue;
      if (await isFile(join(child, "SKILL.md"))) {
        found += 1;
        add(child);
      }
    }
    if (found === 0) {
      fail2(`No SKILL.md in "${path}" or its immediate subdirectories.`);
    }
  }
  return skills;
}

/**
 * split a SKILL.md into its frontmatter fields and body. returns
 * { fields: Record<string,string> | null, body: string, offset: number };
 * fields is null when the leading `---` block is missing or unterminated.
 *
 * `offset` is how many lines the frontmatter consumed, so a finding located at
 * body line N is reported at file line N + offset. without it every SKILL.md
 * finding would cite a line several short of the one a reader opens to.
 */
export function splitFrontmatter(text) {
  const norm = text.replace(/\r\n/g, "\n");
  if (!norm.startsWith("---\n")) return { fields: null, body: norm, offset: 0 };
  const close = norm.indexOf("\n---", 4);
  if (close === -1) return { fields: null, body: norm, offset: 0 };

  const block = norm.slice(4, close + 1);
  const afterClose = norm.indexOf("\n", close + 1);
  const body = afterClose === -1 ? "" : norm.slice(afterClose + 1);
  const offset =
    afterClose === -1 ? 0 : norm.slice(0, afterClose + 1).split("\n").length - 1;

  const fields = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (match) fields[match[1]] = match[2];
  }
  return { fields, body, offset };
}

/** a skill-relative path, always forward-slashed so a message reads the same on any platform. */
export function skillRelative(skillRoot, path) {
  return relative(skillRoot, path).split(sep).join("/");
}

/**
 * the prose documents of a skill: SKILL.md plus every references/*.md, each
 * with the body to scan and the line offset its frontmatter consumed.
 * reference files are scanned whole — only SKILL.md carries frontmatter, and a
 * reference legitimately opening with a `---` thematic break must not have its
 * first section eaten by a frontmatter parse.
 */
export async function skillDocuments(dir, skillBody, skillOffset) {
  const documents = [
    { file: "SKILL.md", path: join(dir, "SKILL.md"), body: skillBody, offset: skillOffset },
  ];
  const unreadable = [];

  const refDir = join(dir, "references");
  if (await isDir(refDir)) {
    const refFiles = (await readdir(refDir)).filter((file) => file.endsWith(".md")).sort();
    for (const file of refFiles) {
      const path = join(refDir, file);
      try {
        documents.push({
          file: `references/${file}`,
          path,
          body: (await readFile(path, "utf8")).replace(/\r\n/g, "\n"),
          offset: 0,
        });
      } catch (error) {
        // listed by readdir but unreadable: report it like an unreadable
        // SKILL.md rather than rejecting and losing the exit-code contract.
        unreadable.push(`references: "references/${file}" is unreadable: ${error.message}`);
      }
    }
  }
  return { documents, unreadable };
}

/**
 * collapse results that describe the same skill twice. two entries merge only
 * when they share a skill name and also produce an identical verdict, so a
 * project that keeps generated copies of its skills (a source tree plus an
 * installed one) reports each skill once instead of once per copy. the path
 * given earliest on the command line is canonical, which is how the caller
 * decides which copy a fix belongs in. differing verdicts never merge — that
 * divergence is exactly what the reader needs to see.
 */
export function collapseDuplicates(results) {
  const collapsed = [];
  const byVerdict = new Map();

  for (const result of results) {
    const key = JSON.stringify([result.name, result.failures, result.warnings]);
    const seen = byVerdict.get(key);
    if (seen) {
      seen.duplicates.push(result.dir);
      continue;
    }
    const entry = { ...result, duplicates: [] };
    byVerdict.set(key, entry);
    collapsed.push(entry);
  }
  return collapsed;
}

/** every validator in this set, for the sibling list each one prints in --help. */
export const VALIDATORS = [
  ["check-skill-frontmatter.mjs", "the discovery contract in frontmatter"],
  ["check-skill-body.mjs", "the document-body rules"],
  ["check-skill-references.mjs", "the wiring between SKILL.md and references/"],
];

/**
 * the trailer every validator's --help ends with. there is no run-all command —
 * each of these answers for one kind of edit — so finding one has to lead to the
 * rest, and this is what does it.
 *
 * @param {string} self file name of the calling validator
 */
export function siblingHelp(self) {
  const others = VALIDATORS.filter(([name]) => name !== self);
  return [
    "",
    "Each validator here answers for one kind of edit. The others:",
    ...others.map(([name, what]) => `  ${name.padEnd(30)} ${what}`),
  ].join("\n");
}

/**
 * the argument handling, per-skill loop, duplicate collapsing, report, and exit
 * contract every validator in this set shares.
 *
 * shared rather than copied because the three are read as one family: a reader
 * who learns the PASS/FAIL shape and the 0/1/2 contract from one has learned it
 * from all, and three copies could drift into three dialects of the same report.
 *
 * @param {{ usage: string, check: (dir: string) => Promise<{failures: string[], warnings: string[]}> }} spec
 */
export async function runCli({ usage, check }) {
  const args = process.argv.slice(2);
  const paths = [];

  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${usage}\n`);
    process.exit(0);
  }

  for (const arg of args) {
    if (!arg.startsWith("--")) {
      paths.push(arg);
    } else {
      fail2(`Unknown option "${arg}".\n${usage}`);
    }
  }
  if (paths.length === 0) fail2(usage);

  // resolution order follows the command line, which decides which of two
  // identical copies is canonical; display is sorted afterwards for stability.
  const skills = await resolveSkillDirs(paths);
  if (skills.length === 0) fail2("No skills found to check.");

  const results = [];
  for (const dir of skills) {
    const { failures, warnings } = await check(dir);
    results.push({ dir, name: basename(dir), failures, warnings });
  }

  const collapsed = collapseDuplicates(results);
  collapsed.sort((a, b) => (a.dir < b.dir ? -1 : a.dir > b.dir ? 1 : 0));
  const duplicateCount = skills.length - collapsed.length;

  const lines = [];
  let failedCount = 0;
  let warnedCount = 0;
  for (const { dir, failures, warnings, duplicates } of collapsed) {
    const also = duplicates.length > 0 ? `  (= ${duplicates.join(", ")})` : "";
    if (failures.length === 0) {
      lines.push(`PASS  ${dir}${also}`);
    } else {
      failedCount += 1;
      lines.push(`FAIL  ${dir}${also}`);
      for (const failure of failures) lines.push(`        - ${failure}`);
    }
    if (warnings.length > 0) {
      warnedCount += 1;
      for (const warning of warnings) lines.push(`WARN    - ${warning}`);
    }
  }

  lines.push("");
  lines.push(
    failedCount === 0
      ? `All ${collapsed.length} skill(s) passed structural checks.`
      : `${failedCount} of ${collapsed.length} skill(s) failed structural checks.`,
  );
  if (duplicateCount > 0) {
    lines.push(
      `${duplicateCount} duplicate path(s) collapsed into an identical result above — fix the reported path, not the copy.`,
    );
  }
  if (warnedCount > 0) {
    lines.push(
      `${warnedCount} skill(s) raised advisory warnings (they do not affect the exit code).`,
    );
  }
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exit(failedCount === 0 ? 0 : 1);
}

