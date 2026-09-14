import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildSecurityHeaders, clientKeyFromHeaders, isApiRateLimited, isSameOriginRequest } from "./lib/security";

export default function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const adsense =
    process.env["NEXT_PUBLIC_ADSENSE_PUBLISHER_ID"] !== undefined &&
    process.env["NEXT_PUBLIC_ADSENSE_PUBLISHER_ID"] !== "";
  const securityHeaders = buildSecurityHeaders({
    adsense,
    // Development needs 'unsafe-eval' for Next.js Fast Refresh; production
    // must never allow it. Without this, dev page JavaScript fails to boot
    // and no client-side button works.
    dev: process.env["NODE_ENV"] !== "production",
  });
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const key = clientKeyFromHeaders(request.headers, "unknown");
    if (isApiRateLimited(key)) {
      return deny(429, "Too many requests.", securityHeaders);
    }
    if ((request.method === "POST" || request.method === "PUT" || request.method === "DELETE") && !isSameOriginRequest(request)) {
      return deny(403, "Forbidden.", securityHeaders);
    }
  }

  return response;
}

function deny(status: number, error: string, securityHeaders: Record<string, string>): NextResponse {
  const denied = NextResponse.json({ error }, { status });
  for (const [name, value] of Object.entries(securityHeaders)) {
    denied.headers.set(name, value);
  }
  return denied;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)"],
};
