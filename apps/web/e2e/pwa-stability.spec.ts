import { expect, test } from "@playwright/test";

// Regression test for the first-visit auto-reload: the service worker used
// to claim clients on first install and PWARegister reloaded the page,
// wiping whatever the user had just typed into a tool.
test("typing survives service worker install (no auto-reload)", async ({ page }) => {
  await page.goto("/tools/bmi-calculator");
  const input = page.locator("main form #weightKg");
  await expect(input).toBeVisible({ timeout: 15000 });
  await input.fill("75");

  // Wait past the SW install + claim window.
  await page.waitForTimeout(12000);

  await expect(input).toHaveValue("75");
  const navType = await page.evaluate(
    () => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type,
  );
  expect(navType).toBe("navigate");
});
