import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  clientKeyFromHeaders,
  isApiRateLimited,
  isSameOriginRequest,
} from "./security";

function request(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers });
}

describe("security headers", () => {
  it("builds a locked-down CSP", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("googlesyndication");
    expect(csp).not.toContain("frame-src");
  });

  it("opens ad origins only when AdSense is enabled", () => {
    const csp = buildContentSecurityPolicy({ adsense: true });
    expect(csp).toContain("https://pagead2.googlesyndication.com");
    expect(csp).toContain("frame-src https://googleads.g.doubleclick.net");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("allows unsafe-eval only in the dev variant", () => {
    expect(buildContentSecurityPolicy({ dev: true })).toContain("'unsafe-eval'");
    expect(buildSecurityHeaders({ dev: true })["Content-Security-Policy"]).toContain("'unsafe-eval'");
  });

  it("emits clickjacking, sniffing, and referrer protections", () => {
    const headers = buildSecurityHeaders();
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Strict-Transport-Security"]).toContain("includeSubDomains");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });
});

describe("same-origin mutation check", () => {
  it("accepts matching origins and referers", () => {
    expect(
      isSameOriginRequest(request("https://rovotools.com/api/favorites", { origin: "https://rovotools.com" })),
    ).toBe(true);
    expect(
      isSameOriginRequest(
        request("https://rovotools.com/api/favorites", { referer: "https://rovotools.com/tools/x" }),
      ),
    ).toBe(true);
  });

  it("rejects cross-origin and missing provenance", () => {
    expect(
      isSameOriginRequest(request("https://rovotools.com/api/favorites", { origin: "https://evil.com" })),
    ).toBe(false);
    expect(isSameOriginRequest(request("https://rovotools.com/api/favorites"))).toBe(false);
    expect(
      isSameOriginRequest(request("https://rovotools.com/api/favorites", { origin: "not a url" })),
    ).toBe(false);
  });
});

describe("client keys and rate limiting", () => {
  it("prefers the first forwarded address", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKeyFromHeaders(headers, "fallback")).toBe("1.2.3.4");
    expect(clientKeyFromHeaders(new Headers(), "fallback")).toBe("fallback");
  });

  it("rate-limits repeated callers without blocking others", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 60; i += 1) {
      expect(isApiRateLimited(key)).toBe(false);
    }
    expect(isApiRateLimited(key)).toBe(true);
    expect(isApiRateLimited(`${key}-other`)).toBe(false);
  });
});
