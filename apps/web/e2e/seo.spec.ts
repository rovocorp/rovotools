import { expect, test } from "@playwright/test";

test("home carries brand title, canonical, OG image and theme color", async ({ page }) => {
  await page.goto("/");
  // Head tags are SSR but slow engines under parallel load need headroom.
  await expect(page).toHaveTitle(/RovoTools/, { timeout: 15000 });
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /rovotools\.com\/?$/, { timeout: 15000 });
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-image\.png/, {
    timeout: 15000,
  });
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2, { timeout: 15000 });
});

test("tool pages expose canonical URLs and valid JSON-LD", async ({ page }) => {
  await page.goto("/tools/bmi-calculator");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tools\/bmi-calculator/);
  const ldBlocks = page.locator('script[type="application/ld+json"]');
  expect(await ldBlocks.count()).toBeGreaterThan(0);
  for (let i = 0; i < (await ldBlocks.count()); i += 1) {
    const raw = (await ldBlocks.nth(i).textContent()) ?? "";
    expect(() => JSON.parse(raw), `JSON-LD block ${i} must parse`).not.toThrow();
  }
  const orgName = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
    return blocks.some((block) => (block.textContent ?? "").includes("WebApplication"));
  });
  expect(orgName).toBe(true);
});

test("legacy PDF URLs permanently redirect to nested canonicals", async ({ request, baseURL }) => {
  for (const [from, to] of [
    ["/tools/merge-pdf", "/tools/pdf/merge-pdf"],
    ["/tools/jpg-to-pdf", "/tools/pdf/jpg-to-pdf"],
    ["/tools/emi-calculator", "/tools/loan-calculator"],
  ] as const) {
    const response = await request.get(`${baseURL}${from}`, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(response.headers()["location"]).toBe(to);
  }
});

test("sitemap, robots and ads.txt are served", async ({ request, baseURL }) => {
  const sitemap = await request.get(`${baseURL}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/tools/bmi-calculator");
  const robots = await request.get(`${baseURL}/robots.txt`);
  expect(robots.status()).toBe(200);
  const ads = await request.get(`${baseURL}/ads.txt`);
  expect(ads.status()).toBe(200);
});
