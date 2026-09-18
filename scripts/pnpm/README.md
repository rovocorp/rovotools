# Vendored pnpm (deploy fallback)

`bin/` + `dist/` are the standalone pnpm **9.12.0** executable, copied verbatim
from the published `pnpm@9.12.0` npm tarball (`bin/pnpm.cjs` entry point).

## Why it exists

Some hosts (notably Hostinger's Node.js runner circa Sep 2026) resolve pnpm
through a broken corepack setup that demands its own phantom `pnpm@12.4.2`
binary, which is neither downloadable nor related to this repo's
`packageManager: pnpm@9.12.0` pin. When that happens, no repo edit and no
`npm i -g` can help — the toolchain itself is broken.

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
