#!/usr/bin/env node
// check.mjs — external documentation-link freshness audit for a skill tree.
//
// answers a question no offline check can: do the URLs this tree cites still
// resolve? check-links.mjs beside it resolves relative `.md` links against the
// file system and ignores `http(s)://` targets entirely, so nothing else here
// looks at an external link at all.
//
// why it exists. a skill that mirrors a vendor's API ages badly, so the better
// shape is a link plus the non-obvious caveat rather than a reproduced option
// table. that trades a table which goes stale where a reader can see it — a
// wrong default a reader
// can catch — for a link that rots where nobody can. this audit is the other
// half of
// that trade, and without it the trade is not safe to make.
//
// ── it reaches the network, so it is neither a gate nor a test.
// it belongs in a scheduled job on the default branch and nowhere else: not in a
// merge gate, not in a package script, not in an editor or session hook. a test
// suite must stay offline and deterministic, and a network call inside one makes
// the merge gate depend on whether a publisher's CDN is up — a gate that fails
// for reasons no contributor can fix is a gate that gets bypassed or deleted
// rather than repaired.
//
// ── why it must never be pull-request triggered. this is the load-bearing one,
// and ../SKILL.md states it as a rule rather than leaving it here. a review
// harness that runs against an untrusted pull request head denies it any
// fetching capability; a fetching job triggered by a pull request hands that
// capability straight back on head-controlled content. a `SKILL.md` on a fork's
// branch is text an outsider writes, and a job that dereferences every URL in it
// is a request forgery primitive with the repository's egress, reachable by
// anyone who can open a pull request. scheduled, from the default branch, the
// URLs probed are only ever ones already merged and reviewed.
//
// ── the other forgery vector, the one the trigger does not close. being merged
// makes a URL reviewed; it does not make the host honest, and this script
// follows redirects by hand — re-requesting whatever a `location` header names.
// a citation that was ordinary at review time can start redirecting to an
// internal address weeks later. every hop, the first included, is therefore
// re-validated by address-guard.mjs, which is where that threat and its residual
// rebinding window are set out in full.
//
// ── why it can fail at all, where a reporting tool cannot. a tool reports
// rather than
// judges when it has no defensible threshold, when the defect is undecidable
// from the text, or when it is non-deterministic. a dead link has none of those
// problems: it is a fact, it is decidable, and it is repairable. so this one
// fails. what it will not fail on is a host that refused to answer — see
// classify.mjs, where that decision lives.
//
// usage:
//   node check.mjs [options] [<path> ...]
//
// exit codes:
//   0  no link was confirmed dead (unverifiable and moved links are reported)
//   1  at least one link is confirmed dead
//   2  bad invocation

import { refusalReason } from "./address-guard.mjs";
import {
  ALIVE,
  classifyOutcome,
  DEAD,
  failsRun,
  GET_FALLBACK_STATUSES,
  isRetryableStatus,
  MOVED,
  PERMANENT_REDIRECT_STATUSES,
  REDIRECT_STATUSES,
  UNVERIFIABLE,
  VERDICTS,
} from "./classify.mjs";
import { collectUrls } from "./urls.mjs";

/**
 * identifies the audit to the hosts it probes, with somewhere to complain. a
 * default Node user-agent reads as an unattributed scraper, which is how a
 * repository earns a block that then shows up here as `unverifiable` forever.
 */
const USER_AGENT =
  "axross-skills-link-freshness/1 (+https://github.com/axross/skills)";

const DEFAULTS = {
  /** concurrent probes. low enough to stay polite across ~80 hosts. */
  concurrency: 8,
  /** per-request timeout, in milliseconds. */
  timeout: 15_000,
  /** extra attempts after the first, for a retryable status or a transport error. */
  retries: 2,
  /** base backoff between attempts, doubled each retry. */
  retryDelay: 1_000,
  /** redirect hops followed before giving up, which also breaks a redirect loop. */
  maxHops: 10,
};

const USAGE = `Usage: check.mjs [options] [<path> ...]

Probe every external http(s) URL cited in the Markdown under <path> and report
which ones no longer resolve. With no <path>, the whole tree below the working
directory is audited.

  --dry-run            list the URLs that would be probed and exit; makes NO
                       network request
  --concurrency <n>    concurrent probes (default ${DEFAULTS.concurrency})
  --timeout <ms>       per-request timeout (default ${DEFAULTS.timeout})
  --retries <n>        extra attempts on a retryable status or transport error
                       (default ${DEFAULTS.retries})
  --help, -h           show this message

Only a link confirmed dead — a 404 or 410 that survives a retry — fails the run.
A host that rate-limits, blocks, or times out is reported as unverifiable and
never affects the exit code.

Exit codes: 0 nothing confirmed dead, 1 one or more dead, 2 bad invocation.`;

