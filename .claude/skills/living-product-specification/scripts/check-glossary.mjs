#!/usr/bin/env node
// vocabulary correspondence: every behavioural domain has somewhere to define
// its words.
//
// the correspondence runs one way on purpose. a spec needs a heading, because a
// domain whose terms are undefined is where a glossary silently stops being the
// place vocabulary lives. a heading needs no spec: cross-cutting vocabulary
// belongs to no single domain, and a domain can be named before its behaviour is
// written down. checking the other direction would need an exception list for
// both, and an exception list is where a rule goes to be ignored.

import { extractHeadings, main, selfName, siblingHelp, slug } from "./docs.mjs";

const USAGE = `Usage: ${selfName(import.meta.url)} [<docs-dir>]

Check that every spec under a project's docs has a matching heading in
glossary.md. Run it after adding or renaming a spec, or after editing the
glossary.

A specs/<domain>.md file pairs with a "## <Domain>" heading, compared on a
slug so "## Job Templates" pairs with job-templates.md. The reverse is not
required: a heading may define cross-cutting vocabulary that no single spec
owns. Defaults to ./docs.

Exit codes: 0 every spec has a heading, or the project has no docs, or no specs/.
            1 findings. 2 bad invocation.
${siblingHelp(selfName(import.meta.url))}`;

function run(docs) {
  const specs = docs.documents.filter((doc) => doc.relative.startsWith("specs/"));
  if (specs.length === 0) return [];

  const glossary = docs.documents.find((doc) => doc.relative === "glossary.md");
  if (!glossary) {
    return [
      {
        category: "glossary",
        message: `glossary.md is missing, so none of the ${specs.length} spec(s) has anywhere to define its terms`,
      },
    ];
  }

  const headings = new Set(extractHeadings(glossary.text, 2).map(({ text }) => slug(text)));
  const findings = [];

  for (const spec of specs) {
    const stem = spec.relative.slice("specs/".length, -".md".length);
    if (stem.includes("/")) {
      findings.push({
        category: "nested",
        message: `${spec.relative} is nested; specs/ is flat so one domain maps to one heading`,
      });
      continue;
    }
    if (!headings.has(slug(stem))) {
      findings.push({
        category: "glossary",
        message: `${spec.relative} has no matching heading in glossary.md`,
      });
    }
  }

  return findings;
}

process.exitCode = await main({
  usage: USAGE,
  argv: process.argv.slice(2),
  needs: "specs",
  absent: "Nothing to check.",
  run,
  pass: (docs) =>
    `Every spec has a heading in glossary.md (${
      docs.documents.filter((doc) => doc.relative.startsWith("specs/")).length
    } checked).`,
});
