#!/usr/bin/env node
// decision filenames: they sort chronologically and never move.
//
// this is the one command here that reads no document. it stats the adoption
// marker and lists one directory, which keeps it fast enough for a pre-commit
// hook — a property it would have lost bundled with the docs-walking checks.
//
// it is also the one check decidable from a single name, which the standard
// this set otherwise holds to would rule out. it is kept because these
// validators install into projects whose agents may write a decision without
// this skill loaded, and a filename is what the whole log's ordering and every
// inbound link depend on.

import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { DEFAULT_DOCS_DIR, parseArgs, report, selfName, siblingHelp } from "./docs.mjs";

const USAGE = `Usage: ${selfName(import.meta.url)} [<docs-dir>]

Check that every decision record is named YYYY-MM-DD-<decision-in-kebab-case>.md
with a real date. Run it after writing a decision.

The date is the day the decision was made and never changes, which is what lets
a spec link to a record and keep resolving. The trailing segment states the
decision, not its topic. Defaults to ./docs.

Exit codes: 0 every filename conforms, or the project has no docs, or no decisions/.
            1 findings. 2 bad invocation.
${siblingHelp(selfName(import.meta.url))}`;

const NAME_RE = /^(\d{4})-(\d{2})-(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

function isRealDate(year, month, day) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const parsed = parseArgs(process.argv.slice(2), USAGE);
if ("exit" in parsed) {
  (parsed.exit === 0 ? console.log : console.error)(parsed.message);
  process.exitCode = parsed.exit;
} else {
  const root = resolve(parsed.dir ?? DEFAULT_DOCS_DIR);

  if (!(await exists(join(root, "index.md")))) {
    console.log(`No docs at ${parsed.dir} (no index.md). Nothing to check.`);
    process.exitCode = 0;
  } else if (!(await exists(join(root, "decisions")))) {
    console.log(`No decisions/ under ${parsed.dir}. Nothing to check.`);
    process.exitCode = 0;
  } else {
    const entries = (await readdir(join(root, "decisions"), { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort();

    const findings = [];
    for (const name of entries) {
      const match = name.match(NAME_RE);
      if (!match) {
        findings.push({
          category: "filename",
          message: `decisions/${name} is not YYYY-MM-DD-<decision-in-kebab-case>.md`,
        });
        continue;
      }
      const [, year, month, day] = match;
      if (!isRealDate(year, month, day)) {
        findings.push({
          category: "filename",
          message: `decisions/${name} carries no real date (${year}-${month}-${day})`,
        });
      }
    }

    process.exitCode = report(
      parsed.dir,
      findings,
      `Every decision filename conforms (${entries.length} checked).`,
    );
  }
}
