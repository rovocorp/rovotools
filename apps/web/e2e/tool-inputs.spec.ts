import { expect, test } from "@playwright/test";
import { registerCoreTools, toolRegistry } from "@rovotools/tools";
import { ensureFixtureImage, fixturePath } from "./fixtures";

registerCoreTools(toolRegistry);
const slugs = toolRegistry.query({}).map((entry) => entry.definition.slug);

// Regression sweep for the blocked-inputs bug: on every tool page the first
// control must be clickable/typeable (an overlay covering the viewport makes
// Playwright click/type into the void and these assertions fail).
for (const slug of slugs) {
  test(`${slug} — first control accepts input`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);

    // Scope to the tool form: the page also contains a feedback comment box
    // that renders before the client-side runner hydrates.
    const visibleControl = page
      .locator('main form :is(input:not([type="file"]), textarea, select)')
      .filter({ visible: true })
      .first();
    const fileControl = page.locator('main input[type="file"]').first();

    if ((await visibleControl.count()) > 0) {
      await expect(visibleControl).toBeVisible({ timeout: 15000 });
      const kind = await visibleControl.evaluate((el) => ({
        tag: el.tagName.toLowerCase(),
        type: (el as HTMLInputElement).type,
      }));
      if (kind.tag === "select") {
        await visibleControl.selectOption({ index: 1 });
        await expect(visibleControl).not.toHaveValue("");
      } else if (kind.type === "checkbox") {
        await visibleControl.check();
        await expect(visibleControl).toBeChecked();
      } else if (kind.type === "range") {
        await visibleControl.fill("50");
        await expect(visibleControl).toHaveValue("50");
      } else {
        await visibleControl.click();
        await visibleControl.fill("hello 123");
        await expect(visibleControl).toHaveValue("hello 123");
      }
      return;
    }

    // No visible text control: must be a file-driven custom tool.
    await expect(fileControl).toHaveCount(1, { timeout: 15000 });
    const path = ensureFixtureImage(fixturePath());
    await fileControl.setInputFiles(path);
    expect(
      await fileControl.evaluate((el: HTMLInputElement) => el.files?.length ?? 0),
    ).toBe(1);
  });
}

test("dev ad placeholder is confined to its slot", async ({ page }) => {
  await page.goto("/tools/bmi-calculator");
  const label = page.getByText("Ads by Google (dev mock)");
  await expect(label).toBeVisible();
  const box = await label.boundingBox();
  // With the overlay bug this box is viewport-sized (~900px tall).
  expect(box?.height).toBeLessThan(200);
});
