# Vendored pnpm (deploy fallback)

`bin/` + `dist/` (+ `native-binary.mjs`, `install.js`, `package.json`
manifest) are the standalone pnpm **12.4.2** loader, copied verbatim from
the published `pnpm@12.4.2` npm tarball (`bin/pnpm.mjs` entry point). The
platform binary (`pnpm-native.exe`, 44MB, OS-specific) is deliberately
excluded: the loader downloads the correct one on first run (network needed
once — same as any install) and caches it next to itself.

## Why it exists

Some hosts (notably Hostinger's Node.js runner circa Sep 2026, Node
`v22.18.0` image) resolve pnpm to that image's default `pnpm@12.4.2`
instead of this repo's `packageManager: pnpm@9.12.0` pin — i.e. the install
step runs where no repo `packageManager` is visible (wrong working
directory, pre-checkout step, or the panel's own pinned version).
(`12.4.2` does exist on the npm registry — the problem is not availability.)

The failure signature is unmistakable:

```text
Error: Cannot find module '.../.cache/node/corepack/v1/pnpm/12.4.2/bin/pnpm.cjs'
  code: 'MODULE_NOT_FOUND'
ERROR: Failed to install dependencies
```

Root cause, proven by local reproduction on corepack `0.34.2` + Node 24:
the `12.4.2` cache is downloaded **completely** (`bin/pnpm.mjs` present) —
corepack `<=0.34` simply hardcodes the `bin/pnpm.cjs` entry point, which no
longer exists since pnpm `>=11` ships `bin/pnpm.mjs` (a native-binary
loader). So corepack `<=0.34` cannot execute **any** pnpm `>=11`, no matter
what the repo pins. Per the host's requirement the repo pin is now
`12.4.2` (root + `apps/web` + `apps/mobile`, `engines.pnpm >=12.0.0`) —
which means developers on corepack `<=0.34` (bundled with Node 22/24) must
use this vendored loader or upgrade corepack; `corepack pnpm` will fail for
them with the same `bin/pnpm.cjs` `MODULE_NOT_FOUND`.

This vendored copy removes the package manager from the equation:

```sh
# Hostinger install command (no corepack, no global install, no pm download)
node ./scripts/pnpm/bin/pnpm.mjs install --frozen-lockfile
```

Only the project *dependencies* still need registry access — same as any
install. Verified working with `--frozen-lockfile` against this repo's
`pnpm-lock.yaml` (lockfileVersion 9.0).

## Maintenance

- Do NOT hand-edit anything under `bin/` or `dist/`.
- To refresh (e.g. repo moves to a new pinned pnpm): `npm pack pnpm@<version>`
  and replace `bin/`, `dist/`, `native-binary.mjs`, `install.js` and the
  `package.json` manifest; never commit the downloaded `pnpm-native(.exe)`
  platform blob. Keep this file's version note in sync.
- Source of truth for the pin remains the root `package.json`
  `packageManager` field.
