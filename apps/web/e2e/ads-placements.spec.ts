import { expect, test } from "@playwright/test";

// Bottom leaderboard units render as confined dev placeholders on tool,
// blog, and home pages (no publisher ID in test env). The right rail is
// desktop-xl only: viewports below 1280px must not render it at all.
for (const path of ["/tools/bmi-calculator", "/blog/bmi-explained", "/"]) {
  test(`bottom unit renders confined on ${path}`, async ({ page }) => {
    await page.goto(path);
    // Exact match: "Ads by Google" is a substring of the rail's
    // "Ads by Google (rail)" label, so a loose match could measure the rail.
    const mocks = page.getByText("Ads by Google", { exact: true });
    await expect(mocks.first()).toBeVisible({ timeout: 15000 });
    expect(await mocks.count()).toBeGreaterThanOrEqual(1);
    const box = await mocks.first().boundingBox();
    expect(box?.height).toBeLessThan(200);
  });
}

test("right rail renders only on wide screens", async ({ page }) => {
  await page.goto("/tools/bmi-calculator");
  const rail = page.locator("aside").filter({ hasText: "Ads by Google (rail)" });
  const width = page.viewportSize()?.width ?? 0;
  if (width < 1280) {
    // Present in DOM for xl, but must never be visible on small screens.
    await expect(rail).toBeHidden({ timeout: 15000 });
    return;
  }
  await expect(rail).toBeVisible({ timeout: 15000 });
  const box = await rail.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(320);
});
