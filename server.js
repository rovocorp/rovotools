// Hostinger Node.js entry (Application type: Other, Entry file: server.js).
// The web app lives in apps/web — NOT the repo root — so `dir` must point
// there; the default (process.cwd()) would look for .next at the repo root
// and crash with a missing-BUILD_ID error. Build first: `pnpm run build`
// (root script) builds packages/* then apps/web.
//
// Why this exists instead of `.next/standalone/server.js` as the entry:
// Hostinger support confirmed `Other` + a committed root server.js is the
// supported start shape for monorepos where the framework preset can't be
// selected (Next.js absent from the hPanel dropdown). The standalone path
// remains a fallback (next.config.ts still emits output: "standalone").
const { createServer } = require("http");
const path = require("path");

const next = require("next");

const dev = process.env.NODE_ENV === "development";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({
  dev,
  hostname,
  port,
  dir: path.join(__dirname, "apps", "web"),
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`Next.js server running on http://${hostname}:${port}`);
  });
});
