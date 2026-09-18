import { expect, test } from "@playwright/test";
import { dismissCookieBanner } from "./helpers";

test("tax-calculator — region auto-fills an editable rate", async ({ page }) => {
  await page.goto("/tools/tax-calculator");
  await dismissCookieBanner(page);
  const region = page.locator("#region");
  await expect(region).toBeVisible({ timeout: 15000 });
  await region.selectOption("usa-texas");
  await expect(page.locator("#rate")).toHaveValue("6.25", { timeout: 5000 });
  await expect(page.locator("main")).toContainText("Regional standard 6.25%");
  await page.locator("#amount").fill("1000");
  await page.getByRole("button", { name: "Calculate tax" }).click();
  const dl = page.locator("main dl");
  await expect(dl).toBeVisible({ timeout: 15000 });
  await expect(dl).toContainText("6.25% applied for USA, Texas");
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("tax-calculator — stacks custom rows with + and removes them", async ({ page }) => {
  await page.goto("/tools/tax-calculator");
  await dismissCookieBanner(page);
  await expect(page.locator("#region")).toBeVisible({ timeout: 15000 });
  await page.locator("#amount").fill("1000");
  await page.locator("#customRate").fill("10");
  await page.getByRole("button", { name: "Add tax" }).click();
  await page.locator("#extra-name-0").fill("City");
  await page.locator("#extra-rate-0").fill("1.5");
  await page.getByRole("button", { name: "Add tax" }).click();
  await page.locator("#extra-name-1").fill("County");
  await page.locator("#extra-rate-1").fill("0.5");
  await page.getByRole("button", { name: "Calculate tax" }).click();
  const dl = page.locator("main dl");
  await expect(dl).toBeVisible({ timeout: 15000 });
  await expect(dl).toContainText("1120");
  await expect(dl).toContainText("Stacked total: 2%");
  // Removing a row recomputes without it.
  await page.getByRole("button", { name: "Remove extra tax 2" }).click();
  await page.getByRole("button", { name: "Calculate tax" }).click();
  await expect(dl).toContainText("1115");
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test("tax-calculator — guides when nothing is selected", async ({ page }) => {
  await page.goto("/tools/tax-calculator");
  await dismissCookieBanner(page);
  await expect(page.locator("#region")).toBeVisible({ timeout: 15000 });
  await page.locator("#amount").fill("1000");
  await page.getByRole("button", { name: "Calculate tax" }).click();
  await expect(page.locator('main [role="alert"]')).toContainText("Select a region or enter a custom rate.", {
    timeout: 15000,
  });
  await expect(page.locator("main")).toContainText("September 2026");
});
