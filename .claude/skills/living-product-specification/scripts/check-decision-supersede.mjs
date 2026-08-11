#!/usr/bin/env node
// the supersede chain, and whether anything still cites what it replaced.
//
// a decision is never rewritten; it is superseded by a new record. that makes
// the last check here the valuable one: a spec's link to a superseded decision
// still *resolves*, so no link checker will ever notice it, while the rationale
// it points at has been replaced. only status metadata makes that visible.
//
// the frontmatter check exists to protect that one. a record superseded without
// its status set reports nothing rather than reporting a problem, and a check
// that fails silently is worse than one that is absent.

import { join } from "node:path";

import {
  decisionRecords,
  extractLinks,
  main,
  nonDecisionDocuments,
  parseFrontmatter,
  resolveLink,
  selfName,
  siblingHelp,
} from "./docs.mjs";

const USAGE = `Usage: ${selfName(import.meta.url)} [<docs-dir>]

Check a decision log's supersede chain, and that no document still points at
rationale that has been replaced. Run it after superseding a decision.

Each record carries "status: accepted" or "status: superseded"; a superseded one
names its replacement in "superseded_by". A link to a superseded record still
resolves, so nothing but this check can see it. Defaults to ./docs.

Exit codes: 0 the chain is sound, or the project has no docs, or no decisions/.
            1 findings. 2 bad invocation.
${siblingHelp(selfName(import.meta.url))}`;

const STATUSES = new Set(["accepted", "superseded"]);

function run(docs) {
  const records = decisionRecords(docs);
  const findings = [];
  const superseded = new Map();

  for (const record of records) {
    const { data, present } = parseFrontmatter(record.text);
    const status = data.status;
    const replacement = data.superseded_by;

    if (!present || status === undefined) {
      findings.push({
        category: "frontmatter",
        message: `${record.relative} declares no status; expected "accepted" or "superseded"`,
      });
    } else if (!STATUSES.has(status)) {
      findings.push({
        category: "frontmatter",
        message: `${record.relative} has status "${status}"; expected "accepted" or "superseded"`,
      });
    }

    if (replacement !== undefined && status !== "superseded") {
      findings.push({
        category: "frontmatter",
        message: `${record.relative} names superseded_by but its status is not "superseded", so every link to it reads as current`,
      });
    }
    if (status === "superseded" && replacement === undefined) {
      findings.push({
        category: "frontmatter",
        message: `${record.relative} is superseded but names no superseded_by`,
      });
    }

    if (replacement !== undefined) {
      const target = join(docs.root, "decisions", replacement);
      if (!records.some((candidate) => candidate.path === target)) {
        findings.push({
          category: "supersede-target",
          message: `${record.relative} names superseded_by ${replacement}, which is not a decision record`,
        });
      }
    }

    if (status === "superseded") {
      superseded.set(record.path, { relative: record.relative, replacement });
    }
  }

  for (const doc of nonDecisionDocuments(docs)) {
    for (const { target, line } of extractLinks(doc.text)) {
      const replaced = superseded.get(resolveLink(doc.path, target));
      if (replaced) {
        findings.push({
          category: "stale-reference",
          message: `${doc.relative}:${line} → ${replaced.relative} was superseded by ${
            replaced.replacement ?? "an unnamed record"
          }`,
        });
      }
    }
  }

  return findings;
}

process.exitCode = await main({
  usage: USAGE,
  argv: process.argv.slice(2),
  needs: "decisions",
  absent: "Nothing to check.",
  run,
  pass: (docs) =>
    `The supersede chain is sound and nothing cites replaced rationale (${
      decisionRecords(docs).length
    } record(s) checked).`,
});
