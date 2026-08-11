// address-guard.mjs — refuse to probe an address that is not on the public
// internet.
//
// why this exists. check.mjs follows each redirect itself, because `fetch`'s
// own following hides each hop's status and the audit needs to tell a permanent
// move from a temporary one. following by hand means re-issuing a request to
// whatever host a `location` header names — and a `location` header is written
// by the remote server, not by this repository.
//
// the threat is not theoretical and it survives review of the citation itself. a
// contributor lands an ordinary, reviewable doc citation to
// `https://looks-legit.example/docs`. weeks later that host starts answering
// 301 with `Location: http://169.254.169.254/…`, and the next scheduled run
// dutifully issues that request from a GitHub runner. nothing at review time
// could have shown it, because at review time the redirect did not exist.
//
// an application-security capability states the rule this closes: disable
// redirect following (`redirect: "manual"`) on an untrusted-URL fetch, or
// re-resolve and re-validate the final host after each redirect to defeat DNS
// rebinding. the audit does both — manual mode together with re-validation at
// every hop,
// including the first.
//
// ── what this does not close. validation resolves the hostname and then hands
// the name to `fetch`, which resolves it again. a name that answers with a
// public address on the first lookup and a private one on the second slips
// through that window — classic DNS rebinding. closing it properly means
// connecting to the validated address with the hostname carried in a `Host`
// header, which global `fetch` gives no supported way to do without taking
// undici as a direct dependency; this script is Node standard library only, by
// design, because it ships in a repository that audits its own supply chain.
//
// the residual risk is bounded and worth stating rather than hiding: the job's
// token is `contents: read`, no response body ever reaches the report, and only
// a status code or a redirect target is printed. what remains is blind
// reachability probing on a rebinding-capable host — recon, not exfiltration.

import { lookup } from "node:dns/promises";
import { isIP, isIPv4 } from "node:net";

/**
 * IPv4 ranges that are not the public internet, as [first octet-wise mask, value].
 * each is a CIDR the audit must never probe.
 */
const RESERVED_IPV4 = [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // RFC 1918 private
  ["100.64.0.0", 10], // RFC 6598 carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local — cloud metadata lives at 169.254.169.254
  ["172.16.0.0", 12], // RFC 1918 private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.168.0.0", 16], // RFC 1918 private
  ["198.18.0.0", 15], // benchmarking
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, including 255.255.255.255
];

/** a dotted quad as a 32-bit integer, or null when it is not one. */
function ipv4ToInteger(address) {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

/**
 * rewrite a trailing dotted quad into two hex groups, so an IPv4-mapped or
 * IPv4-compatible IPv6 address parses as eight uniform groups.
 */
function foldEmbeddedIPv4(address) {
  const match = address.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (!match) return address;

  const value = ipv4ToInteger(match[1]);
  if (value === null) return address;

  const high = (value >>> 16).toString(16);
  const low = (value & 0xffff).toString(16);
  return `${address.slice(0, match.index)}${high}:${low}`;
}

/** an IPv6 address as eight 16-bit groups, or null when it does not parse. */
function ipv6Groups(address) {
  const bare = foldEmbeddedIPv4(address.split("%")[0]);

  let parts;
  if (bare.includes("::")) {
    const [head, tail] = bare.split("::");
    const headParts = head ? head.split(":") : [];
    const tailParts = tail ? tail.split(":") : [];
    const missing = 8 - headParts.length - tailParts.length;
    if (missing < 0) return null;
    parts = [...headParts, ...Array(missing).fill("0"), ...tailParts];
  } else {
    parts = bare.split(":");
  }

  if (parts.length !== 8) return null;
  return parts.map((part) => parseInt(part === "" ? "0" : part, 16));
}

/**
 * whether an IP literal names something other than the public internet.
 *
 * pure and synchronous, so every range below is unit-tested without a socket or
 * a resolver — which is what keeps this rule covered by an offline suite.
 *
 * @param {string} address an IPv4 or IPv6 literal
 * @returns {boolean} true when the address must not be probed, including when
 *   it cannot be parsed — an address this cannot understand is one it cannot
 *   vouch for
 */
export function isReservedAddress(address) {
  if (isIPv4(address)) {
    const value = ipv4ToInteger(address);
    if (value === null) return true;

    return RESERVED_IPV4.some(([network, bits]) => {
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      return (value & mask) >>> 0 === (ipv4ToInteger(network) & mask) >>> 0;
    });
  }

  const groups = ipv6Groups(address);
  if (groups === null) return true;

  // an IPv4-mapped (::ffff:a.b.c.d) or IPv4-compatible address is judged by the
  // IPv4 it carries — otherwise ::ffff:169.254.169.254 walks straight past every
  // check below.
  const mappedPrefix = groups.slice(0, 5).every((group) => group === 0);
  if (mappedPrefix && (groups[5] === 0xffff || groups[5] === 0)) {
    const embedded = [
      groups[6] >> 8,
      groups[6] & 0xff,
      groups[7] >> 8,
      groups[7] & 0xff,
    ].join(".");
    // `::` and `::1` fall out here as 0.0.0.0 and 0.0.0.1, both inside 0.0.0.0/8.
    return isReservedAddress(embedded);
  }

  const [first] = groups;
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((first & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  return false;
}

/**
 * why a URL must not be probed, or null when it may be.
 *
 * called before every request, the first one included: a citation merged into
 * this repository is more trustworthy than a redirect target, but it is still
 * text, and defending only the hops would leave the obvious case open.
 *
 * a hostname that fails to resolve returns null rather than a refusal. the
 * request is then made and fails on its own, and `classifyOutcome` reports the
 * transport error — which is both the truthful verdict and one less place where
 * DNS behaviour is described twice.
 *
 * @param {string} target the URL about to be fetched
 * @returns {Promise<string | null>} a reason to refuse, or null to proceed
 */
export async function refusalReason(target) {
  let url;
  try {
    url = new URL(target);
  } catch {
    return `refused: not a valid URL (${target})`;
  }

  // a `location` header may name any scheme at all. only these two are ever
  // probed, so `file:`, `gopher:`, and friends are refused rather than handed to
  // fetch to reject in its own way.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return `refused: non-HTTP scheme (${url.protocol})`;
  }

  // a bracketed IPv6 literal arrives as "[::1]".
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  if (isIP(hostname)) {
    return isReservedAddress(hostname)
      ? `refused: reserved address (${hostname})`
      : null;
  }

  let addresses;
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    return null; // let the request fail, and report the transport error
  }

  // every resolved address must be public. a name answering with one public and
  // one private address is a rebinding attempt, not a partial success.
  const reserved = addresses.find((entry) => isReservedAddress(entry.address));
  return reserved
    ? `refused: ${hostname} resolves to a reserved address (${reserved.address})`
    : null;
}
