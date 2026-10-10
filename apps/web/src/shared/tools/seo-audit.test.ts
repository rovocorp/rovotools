import { describe, expect, it } from "vitest";

import {
  auditSeo,
  buildUtm,
  checkSerp,
  detectTags,
  estimatePerformance,
  parseMetaTags,
  parseRobotsTxt,
  parseSitemapXml,
  validateSchema,
} from "./seo-audit";

const SAMPLE_HTML = `<!doctype html><html><head>
<title>Example Page Title</title>
<meta name="description" content="A short description.">
<link rel="canonical" href="https://example.com/page">
<meta property="og:title" content="Example Page Title">
<meta property="og:description" content="A short description.">
<meta property="og:image" content="https://example.com/og.png">
<meta name="twitter:card" content="summary">
</head><body>
<h1>Hello</h1>
<img src="a.png" alt="A">
<img src="b.png">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>
</body></html>`;

describe("parseMetaTags", () => {
  it("extracts title, description, canonical and OG set", () => {
    const info = parseMetaTags(SAMPLE_HTML);
    expect(info.title).toBe("Example Page Title");
    expect(info.description).toBe("A short description.");
    expect(info.canonical).toBe("https://example.com/page");
    expect(info.openGraph.get("og:image")).toBe("https://example.com/og.png");
    expect(info.issues).toEqual([]);
  });

  it("flags missing title and description", () => {
    const info = parseMetaTags("<html><head></head><body></body></html>");
    expect(info.title).toBe("");
    expect(info.issues.length).toBeGreaterThan(0);
  });
});

describe("parseRobotsTxt", () => {
  it("parses groups and sitemaps", () => {
    const info = parseRobotsTxt("User-agent: *\nDisallow: /private\n\nSitemap: https://example.com/sitemap.xml\n");
    expect(info.groups).toHaveLength(1);
    expect(info.groups[0]?.disallow).toEqual(["/private"]);
    expect(info.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("warns on site-wide disallow", () => {
    const info = parseRobotsTxt("User-agent: *\nDisallow: /\n");
    expect(info.warnings.some((w) => w.includes('"/"'))).toBe(true);
  });
});

describe("parseSitemapXml", () => {
  it("counts urls and lastmod coverage", () => {
    const xml = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://example.com/a</loc><lastmod>2026-01-01</lastmod></url>
<url><loc>https://example.com/b</loc></url></urlset>`;
    const info = parseSitemapXml(xml);
    expect(info.format).toBe("urlset");
    expect(info.urlCount).toBe(2);
    expect(info.lastmodCoverage).toBe(50);
    expect(info.sampleUrls).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("detects sitemap indexes", () => {
    const info = parseSitemapXml("<sitemapindex><sitemap><loc>https://example.com/s1.xml</loc></sitemap></sitemapindex>");
    expect(info.format).toBe("sitemapindex");
    expect(info.sitemapCount).toBe(1);
  });
});

describe("detectTags", () => {
  it("finds GA4 and reports empties otherwise", () => {
    const tags = detectTags(SAMPLE_HTML);
    expect(tags.googleAnalytics4).toBe("G-ABC123");
    expect(tags.googleTagManager).toBe("");
    expect(tags.metaPixel).toBe("");
  });
});

describe("auditSeo", () => {
  it("scores a healthy page highly", () => {
    const audit = auditSeo(SAMPLE_HTML);
    expect(audit.score).toBeGreaterThanOrEqual(80);
    expect(audit.h1Count).toBe(1);
    expect(audit.imagesMissingAlt).toBe(1);
    expect(audit.openGraphComplete).toBe("yes");
  });
});

describe("estimatePerformance", () => {
  it("measures weight and flags heavy pages", () => {
    const perf = estimatePerformance(`${"<p>x</p>".repeat(20000)}<img src="a.png">`);
    expect(perf.weightKb).toBeGreaterThan(100);
    expect(perf.missingDimensions).toBe(1);
    expect(perf.hints.length).toBeGreaterThan(0);
  });
});

describe("buildUtm", () => {
  it("appends params preserving the hash", () => {
    const result = buildUtm("https://example.com/page?x=1#top", {
      source: "newsletter",
      medium: "email",
      campaign: "launch",
    });
    expect(result.url).toBe("https://example.com/page?x=1&utm_source=newsletter&utm_medium=email&utm_campaign=launch#top");
    expect(result.warnings).toBe("—");
  });

  it("rejects non-http URLs", () => {
    expect(() => buildUtm("ftp://example.com", { source: "a", medium: "b", campaign: "c" })).toThrow(RangeError);
  });
});

describe("checkSerp", () => {
  it("flags long titles and builds a preview", () => {
    const check = checkSerp("x".repeat(70), "https://example.com", "short");
    expect(check.titleStatus).toContain("too long");
    expect(check.descriptionStatus).toBe("good");
    expect(check.preview).toContain("https://example.com");
  });
});

describe("validateSchema", () => {
  it("accepts valid JSON-LD", () => {
    const check = validateSchema('{"@context":"https://schema.org","@type":"Article","headline":"Hi"}');
    expect(check.valid).toBe("true");
    expect(check.types).toBe("Article");
  });

  it("rejects broken JSON without throwing", () => {
    const check = validateSchema("{nope");
    expect(check.valid).toBe("false");
    expect(check.types).toBe("—");
  });
});
