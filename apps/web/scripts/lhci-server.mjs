// Portable Lighthouse CI web server: serves the static export in out/.
// Run `pnpm build` first. Uses `serve` via pnpm dlx (no extra dependency).
// PORT 3210 keeps clear of the default 3000 dev port.
import { spawn } from "node:child_process";

const port = process.env["PORT"] ?? "3210";
const child = spawn("pnpm", ["dlx", "serve@14", "out", "--listen", port], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
