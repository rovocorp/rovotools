#!/usr/bin/env node
// Keep the self-contained web copy (apps/web/src/shared/tools) and the
// workspace package (packages/tools/src) in sync.
//
// Source of truth: apps/web/src/shared/tools — the app vendors these files at
// it needs them to resolve inside its standalone build.
//
// The only intended difference is the import specifier:
//   "@/shared/<pkg>"  (web)  ->  "@rovotools/<pkg>"  (package)
// Everything else (tool data, decks, noIndex flags, tests) must match.
//
// Usage:
//   node scripts/sync-shared-tools.mjs          # copy web -> packages
//   node scripts/sync-shared-tools.mjs --check  # CI: exit 1 on drift

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "apps", "web", "src", "shared", "tools");
const TARGET = join(ROOT, "packages", "tools", "src");

const check = process.argv.includes("--check");

function normalize(source) {
  return source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/from "@\/shared\/([^"]+)"/g, 'from "@rovotools/$1"');
}

async function listTs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => entry.name)
    .sort();
}

const sourceFiles = await listTs(SOURCE);
const targetFiles = new Set(await listTs(TARGET));
const drift = [];

for (const name of sourceFiles) {
  const expected = normalize(await readFile(join(SOURCE, name), "utf8"));
  let actual = null;
  try {
    actual = normalize(await readFile(join(TARGET, name), "utf8"));
  } catch {
    actual = null;
  }
  targetFiles.delete(name);

  if (actual === expected) {
    continue;
  }

  drift.push(name);
  if (!check) {
    await writeFile(join(TARGET, name), expected, "utf8");
    console.log(`synced ${name}`);
  }
}

for (const name of targetFiles) {
  drift.push(name);
  console.error(`extra file only in packages/tools/src: ${name}`);
}

if (drift.length === 0) {
  console.log("shared tools in sync.");
  process.exit(0);
}

if (check) {
  console.error(
    `\n${drift.length} file(s) drifted between apps/web/src/shared/tools and packages/tools/src:`,
  );
  for (const name of drift) {
    console.error(`  - ${name}`);
  }
  console.error("\nRun `pnpm sync:shared` and commit the result.");
  process.exit(1);
}

console.log(`\nSynced ${drift.length} file(s) into packages/tools/src.`);
