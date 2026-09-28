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

`scripts/pnpm/` is the standalone pnpm 12.4.2 loader, committed
verbatim (see `scripts/pnpm/README.md`). The repo pin is `pnpm@12.4.2`
per the host's requirement; invoking the vendored loader (`bin/pnpm.mjs`,
which fetches its platform binary on first run) with `node` bypasses
corepack — required because corepack `<=0.34` cannot execute any pnpm
`>=11` (hardcoded `bin/pnpm.cjs` entry point; proven by local
reproduction). Proven with `--frozen-lockfile` against this repo's
`pnpm-lock.yaml`.

## Steps (run in order)

All paths assume the repository root as working directory.

```sh
# 1. Fetch code (first time) — later deploys: git pull origin main
git clone https://github.com/rovocorp/rovotools.git ~/rovotools
cd ~/rovotools

# 2. Install — corepack-free, no global packages
node ./scripts/pnpm/bin/pnpm.mjs install --frozen-lockfile

# 3. Build-time env (bake into the bundle — set before building)
export NEXT_PUBLIC_SITE_URL="https://rovotools.com"
export NEXT_PUBLIC_APP_NAME="RovoTools"
export NEXT_PUBLIC_COMPANY_NAME="RovoCorp LTD"
# Optional, only when ads go live:
# export NEXT_PUBLIC_ADSENSE_PUBLISHER_ID="ca-pub-XXXXXXXXXXXXXXXX"
# export NEXT_PUBLIC_ADSENSE_SLOT_ID="XXXXXXXXXX"

# 4. Prisma client, then the production build (standalone static/public
#    staging runs automatically via the web `postbuild` hook)
node ./scripts/pnpm/bin/pnpm.mjs --filter @rovotools/web prisma:generate
node ./scripts/pnpm/bin/pnpm.mjs build:web

# 5. Verify the standalone artifact (entry + staged client assets)
test -f apps/web/.next/standalone/apps/web/server.js || (echo "standalone server missing" && exit 1)
ls apps/web/.next/standalone/apps/web/.next/static > /dev/null
ls apps/web/.next/standalone/apps/web/public > /dev/null

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
| `Failed to install dependencies` with `.../corepack/v1/pnpm/12.x/bin/pnpm.cjs` (`MODULE_NOT_FOUND`) | Host corepack `<=0.34`, which cannot execute any pnpm `>=11` (ships `bin/pnpm.mjs`, not `bin/pnpm.cjs`) — see "Hostinger panel without SSH" below | Use exactly the `node ./scripts/...` (`.mjs`) command; panel install must not run first |
| App stops after logout/reboot | `nohup` doesn't survive reboots | Ask support for their process supervisor, or add a cron `@reboot` entry if allowed |
| Wrong canonical/metadata | Step 3 env vars were missing at build time | Re-export and re-run steps 4–6 |

## Hostinger panel without SSH (no custom install command)

Use when the panel offers no custom install command and no SSH (fresh
deploy keeps failing on the pinned commit with the `12.4.2` /
`MODULE_NOT_FOUND` error above):

1. Panel inputs (copy-paste, Hostinger `next` app type): repo
   `rovocorp/rovotools`, branch `main`, root `./` (monorepo root — never
   `apps/web`, or workspace resolution breaks), Node `22.x`,
   framework `next`, install `pnpm install --frozen-lockfile` (default,
   from `./`). Build: `pnpm run deploy:web` (runs Prisma generate +
   workspace packages + web `build`; standalone static/public staging is
   automatic via the web `postbuild` hook). Output: `apps/web/.next`.
   Entry file: leave empty — ignored for `next` (Hostinger starts the
   bundled standalone server at
   `apps/web/.next/standalone/apps/web/server.js` itself). Env (all three,
   never `None`):
   `NEXT_PUBLIC_SITE_URL=https://rovotools.com`,
   `NEXT_PUBLIC_APP_NAME=RovoTools`,
   `NEXT_PUBLIC_COMPANY_NAME=RovoCorp LTD`.
2. The failure is host-side and no cache-clear fixes it: the `12.x`
   cache downloads **completely** but host corepack `<=0.34` hardcodes the
   `bin/pnpm.cjs` entry point, which pnpm `>=11` no longer ships
   (reproduced locally on corepack `0.34.2`). The repo pin is now `12.4.2`
   per the host's requirement — confirm the app root contains the root
   `package.json` (`packageManager: pnpm@12.4.2`), then redeploy.
3. If installs still fail on the `bin/pnpm.cjs` path, send support this text:

```text
Deployment of rovocorp/rovotools@main fails at install with:
Error: Cannot find module '/home/<user>/.cache/node/corepack/v1/pnpm/12.4.2/bin/pnpm.cjs'
  code: 'MODULE_NOT_FOUND' (Node v22.18.0, ERROR: Failed to install dependencies).
I verified the 12.4.2 cache downloads completely (bin/pnpm.mjs present) and
reproduced the identical crash locally on corepack 0.34.2: corepack <=0.34
hardcodes the bin/pnpm.cjs entry point, which pnpm >=11 no longer ships, so
it cannot execute any 12.x. My repo now pins pnpm@12.4.2 (root + apps/web +
apps/mobile, engines pnpm >=12.0.0) exactly as requested, yet the same path
fails — the defect is in the image's corepack, not my pin. Please upgrade
corepack on the Node 22 image (or default its pnpm to a runnable line),
then redeploy on Node 22.x with app root = monorepo root.
```

## Panel settings (when the panel works again)

Hostinger `next` app type (server mode): framework **Next.js**, Node
**22.x** (20+ required), package manager **pnpm** (auto-detected from
`pnpm-lock.yaml`), root directory `./` (monorepo root — never `apps/web`,
or workspace resolution breaks), install
`pnpm install --frozen-lockfile` (or the vendored command above), build
`pnpm run deploy:web` (Prisma generate + `build:web`; static/public
staging is automatic via `postbuild`), output directory
`apps/web/.next`, entry file empty (ignored for `next` — Hostinger starts
the bundled standalone server itself), same three `NEXT_PUBLIC_*` env
vars. `next.config.ts` stays a plain object export (never a function),
which Hostinger wraps to enforce `output: "standalone"`; standalone
tracing is pinned to the checkout via `outputFileTracingRoot` so the
stray lockfile above Hostinger's checkout cannot move the server path.
