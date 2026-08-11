#!/usr/bin/env node
// orphan detection: a document nobody can reach.
//
// this command owns one direction only — is a file listed? whether a listed
// link resolves is check-references.mjs's question, so no defect is reported
// twice.
//
// individual decision records are exempt. the log is append-only, so indexing
// each record would grow the one file read unconditionally without bound. the
// index carries a single line for the directory instead, and that line is
// checked here.

import { join, relative, sep } from "node:path";

import {
  extractLinks,
  main,
  nonDecisionDocuments,
  resolveLink,
  selfName,
  siblingHelp,
} from "./docs.mjs";

const USAGE = `Usage: ${selfName(import.meta.url)} [<docs-dir>]

Check that every document under a project's docs is listed in index.md. Run it
after adding or removing a document.

An individual decision record is not listed — the index links decisions/ once, as
a directory, because an append-only log would otherwise grow the index without
bound. Linking a record individually is reported, not exempted. Defaults to
./docs.

Exit codes: 0 every document is listed, or the project has no docs.
            1 findings. 2 bad invocation.
${siblingHelp(selfName(import.meta.url))}`;

function run(docs) {
  const index = docs.documents.find((doc) => doc.relative === "index.md");
  const linked = new Set(
    extractLinks(index.text).map(({ target }) => resolveLink(index.path, target)),
  );

  const findings = [];

  for (const doc of nonDecisionDocuments(docs)) {
    if (doc.relative === "index.md") continue;
    if (!linked.has(doc.path)) {
      findings.push({
        category: "unindexed",
        message: `${doc.relative} is not linked from index.md`,
      });
    }
  }

  if (docs.hasDecisions) {
    const decisionsDir = join(docs.root, "decisions");
    let linksDirectory = false;

    for (const target of linked) {
      if (target === decisionsDir) {
        linksDirectory = true;
        continue;
      }
      // a target under decisions/ is an individually indexed record. it leaves
      // the log reachable, which is why an "is it reachable at all?" test would
      // accept it — and it is the exact shape the log must never take, since the
      // index is read unconditionally and an append-only log only ever grows.
      if (relative(decisionsDir, target).split(sep)[0] !== "..") {
        const record = relative(decisionsDir, target).split(sep).join("/");
        findings.push({
          category: "over-indexed",
          message: `index.md links decisions/${record} individually; the log is linked once, as a directory`,
        });
      }
    }

    if (!linksDirectory) {
      findings.push({
        category: "unindexed",
        message:
          "decisions/ is not linked from index.md as a directory, so the decision log is unreachable",
      });
    }
  }

  return findings;
}

process.exitCode = await main({
  usage: USAGE,
  argv: process.argv.slice(2),
  run,
  pass: (docs) =>
    `Every document is listed in index.md (${nonDecisionDocuments(docs).length - 1} indexed${
      docs.hasDecisions ? ", plus the decision log as a directory" : ""
    }).`,
});
