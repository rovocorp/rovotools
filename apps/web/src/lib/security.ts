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

export function isSameOriginRequest(request: Request): boolean {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin !== null && origin !== "") {
    try {
      return new URL(origin).host === url.host;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer !== null && referer !== "") {
    try {
      return new URL(referer).host === url.host;
    } catch {
      return false;
    }
  }
  return false;
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
