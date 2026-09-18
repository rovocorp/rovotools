import { expect, test } from "@playwright/test";
import { dismissCookieBanner } from "./helpers";

test("color-picker — picks a color and shows all codes", async ({ page }) => {
  await page.goto("/tools/color-picker");
  await dismissCookieBanner(page);
  const box = page.locator("#color-picker-text");
  await expect(box).toBeVisible({ timeout: 15000 });
  await box.fill("#4f46e5");
  await page.getByRole("button", { name: "Pick color" }).click();
  const dl = page.locator("main dl");
  await expect(dl).toBeVisible({ timeout: 15000 });
  await expect(dl.locator("dd")).toHaveCount(6);
  await expect(dl).toContainText("#4f46e5");
  await expect(dl).toContainText("rgb(79, 70, 229)");
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("color-picker — accepts rgb() input and rejects garbage", async ({ page }) => {
  await page.goto("/tools/color-picker");
  await dismissCookieBanner(page);
  const box = page.locator("#color-picker-text");
  await expect(box).toBeVisible({ timeout: 15000 });
  await box.fill("rgb(79, 70, 229)");
  await page.getByRole("button", { name: "Pick color" }).click();
  await expect(page.locator("main dl")).toContainText("#4f46e5", { timeout: 15000 });
  await box.fill("not-a-color");
  await page.getByRole("button", { name: "Pick color" }).click();
  await expect(page.locator('main [role="alert"]')).toBeVisible({ timeout: 15000 });
});
