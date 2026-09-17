// Copies the pdf.js worker into public/ so tool pages can run PDF rendering
// fully offline. Runs via the predev/prebuild hooks; re-run automatically on
// every pdfjs-dist upgrade, so the worker always matches the library version.
/* eslint-disable no-console -- build script: stdout is its only reporting channel. */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const target = join(root, "public", "pdf.worker.min.mjs");

if (!existsSync(source)) {
  throw new Error(`pdf.js worker not found at ${source}. Did pnpm install finish?`);
}
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`pdf.js worker copied to ${target}`);
