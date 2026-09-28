// Stages client assets into the Next.js standalone artifact (monorepo layout).
// The standalone server does not copy `public/` or `.next/static` by default;
// they must be staged next to the server or pages serve without CSS/JS/PWA
// assets. Runs automatically via the `postbuild` hook so Hostinger's `next`
// app type (Build `build`, Output `.next`, entry auto-detected) produces a
// runnable artifact with zero manual steps. Portable Node (no shell cp)
// so it works on Hostinger Linux, CI, and Windows alike.
// In this monorepo the entry sits at .next/standalone/apps/web/server.js.
/* eslint-disable no-console -- build script: stdout is its only reporting channel. */
import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneAppDir = join(appDir, ".next", "standalone", "apps", "web");

const pairs = [
  [join(appDir, ".next", "static"), join(standaloneAppDir, ".next", "static")],
  [join(appDir, "public"), join(standaloneAppDir, "public")],
];

for (const [source, target] of pairs) {
  if (!existsSync(source)) {
    throw new Error(`standalone staging: source missing: ${source}. Did next build finish?`);
  }
  cpSync(source, target, { recursive: true });
  console.log(`standalone staged: ${target}`);
}
