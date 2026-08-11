// token-estimate.mjs — the byte→token proxy, shared by this skill's size
// advisory and by tooling that estimates what a set of documents costs to load.
//
// BYTES_PER_TOKEN converts a document's size into an estimated token count
// without a tokenizer, which the validators here cannot take as a dependency:
// they ship inside a skill and run on Node's standard library alone. the unit is
// UTF-8 bytes, not `String.length` — these documents are dense in multi-byte
// punctuation, and the two counts differ by roughly half a percent. bytes are
// chosen because they err high, the conservative direction for a budget guard,
// not because they are more accurate: measured against real o200k_base counts
// over this corpus, bytes/token averages 4.800 and chars/token 4.781, and the
// per-file spread runs 4.55–4.98. that spread is why the divisor is only good to
// PROXY_UNCERTAINTY, and why a check built on it warns rather than fails.
//
// re-measure before moving the divisor; a proxy calibrated on one corpus is not
// calibrated on another. that instruction is exactly why this lives in one
// module rather than as a literal in each caller: an invitation to re-measure is
// an invitation to change the number, and a second copy would silently keep the
// old one while still claiming to report "the" estimate. both callers surface
// the divisor in their output, so a drift would be visible to readers as two
// tools disagreeing about the same file.
//
// this module is not an executable: it carries no CLI, has no imports, and ships
// in this skill so its importers stay runnable from an installed copy.

/** UTF-8 bytes per token, calibrated on this corpus. see the header. */
export const BYTES_PER_TOKEN = 4.76;

/**
 * how good the proxy is, as a display string. callers interpolate this into
 * their own reports rather than restating it, so the figure a reader is told to
 * trust cannot drift from the one the divisor actually earns.
 */
export const PROXY_UNCERTAINTY = "±5%";

/**
 * estimated tokens for a UTF-8 byte count.
 *
 * @param {number} bytes
 * @returns {number} rounded to the nearest whole token
 */
export function estimateTokens(bytes) {
  return Math.round(bytes / BYTES_PER_TOKEN);
}
