#!/usr/bin/env node
// reference resolution: every relative link under docs/ addresses something
// that exists.
//
// this is the most-run check here, because every edit can break one. it
// covers index.md's own entries too — whether a listed file is *missing* is a
// broken link, while whether an existing file is *unlisted* belongs to
// check-index.mjs.
//
// external URLs are out of scope. whether a published address still resolves is
// a network question with its own failure modes, and an offline check that
// guessed at it would be wrong in both directions.

import { stat } from "node:fs/promises";

import { extractLinks, main, resolveLink, selfName, siblingHelp } from "./docs.mjs";

const USAGE = `Usage: ${selfName(import.meta.url)} [<docs-dir>]

Check that every relative Markdown link under a project's docs resolves to a
file or directory that exists. Run it after editing any document.

Only relative links are checked; an http(s) URL is left to a link-freshness
audit, which needs the network and a different failure policy. Defaults to
./docs.

Exit codes: 0 every link resolves, or the project has no docs.
            1 findings. 2 bad invocation.
${siblingHelp(selfName(import.meta.url))}`;

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

let checked = 0;

async function run(docs) {
  const findings = [];

  for (const doc of docs.documents) {
    for (const { target, line } of extractLinks(doc.text)) {
      checked += 1;
      if (!(await exists(resolveLink(doc.path, target)))) {
        findings.push({
          category: "link",
          message: `${doc.relative}:${line} → ${target} does not resolve`,
        });
      }
    }
  }

  return findings;
}

process.exitCode = await main({
  usage: USAGE,
  argv: process.argv.slice(2),
  run,
  pass: (docs) =>
    `Every relative link resolves (${checked} across ${docs.documents.length} documents).`,
});
