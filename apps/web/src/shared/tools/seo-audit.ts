/**
 * Pure SEO-audit helpers shared by the analyzer tools.
 * Everything here works on pasted markup (HTML, robots.txt, XML, JSON-LD)
 * with zero network access, so catalog `execute()` stays offline-capable
 * and unit-testable. Live-URL fetching is a UI-layer concern that feeds
 * its result into these functions — see `apps/web/.../api/fetch-page`.
 */

export interface MetaTagInfo {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly robots: string;
  readonly openGraph: ReadonlyMap<string, string>;
  readonly twitter: ReadonlyMap<string, string>;
  readonly issues: ReadonlyArray<string>;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

/** All attribute pairs of a tag, lower-cased names, entities decoded. */
function tagAttributes(tag: string): Map<string, string> {
  const attrs = new Map<string, string>();
  const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match: RegExpExecArray | null;
  // Skip index 0 (the tag name itself).
  let first = true;
  while ((match = re.exec(tag)) !== null) {
    if (first) {
      first = false;
      continue;
    }
    const name = (match[1] ?? "").toLowerCase();
    const value = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
    if (name !== "" && !attrs.has(name)) {
      attrs.set(name, value);
    }
  }
  return attrs;
}

function findMetaTags(html: string): Array<Map<string, string>> {
  const out: Array<Map<string, string>> = [];
  const re = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    out.push(tagAttributes(match[0]));
  }
  return out;
}

function metaContent(metas: ReadonlyArray<Map<string, string>>, key: string): string {
  for (const meta of metas) {
    const name = (meta.get("name") ?? meta.get("property") ?? meta.get("itemprop") ?? "").toLowerCase();
    if (name === key) {
      return meta.get("content") ?? "";
    }
  }
  return "";
}

function extractTitle(html: string): string {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html);
  return decodeEntities((match?.[1] ?? "").replace(/\s+/g, " ").trim());
}

function extractCanonical(html: string): string {
  const re = /<link\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const attrs = tagAttributes(match[0]);
    if ((attrs.get("rel") ?? "").toLowerCase() === "canonical") {
      return attrs.get("href") ?? "";
    }
  }
  return "";
}

export function parseMetaTags(html: string): MetaTagInfo {
  const metas = findMetaTags(html);
  const title = extractTitle(html);
  const description = metaContent(metas, "description");
  const canonical = extractCanonical(html);
  const robots = metaContent(metas, "robots");
  const openGraph = new Map<string, string>();
  const twitter = new Map<string, string>();
  for (const meta of metas) {
    const property = (meta.get("property") ?? "").toLowerCase();
    const name = (meta.get("name") ?? "").toLowerCase();
    const content = meta.get("content") ?? "";
    if (property.startsWith("og:") && content !== "") {
      openGraph.set(property, content);
    } else if ((name.startsWith("twitter:") || property.startsWith("twitter:")) && content !== "") {
      twitter.set(name.startsWith("twitter:") ? name : property, content);
    }
  }
  const issues: Array<string> = [];
  if (title === "") {
    issues.push("Missing <title> — every page needs one.");
  } else if (title.length > 60) {
    issues.push(`Title is ${title.length} characters — over ~60 may truncate in search results.`);
  }
  if (description === "") {
    issues.push("Missing meta description — search engines will invent a snippet for you.");
  } else if (description.length > 160) {
    issues.push(`Meta description is ${description.length} characters — over ~160 may truncate.`);
  }
  if (canonical === "") {
    issues.push("No canonical link — add one to name the preferred URL.");
  }
  if (!openGraph.has("og:title") || !openGraph.has("og:description") || !openGraph.has("og:image")) {
    issues.push("Incomplete Open Graph set — og:title, og:description and og:image are the core trio.");
  }
  return { title, description, canonical, robots, openGraph, twitter, issues };
}

export interface RobotsGroup {
  readonly agents: ReadonlyArray<string>;
  readonly allow: ReadonlyArray<string>;
  readonly disallow: ReadonlyArray<string>;
}

export interface RobotsInfo {
  readonly groups: ReadonlyArray<RobotsGroup>;
  readonly sitemaps: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}

