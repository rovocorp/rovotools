import { expect, test } from "@playwright/test";

// Ad slots render per environment: grey "Ads by Google" dev placeholders
// without a publisher ID, neutral "Advertisement" reserved boxes (or real
// units after consent) in production builds. Either way the slot must stay
// confined to its own box and never cover the viewport. The right rail is
// desktop-xl only: viewports below 1280px must not render it at all.
const AD_LABEL = /Ads by Google|Advertisement/;
const AD_SECTION = 'section[aria-label="Advertisement"]';

for (const path of ["/tools/bmi-calculator", "/blog/bmi-explained", "/"]) {
  test(`bottom unit renders confined on ${path}`, async ({ page }) => {
    await page.goto(path);
    const slot = page.locator(AD_SECTION).first();
    await expect(slot).toBeVisible({ timeout: 15000 });
    const box = await slot.boundingBox();
    expect(box?.height).toBeLessThan(300);
    // Every ad label inside the slot must be slot-sized too: an overlay
    // escaping to the viewport (the old blocked-inputs bug) fails here.
    const labels = slot.getByText(AD_LABEL);
    expect(await labels.count()).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < (await labels.count()); i += 1) {
      const labelBox = await labels.nth(i).boundingBox();
      expect(labelBox?.height).toBeLessThan(300);
    }
  });
}

test("right rail renders only on wide screens", async ({ page }) => {
  await page.goto("/tools/bmi-calculator");
  const rail = page
    .locator("aside")
    .filter({ has: page.locator(AD_SECTION) });
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
