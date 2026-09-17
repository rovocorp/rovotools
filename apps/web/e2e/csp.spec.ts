import { expect, test } from "@playwright/test";

// Any Content-Security-Policy refusal on key pages fails the run: with the
// locked-down policy, a single blocked script/style/font breaks the page.
const ROUTES = ["/", "/tools", "/tools/bmi-calculator", "/tools/pdf/merge-pdf", "/blog", "/contact"];

for (const route of ROUTES) {
  test(`${route} loads with zero CSP violations`, async ({ page }) => {
    const violations: Array<string> = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /content security policy/i.test(message.text())) {
        violations.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      if (/content security policy/i.test(error.message)) {
        violations.push(error.message);
      }
    });
    await page.goto(route);
    await page.locator("main").waitFor({ timeout: 15000 });
    // Let late-hydrating chunks (tool runners, custom UIs) execute too.
    await page.waitForTimeout(2000);
    expect(violations).toEqual([]);
  });
}
