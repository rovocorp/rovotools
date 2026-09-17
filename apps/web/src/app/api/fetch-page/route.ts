import { lookup } from "node:dns/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isBlockedAddress,
  isBlockedHostname,
  isSupportedContentType,
  parseTargetUrl,
} from "@/lib/fetch-guard";

export const runtime = "nodejs";

const MAX_REDIRECTS = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

const requestSchema = z.object({
  url: z.string().max(2000),
});

function badRequest(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
}

function forbidden(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 403 });
}

/** Resolve a hostname and reject when it points at non-public space. */
async function assertPublicHost(hostname: string): Promise<string | null> {
  const clean = hostname.trim().toLowerCase();
  if (isBlockedHostname(clean)) {
    return "That host is not publicly reachable.";
  }
  let addresses;
  try {
    addresses = await lookup(clean, { all: true });
  } catch {
    return "Could not resolve that host.";
  }
  if (addresses.length === 0) {
    return "Could not resolve that host.";
  }
  if (addresses.some((entry) => isBlockedAddress(entry.address))) {
    return "That host resolves to a private address.";
  }
  return null;
}

interface FetchedPage {
  readonly status: number;
  readonly finalUrl: string;
  readonly contentType: string;
  readonly truncated: boolean;
  readonly html: string;
}

async function fetchPage(startUrl: URL): Promise<FetchedPage> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const blocked = await assertPublicHost(current.hostname);
    if (blocked !== null) {
      throw Object.assign(new Error(blocked), { status: 403 });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "RovoToolsBot/1.0 (+https://rovotools.com)",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8",
        },
      });
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === "AbortError") {
        throw Object.assign(new Error("The page took too long to respond (10s limit)."), { status: 502 });
      }
      throw Object.assign(new Error("Could not reach that page."), { status: 502 });
    } finally {
      clearTimeout(timer);
    }
    if (response.status >= 300 && response.status < 400) {
      if (hop === MAX_REDIRECTS) {
        throw Object.assign(new Error("Too many redirects."), { status: 502 });
      }
      const location = response.headers.get("location");
      await response.body?.cancel().catch(() => undefined);
      if (location === null) {
        throw Object.assign(new Error("Redirect with no destination."), { status: 502 });
      }
      try {
        current = new URL(location, current);
      } catch {
        throw Object.assign(new Error("Redirect points somewhere invalid."), { status: 502 });
      }
      if (current.protocol !== "http:" && current.protocol !== "https:") {
        throw Object.assign(new Error("Redirect leaves the public web."), { status: 403 });
      }
      continue;
    }
    if (response.status < 200 || response.status >= 300) {
      await response.body?.cancel().catch(() => undefined);
      throw Object.assign(new Error(`The page answered with status ${response.status}.`), { status: 502 });
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!isSupportedContentType(contentType)) {
      await response.body?.cancel().catch(() => undefined);
      throw Object.assign(new Error("Only HTML, XML and text pages can be analysed."), { status: 400 });
    }
    const reader = response.body?.getReader();
    if (reader === undefined) {
      throw Object.assign(new Error("Empty response from that page."), { status: 502 });
    }
    const chunks: Array<Uint8Array> = [];
    let received = 0;
    let truncated = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value !== undefined) {
        received += value.byteLength;
        if (received > MAX_BYTES) {
          truncated = true;
          await reader.cancel().catch(() => undefined);
          break;
        }
        chunks.push(value);
      }
    }
    const bytes = new Uint8Array(received > MAX_BYTES ? MAX_BYTES : received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk.subarray(0, Math.min(chunk.byteLength, bytes.byteLength - offset)), offset);
      offset += Math.min(chunk.byteLength, bytes.byteLength - offset);
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { status: response.status, finalUrl: current.toString(), contentType, truncated, html };
  }
  throw Object.assign(new Error("Too many redirects."), { status: 502 });
}

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Provide a page URL up to 2000 characters.");
  }
  let target: URL;
  try {
    target = parseTargetUrl(parsed.data.url);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Enter a valid page URL.");
  }
  try {
    const page = await fetchPage(target);
    return NextResponse.json({ ok: true, ...page });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === "number" ? (error as { status: number }).status : 502;
    const message = error instanceof Error ? error.message : "Could not fetch that page.";
    if (status === 403) {
      return forbidden(message);
    }
    if (status === 400) {
      return badRequest(message);
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
