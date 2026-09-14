import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env["CI"] !== undefined ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  // Requires a production build first: `pnpm build` (then `pnpm e2e`).
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: process.env["CI"] === undefined,
    timeout: 180000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
