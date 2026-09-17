import { expect, test } from "@playwright/test";

test("web manifest is complete and installable", async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/manifest.json`);
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.name ?? manifest.short_name).toBeTruthy();
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.display).toBeTruthy();
  expect(Array.isArray(manifest.icons) && manifest.icons.length).toBeGreaterThan(0);
});

test("service worker is a generated workbox build", async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/sw.js`);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("workbox");
});

test("offline reload serves the app shell, never a browser error", async ({ page, context, browserName }) => {
  // WebKit's Playwright driver cannot navigate at all while offline
  // ("internal error", a driver limitation unrelated to the app); offline
  // shell coverage for WebKit is manual. All other engines run this test.
  test.skip(browserName === "webkit", "WebKit driver cannot navigate offline");
  await page.goto("/");
  await page.locator("main").waitFor({ timeout: 15000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.goto(page.url());
  await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
});

test("service worker never caches API responses", async ({ page }) => {
  // Deterministic on every engine: inspect the Cache Storage directly
  // instead of relying on offline emulation (unreliable in Firefox/WebKit).
  // Visit pages so all runtime caches populate, then prove none holds /api/*.
  await page.goto("/tools/bmi-calculator");
  await page.locator("main").waitFor({ timeout: 15000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  const apiKeys = await page.evaluate(async () => {
    const hits: Array<string> = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (new URL(request.url).pathname.startsWith("/api/")) {
          hits.push(request.url);
        }
      }
    }
    return hits;
  });
  expect(apiKeys).toEqual([]);
});