export function parseRobotsTxt(content: string): RobotsInfo {
  const groups: Array<{ agents: Array<string>; allow: Array<string>; disallow: Array<string> }> = [];
  const sitemaps: Array<string> = [];
  const warnings: Array<string> = [];
  let current: { agents: Array<string>; allow: Array<string>; disallow: Array<string> } | null = null;
  let sawRuleBeforeAgent = false;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    if (line === "") {
      continue;
    }
    const colon = line.indexOf(":");
    if (colon === -1) {
      warnings.push(`Skipping malformed line (no colon): "${rawLine.trim().slice(0, 60)}"`);
      continue;
    }
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (field === "user-agent") {
      if (current !== null && (current.allow.length > 0 || current.disallow.length > 0)) {
        groups.push(current);
        current = null;
      }
      if (current === null) {
        current = { agents: [], allow: [], disallow: [] };
      }
      current.agents.push(value === "" ? "*" : value);
    } else if (field === "allow" || field === "disallow") {
      if (current === null) {
        sawRuleBeforeAgent = true;
        current = { agents: ["*"], allow: [], disallow: [] };
      }
      if (field === "allow") {
        current.allow.push(value);
      } else {
        current.disallow.push(value);
      }
      if (value === "" && field === "allow") {
        warnings.push("Empty Allow rule allows nothing — it is a no-op.");
      }
    } else if (field === "sitemap") {
      if (value === "") {
        warnings.push("Empty Sitemap line — crawlers will ignore it.");
      } else {
        sitemaps.push(value);
      }
    } else {
      warnings.push(`Unknown directive "${field}" — crawlers may ignore it.`);
    }
  }
  if (current !== null) {
    groups.push(current);
  }
  if (sawRuleBeforeAgent) {
    warnings.push("Rule appeared before any User-agent line — it was assigned to a wildcard (*) group.");
  }
  if (groups.length === 0) {
    warnings.push("No User-agent groups found — this file controls nothing.");
  }
  for (const group of groups) {
    if (group.disallow.includes("/")) {
      warnings.push(`Group [${group.agents.join(", ")}] disallows "/" — the whole site is hidden from those crawlers.`);
    }
  }
  if (sitemaps.length === 0) {
    warnings.push("No Sitemap line — consider pointing crawlers at your XML sitemap.");
  }
  return { groups, sitemaps, warnings };
}

export type SitemapFormat = "urlset" | "sitemapindex" | "unknown";

export interface SitemapInfo {
  readonly format: SitemapFormat;
  readonly urlCount: number;
  readonly sitemapCount: number;
  readonly lastmodCoverage: number;
  readonly sampleUrls: ReadonlyArray<string>;
  readonly issues: ReadonlyArray<string>;
}

function extractLocs(xml: string, tag: string): Array<string> {
  const out: Array<string> = [];
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const loc = /<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/i.exec(match[1] ?? "");
    if (loc?.[1] !== undefined) {
      out.push(decodeEntities(loc[1].trim()));
    }
  }
  return out;
}

export function parseSitemapXml(xml: string): SitemapInfo {
  const issues: Array<string> = [];
  const trimmed = xml.trim();
  if (!/^<\?xml/i.test(trimmed) && !/<urlset|<\s*sitemapindex/i.test(trimmed)) {
    issues.push("Does not look like XML — expected an XML declaration, <urlset> or <sitemapindex>.");
  }
  const isIndex = /<\s*sitemapindex[\s>]/i.test(xml);
  const isUrlset = /<\s*urlset[\s>]/i.test(xml);
  if (isIndex && isUrlset) {
    issues.push("Contains both <sitemapindex> and <urlset> — a sitemap must be one or the other.");
  }
  const format: SitemapFormat = isIndex ? "sitemapindex" : isUrlset ? "urlset" : "unknown";
  const urls = extractLocs(xml, "url");
  const sitemaps = extractLocs(xml, "sitemap");
  const lastmodCount = (xml.match(/<\s*lastmod\b/gi) ?? []).length;
  const urlCount = urls.length;
  const lastmodCoverage = urlCount === 0 ? 0 : Math.min(100, Math.round((lastmodCount / urlCount) * 100));
  if (format === "unknown") {
    issues.push("No <urlset> or <sitemapindex> root found.");
  }
  if (format === "urlset" && urlCount === 0) {
    issues.push("No <url><loc> entries found — crawlers will discover nothing here.");
  }
  if (format === "urlset" && urlCount > 50000) {
    issues.push(`${urlCount.toLocaleString("en-US")} URLs exceeds the 50,000-per-sitemap protocol limit — split it.`);
  }
  if (format === "sitemapindex" && sitemaps.length === 0) {
    issues.push("Sitemap index has no <sitemap><loc> entries.");
  }
  if (format === "urlset" && urlCount > 0 && lastmodCoverage < 100) {
    issues.push(`Only ${lastmodCoverage}% of URLs carry <lastmod> — dates help crawlers prioritize.`);
  }
  return {
    format,
    urlCount,
    sitemapCount: sitemaps.length,
    lastmodCoverage,
    sampleUrls: (format === "sitemapindex" ? sitemaps : urls).slice(0, 5),
    issues,
  };
}

