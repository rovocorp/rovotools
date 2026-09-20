# Deploying RovoTools without the hosting panel (SSH runbook)

Use this when the hosting panel cannot save deployment settings or its
toolchain is broken. It deploys over plain SSH and never touches corepack,
global installs, or panel build configuration.

## Requirements on the host

- SSH access to the account.
- Node.js 22.x preferred (20.19.4+ works; the repo's `engines` field allows
  `>=20.0.0`, CI is green on 22).
- Git and outbound registry access (only project *dependencies* are
  downloaded — the package manager itself is vendored, see below).
- ~2 GB RAM free for the Next.js production build.

## Why the vendored pnpm

`scripts/pnpm/` is the standalone pnpm 9.12.0 executable, committed
verbatim (see `scripts/pnpm/README.md`). Some hosts resolve pnpm through
corepack to that image's default (e.g. `pnpm@12.4.2` on Hostinger's Node
`v22.18.0` image) instead of this repo's `packageManager: pnpm@9.12.0` pin;
invoking the vendored binary with `node` bypasses corepack, global installs,
and any package-manager download. Proven with `--frozen-lockfile` against
this repo's `pnpm-lock.yaml`.

## Steps (run in order)

All paths assume the repository root as working directory.

```sh
# 1. Fetch code (first time) — later deploys: git pull origin main
git clone https://github.com/rovocorp/rovotools.git ~/rovotools
cd ~/rovotools

# 2. Install — corepack-free, no global packages
node ./scripts/pnpm/bin/pnpm.cjs install --frozen-lockfile

# 3. Build-time env (bake into the bundle — set before building)
export NEXT_PUBLIC_SITE_URL="https://rovotools.com"
export NEXT_PUBLIC_APP_NAME="RovoTools"
export NEXT_PUBLIC_COMPANY_NAME="RovoCorp LTD"
# Optional, only when ads go live:
# export NEXT_PUBLIC_ADSENSE_PUBLISHER_ID="ca-pub-XXXXXXXXXXXXXXXX"
# export NEXT_PUBLIC_ADSENSE_SLOT_ID="XXXXXXXXXX"

# 4. Prisma client, then the production build
node ./scripts/pnpm/bin/pnpm.cjs --filter @rovotools/web prisma:generate
node ./scripts/pnpm/bin/pnpm.cjs build:web

# 5. Stage standalone assets next to the server (same recipe CI uses)
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public/. apps/web/.next/standalone/apps/web/public/

# 6. Start (replace 3000 with the port your host assigns)
cd apps/web/.next/standalone
PORT=3000 nohup node apps/web/server.js > ~/rovotools.log 2>&1 &
```

Point the domain at that port per the host's Node.js docs.

## Verify

```sh
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ads.txt
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/sitemap.xml
```

All three must return `200`. Then open a tool page (e.g. `/tools/bmi-calculator`)
in a browser.

## Troubleshooting

| Symptom | Meaning | Action |
|---|---|---|
| Build killed / `ENOMEM` / signal 9 | Host RAM too small for Next build | No code fix exists — move to a bigger tier/VPS |
| `Failed to install dependencies` with a corepack path | A panel pre-step ran instead of step 2, or the host corepack cache for a non-repo version is corrupt | Use exactly the `node ./scripts/...` command; panel install must not run first. If the log shows `Cannot find module '.../corepack/v1/pnpm/12.4.2/bin/pnpm.cjs'` (`MODULE_NOT_FOUND`), the host cache dir exists but is hollow — see "Hostinger panel without SSH" below |

## Hostinger panel without SSH (no custom install command)

Use when the panel offers no custom install command and no SSH (fresh
deploy keeps failing on the pinned commit with the `12.4.2` /
`MODULE_NOT_FOUND` error above):

1. Panel inputs (copy-paste): repo `rovocorp/rovotools`, branch `main`,
   root `./` (monorepo root — never `apps/web`), Node `22.x`.
   Install: `pnpm install --frozen-lockfile` (default, from `./`).
   Build: `pnpm --filter @rovotools/web prisma:generate && pnpm build:web`.
   Output: `apps/web/.next/standalone`. Start (cwd `./`):
   `node apps/web/server.js`. Env (all three, never `None`):
   `NEXT_PUBLIC_SITE_URL=https://rovotools.com`,
   `NEXT_PUBLIC_APP_NAME=RovoTools`,
   `NEXT_PUBLIC_COMPANY_NAME=RovoCorp LTD`.
2. The failure is host-side: deleting the site checkout does not clear
   `~/.cache/node/corepack/v1/pnpm/12.4.2/`. In File Manager (show hidden
   files), delete just that `12.4.2/` folder, confirm the app root contains
   the root `package.json` (`packageManager: pnpm@9.12.0`), then redeploy.
   Expect install to resolve `9.12.0`, not `12.4.2`.
3. If `~/.cache` is not visible or the delete fails, send support this text:

```text
Deployment of rovocorp/rovotools@main fails at install with:
Error: Cannot find module '/home/<user>/.cache/node/corepack/v1/pnpm/12.4.2/bin/pnpm.cjs'
  code: 'MODULE_NOT_FOUND' (Node v22.18.0, ERROR: Failed to install dependencies).
The repo pins pnpm@9.12.0 (root package.json packageManager) and nothing in
the repo references 12.4.2 — 12.4.2 is the image default plus a corrupt
(partial) cache dir. Please rm -rf ~/.cache/node/corepack/v1/pnpm/12.4.2
and redeploy on Node 22.x with app root = monorepo root.
```
| App stops after logout/reboot | `nohup` doesn't survive reboots | Ask support for their process supervisor, or add a cron `@reboot` entry if allowed |
| Wrong canonical/metadata | Step 3 env vars were missing at build time | Re-export and re-run steps 4–6 |

## Panel settings (when the panel works again)

Framework **Next.js**, Node **22.x**, package manager **pnpm**,
install `pnpm install --frozen-lockfile` (or the vendored command above),
build `pnpm --filter @rovotools/web prisma:generate && pnpm build:web`,
start `node apps/web/server.js` from the staged standalone dir,
same three `NEXT_PUBLIC_*` env vars. Root directory `./` (monorepo root —
never `apps/web`, or workspace resolution breaks).
