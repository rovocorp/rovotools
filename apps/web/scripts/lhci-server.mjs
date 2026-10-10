// Portable Lighthouse CI web server: serves the SSR production build via
// `next start` (same server Hostinger runs). Run `pnpm build` first.
// PORT 3210 keeps clear of the default 3000 dev port.
import { spawn } from "node:child_process";

const port = process.env["PORT"] ?? "3210";
const child = spawn("pnpm", ["exec", "next", "start", "-p", port], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