function fail2(message) {
  process.stderr.write(`${message}\n${USAGE}\n`);
  process.exit(2);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * a transport failure, described in the terms a maintainer can act on: a DNS
 * miss, an expired certificate, and a timeout call for three different responses.
 */
function errorReason(error) {
  if (error?.name === "TimeoutError" || error?.name === "AbortError") {
    return "timed out";
  }
  const code = error?.cause?.code ?? error?.code;
  if (code) return `network error (${code})`;
  return `network error (${error?.message ?? "unknown"})`;
}

/**
 * one request, following each redirect itself.
 *
 * `fetch`'s own redirect following reports `redirected` as a bare boolean and
 * hides the status of each hop — which loses the only thing worth knowing here.
 * a 302 is a temporary arrangement and says nothing about the link; a 301 or 308
 * says the citation is out of date even though it still works. following
 * manually is what makes `moved` mean something.
 *
 * manual following also means re-issuing a request to a host the remote server
 * names, so every hop — the first included — is re-validated against
 * address-guard.mjs before it is made. without that, a merged citation whose
 * host later starts redirecting to `169.254.169.254` would have this runner
 * probe the cloud metadata endpoint on the next scheduled run, and nothing at
 * review time could have shown it. see address-guard.mjs for the threat and for
 * the rebinding window it does not close.
 *
 * @returns {Promise<import("./classify.mjs").Outcome>}
 */
async function requestOnce(url, { method, timeout, maxHops }) {
  let current = url;
  let permanentRedirect = false;

  for (let hop = 0; hop <= maxHops; hop += 1) {
    const refusal = await refusalReason(current);
    // deterministic, so it is marked non-retryable: re-resolving a name that
    // just answered with a private address three more times learns nothing and
    // triples the lookups.
    if (refusal) return { kind: "error", reason: refusal, retryable: false };

    const response = await fetch(current, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(timeout),
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });

    if (!REDIRECT_STATUSES.has(response.status)) {
      return {
        kind: "status",
        status: response.status,
        permanentRedirect,
        finalUrl: current,
      };
    }

    const location = response.headers.get("location");
    // a redirect with nowhere to go is the host's problem, not a hop. reported
    // as the status it actually sent rather than followed into nothing.
    if (!location) {
      return {
        kind: "status",
        status: response.status,
        permanentRedirect,
        finalUrl: current,
      };
    }

    if (PERMANENT_REDIRECT_STATUSES.has(response.status)) permanentRedirect = true;
    current = new URL(location, current).toString();
  }

  return { kind: "error", reason: `more than ${maxHops} redirects` };
}

/**
 * one request with retries, so a transient answer never reaches a verdict.
 *
 * returns as soon as a status is definitive. a retryable status or a transport
 * error is retried with doubling backoff, and whatever the last attempt produced
 * is what gets classified — a 429 that stays a 429 is still unverifiable, which
 * is the correct answer rather than a fallback.
 */
async function attempt(url, method, options) {
  let outcome;

  for (let index = 0; index <= options.retries; index += 1) {
    if (index > 0) await delay(options.retryDelay * 2 ** (index - 1));

    try {
      outcome = await requestOnce(url, { ...options, method });
    } catch (error) {
      outcome = { kind: "error", reason: errorReason(error) };
    }

    if (outcome.kind === "status" && !isRetryableStatus(outcome.status)) {
      return outcome;
    }
    // a refused address is a decision, not a transport blip.
    if (outcome.kind === "error" && outcome.retryable === false) return outcome;
  }
  return outcome;
}

/**
 * probe one URL to a verdict.
 *
 * three passes, each earning its place:
 *   1. `HEAD` — cheap, and enough for most hosts.
 *   2. `GET`, when `HEAD` came back 403/405/501 — "not like that", not "not here".
 *   3. `GET` again, only when the answer was dead — the "stable across retries"
 *      requirement. a 404 is the one verdict that fails the run, so it is the one
 *      verdict worth paying an extra request to be sure of, and a host that
 *      answers 404 once and 200 next is believed on the 200.
 */
async function probeUrl(url, options) {
  let outcome = await attempt(url, "HEAD", options);

  if (outcome.kind === "status" && GET_FALLBACK_STATUSES.has(outcome.status)) {
    outcome = await attempt(url, "GET", options);
  }

  const classified = classifyOutcome(outcome);
  if (classified.verdict !== DEAD) return classified;

  await delay(options.retryDelay);
  return classifyOutcome(await attempt(url, "GET", options));
}

