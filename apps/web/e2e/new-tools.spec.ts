import { expect, test } from "@playwright/test";
import { dismissCookieBanner } from "./helpers";

test("word-unscrambler — groups matches by length with scores", async ({ page }) => {
  await page.goto("/tools/word-unscrambler");
  await dismissCookieBanner(page);
  const letters = page.locator("#wu-letters");
  await expect(letters).toBeVisible({ timeout: 15000 });
  await letters.fill("listen");
  await page.getByRole("button", { name: "Unscramble" }).click();
  await expect(page.locator("main")).toContainText("words found", { timeout: 15000 });
  await expect(page.locator("main")).toContainText("6 letters");
  // Full-rack anagrams and sub-words render as table rows, not one blob.
  for (const word of ["listen", "silent", "enlist", "lens", "nest"]) {
    await expect(page.locator("main td", { hasText: word }).first()).toBeVisible();
  }
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("text-to-speech — player renders with estimate and controls", async ({ page }) => {
  await page.goto("/tools/text-to-speech");
  await dismissCookieBanner(page);
  const text = page.locator("#tts-text");
  await expect(text).toBeVisible({ timeout: 15000 });
  await text.fill("Hello RovoTools");
  await expect(page.locator("main")).toContainText("2 words");
  await expect(page.getByRole("button", { name: "Speak" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("pdf-extract-text — file control accepts a PDF", async ({ page }) => {
  await page.goto("/tools/pdf/pdf-extract-text");
  await dismissCookieBanner(page);
  const fileInput = page.locator('main input[type="file"]').first();
  await expect(fileInput).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "Extract text" })).toBeVisible();
});
