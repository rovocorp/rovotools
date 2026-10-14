// Copies the runtime assets Next.js expects beside the standalone server:
// .next/static (hashed client bundles) and public/ (raw files). `next build`
// does not place them there itself — the official standalone deploy docs
// require this copy, and Hostinger only performs it for the `next` framework
// preset. With Application type `Other` + entry file (this monorepo's working
// deploy shape), nothing else would, and every page would load with 404
// JS/CSS. Runs via the postbuild hook; idempotent.
/* eslint-disable no-console -- build script: stdout is its only reporting channel. */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standalone = join(root, ".next", "standalone");

if (!existsSync(join(standalone, "server.js"))) {
  throw new Error(`standalone server not found at ${standalone}/server.js. Did "next build" run with output: standalone?`);
}

const copies = [
  [join(root, ".next", "static"), join(standalone, ".next", "static")],
  [join(root, "public"), join(standalone, "public")],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    throw new Error(`missing build asset ${from}`);
  }
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`standalone assets: ${from} -> ${to}`);
}
