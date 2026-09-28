# Vendored pnpm (deploy fallback)

`bin/` + `dist/` (+ `package.json` manifest, `LICENSE`) are the standalone
pnpm **10.22.0** loader, copied verbatim from the published `pnpm@10.22.0`
npm tarball (`bin/pnpm.cjs` entry point).

## Why it exists

Some hosts (notably Hostinger's Node.js runner, Node `v22.18.0` image)
ship corepack `<=0.34`, which hardcodes the `bin/pnpm.cjs` entry point.
pnpm `>=11` moved to `bin/pnpm.mjs` (and the v12 Rust port changed the
package layout again), so that corepack cannot execute **any** pnpm `>=11`
— proven by local reproduction on corepack `0.34.2` plus the upstream
reports (`nodejs/corepack#775`, `pnpm/pnpm#13018`).

The repo therefore pins the newest pnpm the host image can execute:
`10.22.0` (root + `apps/web` + `apps/mobile`,
`engines.pnpm >=10.0.0 <11.0.0`). Invoking the vendored loader
(`bin/pnpm.cjs`) with `node` bypasses corepack entirely — on the host,
in CI fallbacks, and for local developers stuck on global pnpm 9 or
corepack `<=0.34`:

```sh
# Hostinger install command (no corepack, no global install, no pm download)
node ./scripts/pnpm/bin/pnpm.cjs install --frozen-lockfile
```

Only the project *dependencies* still need registry access — same as any
install. Verified working with `--frozen-lockfile` against this repo's
`pnpm-lock.yaml` (lockfileVersion 9.0, shared with the pnpm 10 line).

## Maintenance

- Do NOT hand-edit anything under `bin/` or `dist/`.
- To refresh (e.g. repo moves to a new pinned pnpm): `npm pack pnpm@<version>`
  and replace `bin/`, `dist/`, the `package.json` manifest and `LICENSE`;
  never commit downloaded platform blobs. Keep this file's version note in
  sync. Stay on the pnpm 10 line until the host's corepack can execute
  pnpm `>=11` — see `docs/DEPLOY_SSH.md`.
- Source of truth for the pin remains the root `package.json`
  `packageManager` field.
