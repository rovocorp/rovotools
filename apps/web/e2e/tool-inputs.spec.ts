import { expect, test } from "@playwright/test";
import { registerCoreTools, toolRegistry } from "@rovotools/tools";
import { BESPOKE_TOOL_SLUGS } from "../src/components/tools/custom/customToolSlugs";
import { ensureFixtureImage, fixturePath } from "./fixtures";
import { dismissCookieBanner } from "./helpers";

registerCoreTools(toolRegistry);
// Bespoke UIs (no generic form, no file input) have dedicated tests below.
const slugs = toolRegistry
  .query({})
  .map((entry) => entry.definition.slug)
  .filter((slug) => !BESPOKE_TOOL_SLUGS.has(slug));

// Regression sweep for the blocked-inputs bug: on every tool page the first
// control must be clickable/typeable (an overlay covering the viewport makes
// Playwright click/type into the void and these assertions fail).
for (const slug of slugs) {
  test(`${slug} — first control accepts input`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    await dismissCookieBanner(page);

    // Scope to the tool form: the page also contains a feedback comment box
    // that renders before the client-side runner hydrates.
    const textControls = page
      .locator('main form :is(input:not([type="file"]), textarea, select)')
      .filter({ visible: true });
    const visibleControl = textControls.first();
    const fileControl = page.locator('main input[type="file"]').first();

    // The runner hydrates client-side after the skeleton paints: wait for
    // either a text control or a file input instead of racing hydration.
    await expect(textControls.or(fileControl).first()).toBeVisible({ timeout: 15000 });

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
    // setInputFiles itself throws if the control cannot accept the upload.
    // (No files-count assertion: tools that consume the file immediately
    // unmount the input, making the count racy by design. The dedicated
    // flow tests prove each file tool processes its upload.)
    await expect(fileControl).toHaveCount(1, { timeout: 15000 });
    const path = ensureFixtureImage(fixturePath());
    await fileControl.setInputFiles(path);
  });
}

test("dev ad placeholders are confined to their slots", async ({ page }) => {
  await page.goto("/tools/bmi-calculator");
  const labels = page.getByText("Ads by Google", { exact: true });
  // Single tool-footer unit per tool page.
  await expect(labels).toHaveCount(1, { timeout: 15000 });
  for (let i = 0; i < 1; i += 1) {
    const label = labels.nth(i);
    await expect(label).toBeVisible();
    const box = await label.boundingBox();
    // With the overlay bug this box is viewport-sized (~900px tall).
    expect(box?.height).toBeLessThan(200);
  }
});
