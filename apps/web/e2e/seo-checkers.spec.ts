import { expect, test } from "@playwright/test";
import { dismissCookieBanner } from "./helpers";

const SAMPLE_HTML = [
  "<!doctype html><html><head>",
  "<title>Example Page Title</title>",
  '<meta name="description" content="A short description.">',
  '<link rel="canonical" href="https://example.com/page">',
  '<meta property="og:title" content="Example Page Title">',
  '<meta property="og:description" content="A short description.">',
  '<meta property="og:image" content="https://example.com/og.png">',
  "</head><body><h1>Hello</h1>",
  '<img src="a.png" alt="A">',
  "</body></html>",
].join("\n");

const SAMPLE_XML = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  "<url><loc>https://example.com/a</loc><lastmod>2026-01-01</lastmod></url>",
  "<url><loc>https://example.com/b</loc></url>",
  "</urlset>",
].join("\n");

// Bespoke fetch-analyzer UIs: paste mode analyzes purely client-side;
// the Fetch button posts to /api/fetch-page and fills the textarea.
const PASTE_CASES: Array<{ slug: string; field: string; sample: string; action: string; outputs: number }> = [
  { slug: "seo-checker", field: "html", sample: SAMPLE_HTML, action: "Audit page", outputs: 8 },
  { slug: "open-graph-checker", field: "html", sample: SAMPLE_HTML, action: "Check tags", outputs: 7 },
  { slug: "sitemap-checker", field: "xml", sample: SAMPLE_XML, action: "Check sitemap", outputs: 6 },
  { slug: "tag-detector", field: "html", sample: SAMPLE_HTML, action: "Detect tags", outputs: 6 },
  { slug: "performance-analyzer", field: "html", sample: SAMPLE_HTML, action: "Analyze weight", outputs: 6 },
];

for (const { slug, field, sample, action, outputs } of PASTE_CASES) {
  test(`${slug} — analyzes pasted markup`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    await dismissCookieBanner(page);
    const box = page.locator(`#${field}`);
    await expect(box).toBeVisible({ timeout: 15000 });
    await box.fill(sample);
    await page.getByRole("button", { name: action }).click();
    const dl = page.locator("main dl");
    await expect(dl).toBeVisible({ timeout: 15000 });
    await expect(dl.locator("dd")).toHaveCount(outputs);
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);
  });
}

test("seo-checker — shows a validation error on empty input", async ({ page }) => {
  await page.goto("/tools/seo-checker");
  await dismissCookieBanner(page);
  await expect(page.locator("#html")).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Audit page" }).click();
  await expect(page.locator('main [role="alert"]')).toBeVisible({ timeout: 15000 });
});

test("open-graph-checker — Fetch page fills the textarea from the API", async ({ page }) => {
  await page.route("**/api/fetch-page", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        status: 200,
        finalUrl: "https://example.com/page",
        contentType: "text/html",
        truncated: false,
        html: SAMPLE_HTML,
      }),
    }),
  );
  await page.goto("/tools/open-graph-checker");
  await dismissCookieBanner(page);
  await expect(page.locator("#html")).toBeVisible({ timeout: 15000 });
  await page.locator("#open-graph-checker-url").fill("https://example.com/page");
  await page.getByRole("button", { name: "Fetch page" }).click();
  await expect(page.locator("#html")).toHaveValue(SAMPLE_HTML, { timeout: 15000 });
  await page.getByRole("button", { name: "Check tags" }).click();
  const dl = page.locator("main dl");
  await expect(dl).toBeVisible({ timeout: 15000 });
  await expect(dl).toContainText("og.png");
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("tag-detector — surfaces a fetch failure without crashing", async ({ page }) => {
  await page.route("**/api/fetch-page", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: "That host resolves to a private address." }),
    }),
  );
  await page.goto("/tools/tag-detector");
  await dismissCookieBanner(page);
  await expect(page.locator("#html")).toBeVisible({ timeout: 15000 });
  await page.locator("#tag-detector-url").fill("http://127.0.0.1/");
  await page.getByRole("button", { name: "Fetch page" }).click();
  await expect(page.locator('main [role="alert"]')).toContainText("private address", { timeout: 15000 });
});
