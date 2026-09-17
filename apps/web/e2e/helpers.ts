import type { Page } from "@playwright/test";

/**
 * Dismiss the cookie-consent banner if present. On small viewports the
 * fixed banner covers submit buttons and Playwright clicks time out
 * intercepted; real users dismiss it the same way. Waits for the banner
 * first: it hydrates after first paint, so clicking immediately races it
 * and the banner then appears over the form. Best-effort: absence is not
 * an error.
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
  const banner = page.locator("#cookie-banner");
  try {
    await banner.waitFor({ state: "visible", timeout: 8000 });
  } catch {
    return;
  }
  await page
    .getByRole("button", { name: "Reject" })
    .click({ timeout: 5000 })
    .catch(() => undefined);
  await banner.waitFor({ state: "hidden", timeout: 5000 }).catch(() => undefined);
}
