#!/usr/bin/env node
// check-installed-copies.mjs — installed-skill drift check for a two-tier
// skill tree.
//
// a distributable skill is authored under a source root (`skills/<name>/`) and
// installed into a skill root (`.claude/skills/<name>/`) with the
// vercel-labs/skills CLI. the installed copies are tracked artifacts rather than
// build output, and a hand-edit to one is silently discarded by the next
// install. nothing checks that on its own, so the two roots match by luck. this
// makes the mismatch fail.
//
// it ships with the agent-skill-management skill (see ../SKILL.md) because the
// invariant it enforces is exactly the one that skill teaches: any project
// running the two-tier model has both roots, and therefore has this drift
// problem. a project that only ever installs somebody else's skills has one
// root and no use for this check — which is the same thing as saying it is not
// running the model.
//
// `skills-lock.json` is deliberately left unconsulted. it is written only by an
// install, so it records what the last install did rather than what is on
// disk now, and cannot witness a later hand-edit to an installed copy —
// precisely the drift this check exists to catch. its `source` field also
// names where a skill came from, not where its installed copy lives, so it
// identifies neither of the two roots being compared. directory contents are
// the truth.
//
// usage:
//   node check-installed-copies.mjs [--local <name>]... <source-root> <installed-root>
//
//     both roots are required arguments. there is no default: a directory layout is a
//     project's own choice, and a wrong guess reports "0 skills, no drift" —
//     a pass that means nothing and looks exactly like a real one.
//
//     `--local <name>` marks one installed skill as repository-local: committed
//     directly under the skill root and hand-edited in place, so it has no
//     source. repeatable. without it, every sourceless installed skill is drift.
//
// exit codes:
//   0  every distributable skill's installed copy matches its source
//   1  drift — a content mismatch, a missing installed copy, or an installed
//      skill with neither a source nor repository-local status
//   2  bad invocation, or a root that is not a directory

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * skills committed directly under the skill root and hand-edited in place, so
 * they legitimately have no source. kept explicit rather than inferred from
 * "installed with no source": inferring it would let a deleted source pass
 * silently as repository-local, which is the failure this set exists to make
 * loud.
 *
 * empty by default, so the decision is always the caller's: name each one with
 * `--local`, or hard-code them here in a project's own copy.
 */
const REPOSITORY_LOCAL = new Set([]);

function fail2(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

async function isDir(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * immediate subdirectory names of `root`, sorted.
 *
 * a symlinked entry counts. `withFileTypes` reports one as a symlink rather
 * than a directory, so filtering on `isDirectory()` alone would see nothing in
 * a root whose skills are symlinks into another agent's root — and an empty
 * root is reported as "no drift", which reads exactly like a pass. that is the
 * same silent-pass hazard the usage note gives as the reason both roots are
 * required rather than guessed.
 */
async function skillNames(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    if (entry.isSymbolicLink() && !(await isDir(join(root, entry.name)))) {
      continue; // a broken link, or one pointing at a file
    }
    names.push(entry.name);
  }
  return names.sort();
}

/**
 * every file under `dir`, as paths relative to it, sorted.
 * @param {string} dir
 * @param {string} [prefix]
 * @returns {Promise<string[]>}
 */
async function listFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(join(dir, entry.name), relative)));
    } else {
      files.push(relative);
    }
  }
  return files;
}

/**
 * compare one skill's source directory against its installed copy.
 * @returns {Promise<string[]>} one message per difference; empty when identical
 */
async function compareSkill(sourceDir, installedDir) {
  const [sourceFiles, installedFiles] = await Promise.all([
    listFiles(sourceDir),
    listFiles(installedDir),
  ]);
  const differences = [];

  const installedSet = new Set(installedFiles);
  const sourceSet = new Set(sourceFiles);
  for (const file of sourceFiles) {
    if (!installedSet.has(file)) differences.push(`missing from the installed copy: ${file}`);
  }
  for (const file of installedFiles) {
    if (!sourceSet.has(file)) differences.push(`present only in the installed copy: ${file}`);
  }

  for (const file of sourceFiles) {
    if (!installedSet.has(file)) continue;
    const [source, installed] = await Promise.all([
      readFile(join(sourceDir, file)),
      readFile(join(installedDir, file)),
    ]);
    if (!source.equals(installed)) differences.push(`content differs: ${file}`);
  }
  return differences;
}

const USAGE = `Usage: check-installed-copies.mjs [--local <name>]... <source-root> <installed-root>

Fail when a distributable skill's source differs from its generated installed
copy. Both roots are required — a typical invocation names "skills" and
".claude/skills" — because a guessed layout that matches nothing reports no
drift, which is indistinguishable from a real pass.

  --local <name>  Treat an installed skill with no source as repository-local
                  rather than drift. Repeatable. Without it, every sourceless
                  installed skill is drift.

Exit codes: 0 every installed copy matches, 1 drift found, 2 bad invocation.`;

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${USAGE}\n`);
    process.exit(0);
  }

  const repositoryLocal = new Set(REPOSITORY_LOCAL);
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--local") {
      positional.push(args[index]);
      continue;
    }
    const name = args[index + 1];
    if (name === undefined) fail2("--local requires a skill name.");
    repositoryLocal.add(name);
    index += 1;
  }

  if (positional.length !== 2) {
    fail2(
      `Both a source root and an installed root are required (got ${positional.length}).\n${USAGE}`,
    );
  }
  const [sourceRoot, installedRoot] = positional;

  for (const root of [sourceRoot, installedRoot]) {
    if (!(await isDir(root))) fail2(`Not a directory: "${root}".`);
  }

  const sourceNames = await skillNames(sourceRoot);
  const installedNames = await skillNames(installedRoot);
  const installedSet = new Set(installedNames);
  const sourceSet = new Set(sourceNames);

  const lines = [];
  let driftedCount = 0;

  for (const name of sourceNames) {
    if (!installedSet.has(name)) {
      driftedCount += 1;
      lines.push(`DRIFT ${name}`);
      lines.push(
        `        - no installed copy under "${installedRoot}" — reinstall so the tracked copy exists`,
      );
      continue;
    }
    const differences = await compareSkill(
      join(sourceRoot, name),
      join(installedRoot, name),
    );
    if (differences.length === 0) {
      lines.push(`OK    ${name}`);
      continue;
    }
    driftedCount += 1;
    lines.push(`DRIFT ${name}`);
    for (const difference of differences) lines.push(`        - ${difference}`);
  }

  for (const name of installedNames) {
    if (sourceSet.has(name)) continue;
    if (repositoryLocal.has(name)) {
      lines.push(`LOCAL ${name} (repository-local; no source under "${sourceRoot}")`);
      continue;
    }
    driftedCount += 1;
    lines.push(`DRIFT ${name}`);
    lines.push(
      `        - installed with no source under "${sourceRoot}", and not a known repository-local skill`,
    );
  }

  lines.push("");
  lines.push(
    driftedCount === 0
      ? `All ${sourceNames.length} distributable skill(s) match their installed copies.`
      : `${driftedCount} skill(s) drifted from their installed copies.`,
  );
  if (driftedCount > 0) {
    lines.push(
      "The source under the source root is authoritative; regenerate the installed copies with `npx skills` rather than hand-editing them.",
    );
  }
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exit(driftedCount === 0 ? 0 : 1);
}

main();
