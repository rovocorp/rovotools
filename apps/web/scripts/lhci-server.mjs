// Portable Lighthouse CI web server: serves the standalone deploy artifact.
// The standalone server reads PORT from the environment (3210 keeps clear
// of the default 3000 dev port); `PORT=3210 node ...` shell syntax is not
// portable, so this wrapper sets it in-process for Windows and Unix alike.
// Run `pnpm build` (plus standalone static/public staging, see CI) first.
process.env["PORT"] ??= "3210";
await import("../.next/standalone/apps/web/server.js");
