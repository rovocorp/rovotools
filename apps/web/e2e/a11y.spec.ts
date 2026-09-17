import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Wait until the theme stylesheets have settled. Pages paint `main` before
 * the 110 KB stylesheet + theme class fully apply; auditing in that window
 * measures unstyled fallbacks (phantom contrast failures). This probes a
 * themed surface token for the expected themed value.
 */
async function waitForThemeSettled(page: Page, theme: "light" | "dark"): Promise<void> {
  await page.locator("main").waitFor({ timeout: 15000 });
  await page.waitForFunction(
    (expected) => {
      const probe = document.createElement("div");
      probe.className = "bg-card";
      probe.style.display = "none";
      document.body.appendChild(probe);
      const bg = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return bg === expected;
    },
    theme === "dark" ? "rgb(17, 17, 20)" : "rgb(255, 255, 255)",
    { timeout: 15000 },
  );
}

// One URL per route template (server pages, generic runner, bespoke UIs,
// nested PDF pages, blog, forms, legal, offline shell, 404).
const TEMPLATES = [
  "/",
  "/tools",
  "/tools/category/pdf",
  "/tools/bmi-calculator",
  "/tools/adsense-earnings-calculator",
  "/tools/pdf-creator",
  "/tools/pdf/merge-pdf",
  "/tools/image-converter",
  "/blog",
  "/blog/bmi-explained",
  "/contact",
  "/about",
  "/privacy",
  "/offline",
  "/tools/no-such-tool",
];

for (const theme of ["light", "dark"] as const) {
  for (const path of TEMPLATES) {
    test(`${theme} › ${path} has no serious accessibility violations`, async ({ page }) => {
      if (theme === "dark") {
        await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
      }
      await page.goto(path);
      // Stylesheets stream in: `main` attaches before they finish parsing,
      // and auditing mid-stream measures half-applied themes (phantom
      // blended colors). The load event waits for render-blocking styles.
      await page.waitForLoadState("load", { timeout: 30000 }).catch(() => undefined);
      // Let the client-side runner hydrate and theme styles settle.
      await waitForThemeSettled(page, theme);
      // Fonts/images decoding under parallel load shift computed colors;
      // audit only fully settled UI.
      await page.evaluate(() => document.fonts.ready).catch(() => undefined);
      await page.waitForTimeout(1000);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
      expect(
        blocking,
        JSON.stringify(
          blocking.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.length,
            help: violation.helpUrl,
          })),
          null,
          2,
        ),
      ).toEqual([]);
    });
  }
}

test("command palette dialog has no serious violations when open", async ({ page }) => {
  await page.goto("/");
  await page.locator("main").waitFor({ timeout: 15000 });
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Search tools" })).toBeVisible({ timeout: 5000 });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking).toEqual([]);
});

test("cookie banner dialog has no serious violations", async ({ page }) => {
  await page.goto("/");
  const banner = page.locator("#cookie-banner");
  await expect(banner).toBeVisible({ timeout: 15000 });
  const results = await new AxeBuilder({ page })
    .include("#cookie-banner")
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking).toEqual([]);
});
