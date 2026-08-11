// classify.mjs — the outcome-to-verdict rule for the link-freshness audit.
//
// pure, and separated from the probing on purpose. whether a 403 fails the run
// is the decision this audit actually turns on, and a decision that important
// should be readable and testable without a socket. check.mjs owns talking to
// the network; this file owns what the answer means.
//
// four verdicts, and exactly one of them fails.
//
//   alive         2xx. nothing to say.
//   moved         2xx reached through a permanent redirect. informational.
//   dead          404 or 410, stable across retries. the one that fails a run.
//   unverifiable  Everything else — 403, 429, 5xx, timeout, DNS, TLS.
//
// the split between `dead` and `unverifiable` is the whole design. a skill
// corpus of any size cites dozens of hosts, and several of the ones this kind of
// documentation reaches for (nngroup.com, smashingmagazine.com,
// developer.apple.com among them) rate-limit or outright block datacentre
// egress. an audit that went red because a publisher throttled a CI runner would
// be red most weeks, and a check which cries wolf gets bypassed or deleted
// rather than fixed. so a host that refuses to answer and a host that answers
// "gone" are different findings, and only the second is a defect in the audited
// tree's text.
//
// `moved` is deliberately not a failure either. a permanent redirect still
// serves the reader, so failing on one would punish a working link — but a deep
// link that now lands on a generic documentation index is precisely the rot this
// audit exists to surface, so it is reported rather than folded into `alive`.
// reported, a human decides; failed, they would only learn to ignore it.

/** a URL that resolves. */
export const ALIVE = "alive";
/** a URL that resolves, but only after a permanent redirect. informational. */
export const MOVED = "moved";
/** a URL the host says is gone. the only verdict that fails a run. */
export const DEAD = "dead";
/** a URL this network could not get an answer about. never fails a run. */
export const UNVERIFIABLE = "unverifiable";

/** verdicts in report order: the actionable ones first. */
export const VERDICTS = [DEAD, MOVED, UNVERIFIABLE, ALIVE];

/**
 * the statuses that mean "this resource is gone", and the only ones that fail a
 * run.
 *
 * 404 and 410 only. deliberately not 400, 401, or 451: each of those describes
 * the request or the requester rather than the resource — a bad query string, a
 * paywall, a legal block in the runner's jurisdiction — and a link a logged-in
 * human reads fine is not rot in this repository's text.
 */
export const DEAD_STATUSES = new Set([404, 410]);

/**
 * statuses that mean "not like that" rather than "not here", so the probe should
 * retry the same URL with `GET` before believing them.
 *
 * 405 and 501 are the honest answers to an unsupported `HEAD`. 403 is here for a
 * blunter reason: several documentation hosts answer `HEAD` with a refusal and
 * `GET` with the page, so treating a `HEAD` 403 as final would report a live
 * page as unverifiable on every run.
 */
export const GET_FALLBACK_STATUSES = new Set([403, 405, 501]);

/** redirect statuses that mean the move is permanent. */
export const PERMANENT_REDIRECT_STATUSES = new Set([301, 308]);

/** every redirect status a probe follows. */
export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * whether a status is worth trying again.
 *
 * 429 and 5xx describe a moment rather than a resource, and this audit's whole
 * premise is that a moment must never reach a verdict. a retried 429 that stays
 * 429 still lands in `unverifiable`, so retrying costs a little time and buys
 * the difference between "throttled once" and "throttled consistently".
 *
 * @param {number} status
 * @returns {boolean}
 */
export function isRetryableStatus(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * @typedef {object} Outcome
 * @property {"status"|"error"} kind
 * @property {number} [status]            final status, for kind `status`
 * @property {boolean} [permanentRedirect] whether any hop was a 301/308
 * @property {string} [finalUrl]          where the chain landed
 * @property {string} [reason]            what went wrong, for kind `error`
 */

/**
 * map one probe outcome onto a verdict.
 *
 * a transport-level failure — DNS, TLS, connection reset, timeout, a redirect
 * chain too long or looping — is unverifiable without exception. it is
 * genuinely unknown whether the resource is there, and the audit reports what
 * it knows rather than guessing in the direction that produces a finding.
 *
 * @param {Outcome} outcome
 * @returns {{ verdict: string, detail: string }} `detail` is the one-line
 *   explanation printed beside the URL
 */
export function classifyOutcome(outcome) {
  if (outcome.kind === "error") {
    return { verdict: UNVERIFIABLE, detail: outcome.reason ?? "no response" };
  }

  const { status, permanentRedirect = false, finalUrl } = outcome;

  if (status >= 200 && status < 300) {
    if (!permanentRedirect) return { verdict: ALIVE, detail: String(status) };
    return {
      verdict: MOVED,
      detail: `permanent redirect → ${finalUrl}`,
    };
  }

  if (DEAD_STATUSES.has(status)) {
    return { verdict: DEAD, detail: `HTTP ${status}` };
  }

  return { verdict: UNVERIFIABLE, detail: `HTTP ${status}` };
}

/**
 * whether a set of verdicts should fail the run.
 *
 * one place rather than a comparison written at each call site, so "only `dead`
 * fails" cannot drift between the exit code, the summary line, and the tests
 * that pin both.
 *
 * @param {Iterable<string>} verdicts
 * @returns {boolean}
 */
export function failsRun(verdicts) {
  for (const verdict of verdicts) {
    if (verdict === DEAD) return true;
  }
  return false;
}