export interface DetectedTags {
  readonly googleAnalytics4: string;
  readonly googleTagManager: string;
  readonly metaPixel: string;
  readonly tiktokPixel: string;
  readonly linkedinInsight: string;
  readonly others: ReadonlyArray<string>;
}

export function detectTags(html: string): DetectedTags {
  const ga = /G-[A-Z0-9]{6,}/.exec(html)?.[0] ?? (/googletagmanager\.com\/g\/js\?id=(G-[A-Z0-9]+)/.exec(html)?.[1] ?? "");
  const gtm = /GTM-[A-Z0-9]+/.exec(html)?.[0] ?? "";
  const fb = /connect\.facebook\.net\/[^"'\s]*fbevents\.js/.test(html) || /fbq\s*\(\s*['"]init['"]\s*,\s*['"]?(\d{6,})['"]?/.test(html);
  const tiktok = /analytics\.tiktok\.com\/i18n\/pixel/.test(html) || /ttq\.load\s*\(\s*['"]([A-Z0-9]+)['"]/.test(html);
  const linkedin = /snap\.licdn\.com\/insight/.test(html);
  const others: Array<string> = [];
  if (/hotjar\.com/i.test(html)) {
    others.push("Hotjar");
  }
  if (/clarity\.ms/i.test(html)) {
    others.push("Microsoft Clarity");
  }
  if (/plausible\.io/i.test(html)) {
    others.push("Plausible");
  }
  if (/cdn\.segment\.com/i.test(html)) {
    others.push("Segment");
  }
  if (/fullstory\.com/i.test(html)) {
    others.push("FullStory");
  }
  return {
    googleAnalytics4: ga,
    googleTagManager: gtm,
    metaPixel: fb ? "detected" : "",
    tiktokPixel: tiktok ? "detected" : "",
    linkedinInsight: linkedin ? "detected" : "",
    others,
  };
}

export interface SeoAudit {
  readonly score: number;
  readonly title: string;
  readonly titleStatus: string;
  readonly description: string;
  readonly descriptionStatus: string;
  readonly h1Count: number;
  readonly h1Status: string;
  readonly imagesTotal: number;
  readonly imagesMissingAlt: number;
  readonly canonical: string;
  readonly robotsMeta: string;
  readonly openGraphComplete: string;
  readonly issues: ReadonlyArray<string>;
}

function countTag(html: string, tag: string): number {
  return (html.match(new RegExp(`<\\s*${tag}(?=[\\s>/])`, "gi")) ?? []).length;
}

export function auditSeo(html: string): SeoAudit {
  const meta = parseMetaTags(html);
  const issues = [...meta.issues];
  const h1Count = countTag(html, "h1");
  if (h1Count === 0) {
    issues.push("No <h1> found — every page should have exactly one top-level heading.");
  } else if (h1Count > 1) {
    issues.push(`${h1Count} <h1> tags found — use one <h1> per page and <h2> for sections.`);
  }
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imgTags.filter((tag) => !/\salt\s*=/i.test(tag)).length;
  if (missingAlt > 0) {
    issues.push(`${missingAlt} of ${imgTags.length} images lack alt text — hurting accessibility and image search.`);
  }
  const passed = 6 - Math.min(6, issues.length);
  const score = Math.round((passed / 6) * 100);
  return {
    score,
    title: meta.title === "" ? "—" : meta.title,
    titleStatus: meta.title === "" ? "missing" : meta.title.length > 60 ? "too long" : "good",
    description: meta.description === "" ? "—" : meta.description,
    descriptionStatus: meta.description === "" ? "missing" : meta.description.length > 160 ? "too long" : "good",
    h1Count,
    h1Status: h1Count === 1 ? "good" : "needs attention",
    imagesTotal: imgTags.length,
    imagesMissingAlt: missingAlt,
    canonical: meta.canonical === "" ? "—" : meta.canonical,
    robotsMeta: meta.robots === "" ? "—" : meta.robots,
    openGraphComplete:
      meta.openGraph.has("og:title") && meta.openGraph.has("og:description") && meta.openGraph.has("og:image")
        ? "yes"
        : "no",
    issues: issues.length === 0 ? ["No issues found — solid on-page basics."] : issues,
  };
}

export interface PerfHints {
  readonly weightKb: number;
  readonly scripts: number;
  readonly stylesheets: number;
  readonly images: number;
  readonly missingDimensions: number;
  readonly hints: ReadonlyArray<string>;
}

export function estimatePerformance(html: string): PerfHints {
  const weightKb = Math.round((new TextEncoder().encode(html).length / 1024) * 10) / 10;
  const scripts = (html.match(/<script\b/gi) ?? []).length;
  const stylesheets = (html.match(/<link\b[^>]*rel\s*=\s*["']?stylesheet/gi) ?? []).length;
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingDimensions = imgTags.filter(
    (tag) => !/\swidth\s*=/i.test(tag) || !/\sheight\s*=/i.test(tag),
  ).length;
  const hints: Array<string> = [];
  if (weightKb > 200) {
    hints.push(`HTML alone is ~${weightKb} KB — over ~200 KB of markup slows first paint; move content out of inline scripts.`);
  }
  if (scripts > 10) {
    hints.push(`${scripts} <script> tags — each parser-blocking script delays rendering; defer or async non-critical ones.`);
  }
  if (stylesheets > 4) {
    hints.push(`${stylesheets} stylesheets — every CSS file blocks rendering until loaded; consolidate where possible.`);
  }
  if (missingDimensions > 0) {
    hints.push(`${missingDimensions} images lack width/height — missing dimensions cause layout shift (CLS).`);
  }
  if (hints.length === 0) {
    hints.push("HTML weight and tag counts look lean. Real-world speed still needs lab data (e.g. PageSpeed Insights) — these are static hints, not measured timings.");
  } else {
    hints.push("Note: these are static HTML hints, not measured timings — confirm with PageSpeed Insights for lab + field data.");
  }
  return { weightKb, scripts, stylesheets, images: imgTags.length, missingDimensions, hints };
}

export interface UtmResult {
  readonly url: string;
  readonly warnings: string;
}

export function buildUtm(
  baseUrl: string,
  params: { source: string; medium: string; campaign: string; term?: string; content?: string },
): UtmResult {
  let url: URL;
  try {
    url = new URL(baseUrl.trim());
  } catch {
    throw new RangeError("Enter a valid base URL starting with http:// or https://.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RangeError("Base URL must start with http:// or https://.");
  }
  const warnings: Array<string> = [];
  const set = (key: string, value: string | undefined, label: string): void => {
    if (value === undefined || value.trim() === "") {
      return;
    }
    if (/\s/.test(value)) {
      warnings.push(`${label} contains spaces — they will be encoded as %20.`);
    }
    url.searchParams.set(key, value.trim());
  };
  set("utm_source", params.source, "Source");
  set("utm_medium", params.medium, "Medium");
  set("utm_campaign", params.campaign, "Campaign");
  set("utm_term", params.term, "Term");
  set("utm_content", params.content, "Content");
  return { url: url.toString(), warnings: warnings.length === 0 ? "—" : warnings.join(" ") };
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

export interface SerpCheck {
  readonly titleStatus: string;
  readonly descriptionStatus: string;
  readonly preview: string;
}

export function checkSerp(title: string, pageUrl: string, description: string): SerpCheck {
  const titleStatus =
    title.length === 0 ? "missing" : title.length <= TITLE_LIMIT ? "good" : `too long (${title.length}/${TITLE_LIMIT})`;
  const descriptionStatus =
    description.length === 0
      ? "missing"
      : description.length <= DESCRIPTION_LIMIT
        ? "good"
        : `too long (${description.length}/${DESCRIPTION_LIMIT})`;
  const preview = `${title === "" ? "(no title)" : title}\n${pageUrl}\n${description === "" ? "(no description — Google will invent one)" : description}`;
  return { titleStatus, descriptionStatus, preview };
}

export interface SchemaCheck {
  readonly valid: string;
  readonly types: string;
  readonly detail: string;
}

export function validateSchema(markup: string): SchemaCheck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(markup);
  } catch (e) {
    return { valid: "false", types: "—", detail: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` };
  }
  const nodes: Array<unknown> = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && "@graph" in parsed && Array.isArray((parsed as Record<string, unknown>)["@graph"])
      ? (parsed as { "@graph": Array<unknown> })["@graph"]
      : [parsed];
  const types: Array<string> = [];
  const problems: Array<string> = [];
  for (const node of nodes) {
    if (typeof node !== "object" || node === null) {
      problems.push("Top-level entries must be JSON objects.");
      continue;
    }
    const record = node as Record<string, unknown>;
    const type = record["@type"];
    if (typeof type !== "string" || type === "") {
      problems.push("An object is missing @type.");
    } else {
      types.push(type);
    }
    if (!("@context" in record) && nodes.length === 1 && !Array.isArray(parsed)) {
      problems.push("Missing @context — use \"https://schema.org\".");
    }
  }
  if (types.length === 0 && problems.length === 0) {
    problems.push("No typed objects found.");
  }
  return {
    valid: problems.length === 0 ? "true" : "false",
    types: types.length === 0 ? "—" : [...new Set(types)].join(", "),
    detail: problems.length === 0 ? "Valid JSON-LD with @context and @type present." : problems.join(" "),
  };
}
