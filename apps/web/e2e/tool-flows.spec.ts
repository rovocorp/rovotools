import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { BROWSER_ONLY_TOOL_IDS, registerCoreTools, toolRegistry } from "@rovotools/tools";
import { BESPOKE_TOOL_SLUGS } from "../src/components/tools/custom/customToolSlugs";
import { ensureFixtureImage, fixturePath } from "./fixtures";
import { dismissCookieBanner } from "./helpers";
import { EXPECTED_SUBSTRINGS, TOOL_SAMPLES } from "./tool-samples";

registerCoreTools(toolRegistry);
const generic = toolRegistry
  .query({})
  .filter((entry) => !BROWSER_ONLY_TOOL_IDS.has(entry.definition.id))
  .filter((entry) => !BESPOKE_TOOL_SLUGS.has(entry.definition.slug));

// Full execute sweep in a real browser: fill every input, submit, and check
// a complete result renders for every generic-runner tool.
for (const entry of generic) {
  const { slug, inputs, outputs } = entry.definition;
  test(`${slug} — executes and renders every output`, async ({ page }) => {
    const sample = TOOL_SAMPLES[slug];
    expect(sample, `missing sample for ${slug}`).toBeDefined();

    await page.goto(`/tools/${slug}`);
    await dismissCookieBanner(page);
    for (const field of inputs) {
      // Field ids are simple alphanumeric slugs — no escaping needed.
      const control = page.locator(`#${field.id}`);
      await expect(control).toBeVisible({ timeout: 15000 });
      if (field.type === "boolean") {
        await control.setChecked((sample[field.id] ?? "") === "true");
      } else if (field.type === "select") {
        await control.selectOption(sample[field.id] ?? "");
      } else {
        await control.fill(sample[field.id] ?? "");
      }
    }

    await page.locator('button[type="submit"]').click();
    const dl = page.locator("dl");
    await expect(dl).toBeVisible({ timeout: 15000 });
    await expect(dl.locator("dd")).toHaveCount(outputs.length);
    for (const expected of EXPECTED_SUBSTRINGS[slug] ?? []) {
      await expect(dl).toContainText(expected);
    }
  });
}

// File-driven custom tools: upload a fixture image and expect real results.
async function uploadFixture(page: Page): Promise<void> {
  await dismissCookieBanner(page);
  const path = ensureFixtureImage(fixturePath());
  const fileInput = page.locator('main input[type="file"]').first();
  await expect(fileInput).toHaveCount(1, { timeout: 15000 });
  await fileInput.setInputFiles(path);
}

test("image-converter — converts an uploaded image", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await uploadFixture(page);
  await expect(page.locator("main").getByText("1 file selected")).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Convert images" }).click();
  await expect(page.getByRole("button", { name: "Download all" })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("image-compressor — compresses an uploaded image", async ({ page }) => {
  await page.goto("/tools/image-compressor");
  await uploadFixture(page);
  await expect(page.locator("main").getByText("1 file selected")).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Compress images" }).click();
  await expect(page.getByRole("button", { name: "Download all" })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("favicon-generator — builds a favicon set from an uploaded image", async ({ page }) => {
  await page.goto("/tools/favicon-generator");
  await uploadFixture(page);
  // Generation starts automatically on file choice.
  await expect(page.getByRole("button", { name: "Download all" })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("color-picker-from-image — samples colors from an uploaded image", async ({ page }) => {
  await page.goto("/tools/color-picker-from-image");
  await uploadFixture(page);
  await expect(page.locator("main").getByText(/fixture-.*\.png/)).toBeVisible({ timeout: 15000 });
  await expect(page.locator("main canvas")).toBeVisible({ timeout: 15000 });
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("image-resizer — resizes an uploaded image", async ({ page }) => {
  await page.goto("/tools/image-resizer");
  await uploadFixture(page);
  await expect(page.locator("main").getByText(/fixture-.*\.png/)).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Resize image" }).click();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("image-cropper — crops an uploaded image", async ({ page }) => {
  await page.goto("/tools/image-cropper");
  await uploadFixture(page);
  await expect(page.locator('main img[alt="Crop source"]')).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Crop image" }).click();
  // Headless canvas crop is slow when workers run in parallel.
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible({ timeout: 60000 });
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

// Bespoke UIs excluded from the generic sweep above: dedicated coverage.
test("adsense-earnings-calculator — estimates earnings from pageviews", async ({ page }) => {
  await page.goto("/tools/adsense-earnings-calculator");
  await dismissCookieBanner(page);
  const pageviews = page.locator("#adsense-pageviews");
  await expect(pageviews).toBeVisible({ timeout: 15000 });
  await pageviews.fill("100000");
  await page.getByRole("button", { name: "Calculate earnings" }).click();
  // 100000 pageviews × 1.5% CTR × $0.25 CPC at the default 1:1 USD rate.
  await expect(page.getByText("Est. monthly earnings")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("main")).toContainText("375");
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("pdf-creator — builds a PDF from typed text", async ({ page }) => {
  await page.goto("/tools/pdf-creator");
  await dismissCookieBanner(page);
  const text = page.locator("#pdf-creator-text");
  await expect(text).toBeVisible({ timeout: 15000 });
  await text.fill("Hello PDF world");
  await page.getByRole("button", { name: "Create PDF" }).click();
  await expect(page.locator("main").getByText("1 page")).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: /Download .*\.pdf/ })).toBeVisible();
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});