/**
 * run `worker` over `items` with at most `limit` in flight, preserving order.
 *
 * a hand-rolled pool rather than chunked `Promise.all`: chunking idles the whole
 * pool waiting on the slowest URL in each chunk, and one host that sits at the
 * timeout would then stall every batch it appears in.
 */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;

  const runners = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      for (;;) {
        const index = next;
        next += 1;
        if (index >= items.length) return;
        results[index] = await worker(items[index], index);
      }
    },
  );

  await Promise.all(runners);
  return results;
}

/** section headings, each stating what the verdict costs the run. */
const SECTIONS = {
  [DEAD]: "DEAD — the host says it is gone. This is what fails the run.",
  [MOVED]:
    "MOVED — still resolves, through a permanent redirect. Informational.",
  [UNVERIFIABLE]:
    "UNVERIFIABLE — no answer from this network. Never affects the outcome.",
};

/**
 * render the report.
 *
 * alive URLs are counted, not listed: 200-odd working links are noise around the
 * handful that need a decision. everything printed is sorted upstream, and
 * nothing checkout-dependent appears, so two runs over an unchanged tree diff
 * cleanly.
 */
function render(results, { fileCount, siteCount }) {
  const byVerdict = new Map(VERDICTS.map((verdict) => [verdict, []]));
  for (const result of results) byVerdict.get(result.verdict).push(result);

  const lines = [
    `Link freshness for ${results.length} unique URL(s) across ${siteCount} site(s) in ${fileCount} Markdown file(s).`,
    "",
  ];

  for (const verdict of [DEAD, MOVED, UNVERIFIABLE]) {
    const found = byVerdict.get(verdict);
    if (found.length === 0) continue;

    lines.push(`${SECTIONS[verdict]} (${found.length})`, "");
    for (const { url, detail, sites } of found) {
      lines.push(`  ${url}`, `    ${detail}`);
      for (const site of sites) lines.push(`      ${site}`);
      lines.push("");
    }
  }

  const dead = byVerdict.get(DEAD).length;
  lines.push(
    `alive ${byVerdict.get(ALIVE).length}` +
      `  moved ${byVerdict.get(MOVED).length}` +
      `  unverifiable ${byVerdict.get(UNVERIFIABLE).length}` +
      `  dead ${dead}`,
    "",
    dead === 0
      ? "No link was confirmed dead."
      : `${dead} link(s) confirmed dead. Fix the citation, or record why it stays.`,
  );
  return lines.join("\n");
}

function parseCount(raw, flag) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    fail2(`${flag} needs a non-negative integer, got "${raw}".`);
  }
  return value;
}

function parseArgs(argv) {
  const options = { ...DEFAULTS, dryRun: false };
  const roots = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      roots.push(arg);
      continue;
    }

    switch (arg) {
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--concurrency":
        index += 1;
        options.concurrency = parseCount(argv[index], arg) || 1;
        break;
      case "--timeout":
        index += 1;
        options.timeout = parseCount(argv[index], arg);
        break;
      case "--retries":
        index += 1;
        options.retries = parseCount(argv[index], arg);
        break;
      default:
        fail2(`Unknown option "${arg}".`);
    }
  }

  return { options, roots: roots.length > 0 ? roots : ["."] };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(`${USAGE}\n`);
    process.exit(0);
  }

  const { options, roots } = parseArgs(argv);
  const { urls, fileCount, siteCount } = await collectUrls(roots);

  if (urls.length === 0) {
    process.stdout.write(
      `No external URLs found under ${roots.join(", ")} (${fileCount} Markdown file(s) read).\n`,
    );
    process.exit(0);
  }

  // the offline path. it exists so this script's extraction can be exercised by
  // the test suite and by a maintainer without spending anyone's rate limit —
  // and so a run that is about to probe can be previewed first.
  if (options.dryRun) {
    const lines = [
      `Would probe ${urls.length} unique URL(s) across ${siteCount} site(s) in ${fileCount} Markdown file(s).`,
      "",
    ];
    for (const { url, sites } of urls) {
      lines.push(`  ${url}`);
      for (const site of sites) lines.push(`    ${site}`);
    }
    lines.push("", "No network request was made.");
    process.stdout.write(`${lines.join("\n")}\n`);
    process.exit(0);
  }

  let completed = 0;
  const results = await mapWithConcurrency(
    urls,
    options.concurrency,
    async ({ url, sites }) => {
      const { verdict, detail } = await probeUrl(url, options);
      completed += 1;
      // progress goes to stderr so stdout stays the report and stays diffable.
      if (completed % 25 === 0 || completed === urls.length) {
        process.stderr.write(`  probed ${completed}/${urls.length}\n`);
      }
      return { url, sites, verdict, detail };
    },
  );

  process.stdout.write(`${render(results, { fileCount, siteCount })}\n`);
  process.exit(failsRun(results.map((result) => result.verdict)) ? 1 : 0);
}

main();
