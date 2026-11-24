import { NextResponse, type NextRequest } from "next/server";

const SITE_URL = (process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://rovotools.com").replace(/\/+$/, "");

// RFC 8288 Link header advertising the agent-facing resources for the homepage.
const HOME_LINKS = [
  `<${SITE_URL}/llms.txt>; rel="llms"`,
  `<${SITE_URL}/home.md>; rel="alternate"; type="text/markdown"`,
].join(", ");

export function middleware(request: NextRequest): NextResponse {
  const accept = request.headers.get("accept") ?? "";
  const wantsMarkdown = accept.includes("text/markdown");

  // Content negotiation: agents that ask for Markdown get the /home.md
  // representation instead of the HTML page, while the URL stays "/".
  const response = wantsMarkdown
    ? NextResponse.rewrite(new URL("/home.md", request.url))
    : NextResponse.next();

  response.headers.set("Link", HOME_LINKS);
  // The response varies by Accept, so caches must key on it.
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = {
  matcher: ["/"],
};
