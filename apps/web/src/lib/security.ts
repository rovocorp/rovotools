import { createRateLimiter } from "@rovotools/core";

export function buildContentSecurityPolicy(options?: { adsense?: boolean; dev?: boolean }): string {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (options?.dev === true) {
    // Next.js Fast Refresh evaluates code at runtime in development only.
    // Production builds never need this, so it stays out of the default.
    scriptSrc.push("'unsafe-eval'");
  }
  const imgSrc = ["'self'", "data:", "blob:"];
  const frameSrc: Array<string> = [];
  const connectSrc = ["'self'"];
  if (options?.adsense === true) {
    scriptSrc.push("https://pagead2.googlesyndication.com");
    imgSrc.push("https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net");
    frameSrc.push("https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com");
    connectSrc.push("https://pagead2.googlesyndication.com");
  }
  const directives = [
    "default-src 'self'",
    // Next.js requires inline scripts for bootstrapping and the theme
    // init; everything else is locked to same-origin.
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (frameSrc.length > 0) {
    directives.push(`frame-src ${frameSrc.join(" ")}`);
  }
  return directives.join("; ");
}

export function buildSecurityHeaders(options?: { adsense?: boolean; dev?: boolean }): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(options),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

function urlHost(value: string | null): string | null {
  if (value === null || value === "") {
    return null;
  }
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request): boolean {
  // Compare against the Host header (what the client addressed), not the
  // reconstructed request URL: runtimes disagree on the latter's host
  // (notably IPv6/dual-stack standalone servers), which silently turned this
  // check into a deny-all. Deliberately ignores x-forwarded-host: it is
  // client-forgeable and must never override Host for a security decision.
  // Fall back to the request URL only when no Host header exists (synthetic
  // requests in unit tests): real HTTP traffic always carries Host.
  const host = (request.headers.get("host") ?? "").toLowerCase() || urlHost(request.url);
  if (host === null || host === "") {
    return false;
  }
  const candidates = [urlHost(request.headers.get("origin")), urlHost(request.headers.get("referer"))];
  return candidates.some((candidate) => candidate !== null && candidate === host);
}

const apiLimiter = createRateLimiter(60, 60_000);

export function isApiRateLimited(clientKey: string): boolean {
  return !apiLimiter.allow(clientKey);
}

export function clientKeyFromHeaders(headers: Headers, fallback: string): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded !== null && forwarded !== "") {
    return forwarded.split(",")[0]?.trim() || fallback;
  }
  return fallback;
}
