# Vendored pnpm (deploy fallback)

`bin/` + `dist/` are the standalone pnpm **9.12.0** executable, copied verbatim
from the published `pnpm@9.12.0` npm tarball (`bin/pnpm.cjs` entry point).

## Why it exists

Some hosts (notably Hostinger's Node.js runner circa Sep 2026, Node
`v22.18.0` image) resolve pnpm through corepack to that image's default
`pnpm@12.4.2` instead of this repo's `packageManager: pnpm@9.12.0` pin.
(`12.4.2` does exist on the npm registry — the problem is not availability.)
That proves the install step ran where no repo `packageManager` was visible
(wrong working directory, pre-checkout step, or the panel's own pinned
version). The failure signature is unmistakable:

```text
Error: Cannot find module '.../.cache/node/corepack/v1/pnpm/12.4.2/bin/pnpm.cjs'
  code: 'MODULE_NOT_FOUND'
ERROR: Failed to install dependencies
```

`MODULE_NOT_FOUND` (not a download error) means the host cache dir for
`12.4.2` exists but is hollow — a partial/failed download. Corepack sees the
dir, skips re-download, and crashes. Deleting the site checkout does not
clear it: the broken dir lives outside the checkout at
`~/.cache/node/corepack/v1/pnpm/12.4.2/`. Delete just that folder via File
Manager (show hidden files) or ask support to `rm -rf` it, confirm the app
root is the monorepo root (where root `package.json` lives), then redeploy.
No repo edit and no `npm i -g` can fix a host cache for a version the repo
never requests.

This vendored copy removes the package manager from the equation:

```sh
# Hostinger install command (no corepack, no global install, no pm download)
node ./scripts/pnpm/bin/pnpm.cjs install --frozen-lockfile
```

Only the project *dependencies* still need registry access — same as any
install. Verified working with `--frozen-lockfile` against this repo's
`pnpm-lock.yaml` (lockfileVersion 9.0).

## Maintenance

- Do NOT hand-edit anything under `bin/` or `dist/`.
- To refresh (e.g. repo moves to a new pinned pnpm): `npm pack pnpm@<version>`
  and replace both directories; keep this file's version note in sync.
- Source of truth for the pin remains the root `package.json`
  `packageManager` field.
