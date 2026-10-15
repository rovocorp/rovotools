#!/usr/bin/env node
// IndexNow: notify Bing/Yandex/Seznam/Naver of URL changes.
// Usage:
//   node scripts/indexnow.mjs                -> submit all URLs from sitemap.xml
//   node scripts/indexnow.mjs /tools/pdf-compress/ /blog/foo/
//   node scripts/indexnow.mjs https://rovotools.com/tools/pdf-compress/
// The key file (public/<KEY>.txt) must be deployed before first run.

import { SITE, INDEXNOW_KEY } from "./indexnow-config.mjs";

const KEY_LOCATION = `${SITE}/${INDEXNOW_KEY}.txt`;

function toAbs(input) {
  if (input.startsWith("/")) return `${SITE}${input}`;
  if (input.startsWith(SITE)) return input;
  throw new Error(`URL must start with ${SITE} or / : ${input}`);
}

async function collectUrls(args) {
  if (args.length > 0) return [...new Set(args.map(toAbs))];
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return [...new Set(urls.filter((u) => u.startsWith(SITE)))];
}

async function main() {
  const urls = await collectUrls(process.argv.slice(2));
  if (urls.length === 0) {
    console.error("No URLs to submit.");
    process.exit(1);
  }

  const payload = {
    host: "rovotools.com",
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const text = await res.text().catch(() => "");
    console.log(`${endpoint} -> ${res.status} ${res.statusText}${text ? ` | ${text}` : ""}`);
    if (!res.ok && res.status !== 202) process.exitCode = 1;
  }

  console.log(`Submitted ${urls.length} URL(s) to IndexNow.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
