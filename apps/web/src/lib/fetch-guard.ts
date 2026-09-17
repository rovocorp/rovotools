/**
 * SSRF guards for the page-fetch API.
 * Pure functions (no I/O) so they are unit-testable in isolation;
 * the route handler in `app/api/fetch-page/route.ts` performs the
 * DNS lookups and applies these checks to every address AND every
 * redirect hop — a lookup-time check alone would miss
 * redirect-to-internal attacks.
 */

function ipv4Octets(ip: string): Array<number> | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  const octets: Array<number> = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const n = Number(part);
    if (n > 255) {
      return null;
    }
    octets.push(n);
  }
  return octets;
}

/** True for loopback, private, link-local, multicast, CGNAT and 0.0.0.0/8. */
export function isPrivateIPv4(ip: string): boolean {
  const octets = ipv4Octets(ip);
  if (octets === null) {
    return false;
  }
  const [a, b] = octets as [number, number, number, number];
  if (a === 10) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  if (a === 127) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 0) {
    return true;
  }
  if (a >= 224 && a <= 239) {
    return true;
  }
  if (a === 100 && b >= 64 && b <= 127) {
    return true;
  }
  if (a === 192 && (b === 0 || b === 2 || b === 18 || b === 19 || b === 31 || b === 51 || b === 88)) {
    return true;
  }
  if (a === 203 && b === 0) {
    return true;
  }
  return false;
}

function normalizeIPv6(ip: string): string {
  let clean = ip.trim().toLowerCase();
  if (clean.startsWith("[") && clean.endsWith("]")) {
    clean = clean.slice(1, -1);
  }
  return clean;
}

/** True for loopback, unspecified, unique-local, link-local and IPv4-mapped private. */
export function isPrivateIPv6(ip: string): boolean {
  const clean = normalizeIPv6(ip);
  if (clean === "::1" || clean === "::") {
    return true;
  }
  if (clean.startsWith("fc") || clean.startsWith("fd")) {
    return true;
  }
  // fe80::/10 covers fe80–febf.
  const firstHextet = clean.split(":")[0] ?? "";
  if (/^fe[89ab][0-9a-f]$/i.test(firstHextet)) {
    return true;
  }
  if (clean.startsWith("ff")) {
    return true;
  }
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(clean);
  if (mapped?.[1] !== undefined) {
    return isPrivateIPv4(mapped[1]);
  }
  if (clean.startsWith("2001:db8")) {
    return true;
  }
  return false;
}

export function isBlockedAddress(address: string): boolean {
  return isPrivateIPv4(address) || isPrivateIPv6(address);
}

const BLOCKED_HOSTNAMES: ReadonlySet<string> = new Set(["localhost", "localhost.localdomain", "ip6-localhost"]);

/** Hostnames that never need a DNS lookup to reject. */
export function isBlockedHostname(hostname: string): boolean {
  const clean = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (clean === "" || BLOCKED_HOSTNAMES.has(clean)) {
    return true;
  }
  // Single-label names resolve via search domains/mDNS — not public web.
  if (!clean.includes(".")) {
    return true;
  }
  return false;
}

export const MAX_URL_LENGTH = 2000;

/** Parse and accept only absolute http(s) URLs. Throws RangeError otherwise. */
export function parseTargetUrl(raw: unknown): URL {
  if (typeof raw !== "string" || raw.trim() === "" || raw.length > MAX_URL_LENGTH) {
    throw new RangeError("Provide a page URL up to 2000 characters.");
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new RangeError("Enter a valid absolute URL starting with http:// or https://.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RangeError("Only http:// and https:// URLs can be fetched.");
  }
  if (url.username !== "" || url.password !== "") {
    throw new RangeError("URLs with credentials cannot be fetched.");
  }
  return url;
}

/** Content types the analyzer tools can actually use. */
export function isSupportedContentType(contentType: string | null): boolean {
  if (contentType === null) {
    return false;
  }
  const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return (
    mime === "text/html" ||
    mime === "application/xhtml+xml" ||
    mime === "application/xml" ||
    mime === "text/xml" ||
    mime === "application/rss+xml" ||
    mime === "application/atom+xml" ||
    mime === "application/json" ||
    mime === "text/plain"
  );
}
