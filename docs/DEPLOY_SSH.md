# Deploying RovoTools over SSH (static export)

> Status: this runbook matches the current build — `apps/web/next.config.ts`
> uses `output: "export"`, so the deploy artifact is the static `apps/web/out/`
> folder, uploaded to `public_html`. There is **no Node server** to start
> (any older notes about `.next/standalone/server.js` are obsolete).

## Requirements on the host

- SSH access to the account.
- Node.js 22.x preferred (20.19.4+ works; the repo's `engines` field allows
  `>=20.0.0`).
- Git and outbound registry access (only project *dependencies* are
  downloaded — the package manager itself is vendored, see below).
- ~2 GB RAM free for the Next.js production build.

## Why the vendored pnpm

`scripts/pnpm/` is the standalone pnpm 10.22.0 loader, committed
verbatim (see `scripts/pnpm/README.md`). The repo deliberately pins the
newest pnpm the host image can execute (`pnpm@10.22.0`, which still ships
`bin/pnpm.cjs`); invoking the vendored loader (`bin/pnpm.cjs`) with `node`
bypasses corepack — required because corepack `<=0.34` cannot execute any
pnpm `>=11` (hardcoded `bin/pnpm.cjs` entry point; pnpm `>=11` moved to
`bin/pnpm.mjs` and the v12 layout changed again — proven by local
reproduction plus `nodejs/corepack#775` and `pnpm/pnpm#13018`).
Proven with `--frozen-lockfile` against this repo's `pnpm-lock.yaml`
(lockfileVersion 9.0, shared with the pnpm 10 line).

Do NOT "fix" a host pnpm-version error by widening `engines` to allow
pnpm 12 or re-pinning `packageManager` to pnpm 12.x — that blesses the exact
combination that crashes (`MODULE_NOT_FOUND` after a complete download)
and breaks local dev/CI, which run pnpm 10.

## Steps (run in order)

All paths assume the repository root as working directory.

```sh
# 1. Fetch code (first time) — later deploys: git pull origin main
git clone https://github.com/rovocorp/rovotools.git ~/rovotools
cd ~/rovotools

# 2. Install — corepack-free, no global packages
node ./scripts/pnpm/bin/pnpm.cjs install --frozen-lockfile

# 3. Build-time env (baked into the bundle — set before building)
export NEXT_PUBLIC_SITE_URL="https://rovotools.com"
export NEXT_PUBLIC_APP_NAME="RovoTools"
export NEXT_PUBLIC_COMPANY_NAME="RovoCorp LTD"
# Optional, only when ads go live:
# export NEXT_PUBLIC_ADSENSE_PUBLISHER_ID="ca-pub-XXXXXXXXXXXXXXXX"
# export NEXT_PUBLIC_ADSENSE_SLOT_ID="XXXXXXXXXX"

# 4. Production static export (workspace packages + web build)
node ./scripts/pnpm/bin/pnpm.cjs build:web

# 5. Verify the static artifact
test -f apps/web/out/index.html || (echo "static export missing" && exit 1)
test -f apps/web/out/.htaccess || (echo ".htaccess missing from export" && exit 1)

# 6. Publish to public_html (contents of out/, not the folder itself)
rsync -av --delete apps/web/out/ ~/domains/rovotools.com/public_html/
```

## Verify

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://rovotools.com/
curl -s -o /dev/null -w "%{http_code}\n" https://rovotools.com/ads.txt
curl -s -o /dev/null -w "%{http_code}\n" https://rovotools.com/sitemap.xml
curl -s -o /dev/null -w "%{http_code}\n" https://rovotools.com/logo.png
```

All four must return `200`. Then open a tool page (e.g. `/tools/bmi-calculator`)
in a browser, in both light and dark mode (logo check).

## Troubleshooting

| Symptom | Meaning | Action |
|---|---|---|
| Build killed / `ENOMEM` / signal 9 | Host RAM too small for Next build | No code fix exists — move to a bigger tier/VPS, or build locally and upload `out.zip` via File Manager (see `DEPLOY_STATIC.md`) |
| `Failed to install dependencies` with `.../corepack/v1/pnpm/<11+>/bin/pnpm.cjs` (`MODULE_NOT_FOUND`) | Host corepack `<=0.34`, which cannot execute any pnpm `>=11` — see "Why the vendored pnpm" above | Use exactly the `node ./scripts/...` (`.cjs`) command; panel install must not run first |
| "Unsupported framework or invalid project structure" | Upload/archive was fed into Hostinger's framework auto-detection (Node.js/Codex flow), which needs a `package.json` at the archive root | That flow is the wrong tool for the pre-built static artifact — use File Manager (`DEPLOY_STATIC.md`), or configure the Node.js flow manually (below) |
| Wrong canonical/metadata | Step 3 env vars were missing at build time | Re-export and re-run steps 4–6 |
| Old logo/favicon after deploy | Browser/proxy cached the previous assets | Hard-refresh (Ctrl+Shift+R); favicons cache aggressively |

## Hostinger Node.js flow without SSH (manual settings)

Use only when you must deploy through the panel's Node.js flow. Fill the
build settings **manually** (auto-detect fails on this monorepo: the root
`package.json` has no `start` script and Next.js lives in `apps/web`):

- Repository: `rovocorp/rovotools`, branch `main`
- App root: `./` (monorepo root — never `apps/web`, or workspace resolution
  breaks; `pnpm-lock.yaml` lives at root)
- Node: `22.x`, package manager: **pnpm** (auto-detected from lockfile)
- Framework preset: `next`
- Build: `pnpm run deploy:web` (workspace packages + web static export)
- Output directory: `apps/web/out`
- Entry file: none (static export — there is no server to start)
- Env (all three, never `None`):
  `NEXT_PUBLIC_SITE_URL=https://rovotools.com`,
  `NEXT_PUBLIC_APP_NAME=RovoTools`,
  `NEXT_PUBLIC_COMPANY_NAME=RovoCorp LTD`

If the panel resolves any pnpm `>=11` despite the repo's `pnpm@10.22.0` pin
and fails at install with a `bin/pnpm.cjs` `MODULE_NOT_FOUND`, the failure
is host-side: confirm the app root contains the root `package.json`, then
send support this text:

```text
Deployment of rovocorp/rovotools@main fails at install when the runner
resolves pnpm >=11 with:
Error: Cannot find module '/home/<user>/.cache/node/corepack/v1/pnpm/<version>/bin/pnpm.cjs'
  code: 'MODULE_NOT_FOUND' (Node v22.18.0, ERROR: Failed to install dependencies).
Root cause (verified upstream: nodejs/corepack#775, pnpm/pnpm#13018):
corepack <=0.34 hardcodes the bin/pnpm.cjs entry point, which pnpm >=11
no longer ships (moved to bin/pnpm.mjs; v12 changed the layout again), so
it cannot execute any pnpm >=11. My repo deliberately pins pnpm@10.22.0
(root + apps/web + apps/mobile, engines pnpm >=10.0.0 <11.0.0, the newest
pnpm your image can execute) — yet the panel resolves a newer pnpm. Please
either honor the repo's packageManager pin on the Node 22 image or upgrade
corepack to a release that can execute pnpm >=11, then redeploy on Node
22.x with app root = monorepo root.
```
