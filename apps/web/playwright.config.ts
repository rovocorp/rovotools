import { defineConfig, devices } from "@playwright/test";

// E2E_PORT lets the suite run alongside other local servers (e.g. when the
// default port 3000 is already taken): E2E_PORT=3100 pnpm e2e
const e2ePort = Number(process.env["E2E_PORT"] ?? 3000);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Capped: the image/PDF tools are CPU-heavy and WebKit is the slowest
  // engine — uncapped workers starve it into timeouts on shared runners.
  // (CI runners with more cores can raise this via E2E_WORKERS.)
  workers: process.env["E2E_WORKERS"] !== undefined ? Number(process.env["E2E_WORKERS"]) : 2,
  // Load flakes on shared hardware are retried; real regressions fail
  // consistently. E2E_RETRIES=0 restores strict single-shot locally.
  retries:
    process.env["E2E_RETRIES"] !== undefined
      ? Number(process.env["E2E_RETRIES"])
      : process.env["CI"] !== undefined
        ? 2
        : 0,
  retries: process.env["CI"] !== undefined ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${e2ePort}`,
    trace: "on-first-retry",
  },
  // Requires a production build first: `pnpm build` (then `pnpm e2e`).
  // Serves the standalone server (the actual deploy artifact), not next start.
  // In this monorepo the entry sits at .next/standalone/apps/web/server.js.
  webServer: {
    command: "node apps/web/server.js",
    cwd: "./.next/standalone",
    url: `http://localhost:${e2ePort}`,
    env: { PORT: String(e2ePort) },
    reuseExistingServer: false,
    timeout: 180000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
});
