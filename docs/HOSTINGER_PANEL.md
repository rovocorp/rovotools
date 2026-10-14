# Hostinger Panel Checklist (GitHub deploy, SSR)

Use these exact values when connecting this repo to Hostinger's **Node.js web
app** flow via GitHub (Websites → Add Website → Node.js web app → Import Git
repository). Auto-detect usually fills them; verify every row — the wrong
values below have broken builds before.

The app deploys as **SSR** (`next start`-equivalent: Hostinger runs the
Next standalone server). `apps/web` is self-contained (vendored shared code
under `apps/web/src/shared`, its own `pnpm-lock.yaml`), so Hostinger builds
only that subdirectory.

## Settings

| Field | Value |
|---|---|
| Repository | `rovocorp/rovotools` |
| Branch | `main` |
| Root directory | `./` (monorepo root — Hostinger's GitHub flow requires this for this repo; **not** `apps/web`) |
| Application type | `other` (Next.js is absent from the hPanel framework dropdown for this import — Hostinger support confirmed `Other` + a root `server.js` is the supported shape) |
| Node.js | `22.x` (from `engines.node`; Hostinger supports 18/20/22/24) |
| Package manager | `pnpm` |
| Build script | `build` (root script → `pnpm build:web`; the `--webpack` flag inside `apps/web` is load-bearing — it is how `next-pwa` regenerates `public/sw.js`) |
| Output directory | leave empty (entry file is set — `other` ignores the output dir when an entry exists) |
| Entry file | `server.js` (committed at the repo root; starts the app from `apps/web/.next` — see root `server.js`) |
| Environment variables | all optional (defaults work); recommended for canonical URLs below |

### The working shape: `other` + root `server.js`

hPanel's framework dropdown does not list Next.js for this import, and
auto-detection (which only runs at import time) had classified the app as
`Other`. Hostinger support's recommended fix, adapted for this monorepo:

- **Root `server.js`** — `next({ dir: <repo>/apps/web })` + `http` handler.
  The `dir` option is the monorepo adaptation: support's stock snippet assumes
  the Next project sits at the repo root; ours lives in `apps/web`, and the
  default (`process.cwd()`) would look for `.next` at the repo root and crash
  on a missing BUILD_ID. After `pnpm run build` (which builds `packages/*`
  then `apps/web`), Hostinger runs `node server.js` from the repo root.
- **Root `package.json`**: `"start": "node server.js"` (build stays
  `pnpm build:web` — a literal `"build": "next build"` at the root would run
  Next in the wrong directory; support's example assumes a single-package repo).
- Runtime Logs will show a one-line warning
  `"next start" does not work with "output: standalone"` — **benign**. The
  custom server still serves everything (`next.config.ts` keeps
  `output: "standalone"` only as a fallback entry path:
  `apps/web/.next/standalone/server.js`, with `postbuild` copying
  `static/` + `public/` into it).

### Failure mode that produced the original 403

`other` + **empty** entry file = Hostinger runs in **publish mode**: it copies
`apps/web/.next` to `public_html` as static files. No `index.html` at the
`.next` root → `/` returns Hostinger's static **403** ("Access to this
resource on the server is denied!"), `/robots.txt` serves Hostinger's
*default* placeholder, and Runtime Logs stay **empty** despite a green
build. An entry file flips the mode to server: deploy whole repo, run
`node server.js`, proxy to it. Never clear the entry file while the app
type is `other`.

The pin in `packageManager` (`pnpm@10.22.0`, root + `apps/web`) stays — do not
widen it. Hostinger's install step honours it, but its build step has run
pnpm `12.5.1`, which would hard-fail with `ERR_PNPM_BAD_PM_VERSION`. Two
repo-side guards keep that a warning:

- `package.json` (root + `apps/web`): `devEngines.packageManager` =
  `{ name: "pnpm", version: "10.22.0", onFail: "warn" }` — this is the
  channel pnpm ≥11 actually reads (pnpm's own error text names it); pnpm 10
  ignores the field entirely. The root manifest governs when the workspace
  is visible, `apps/web` when Hostinger builds the subdirectory standalone.
- `.npmrc` (root + `apps/web`): `package-manager-strict=false` +
  `package-manager-strict-version=false` — the pnpm ≤10 equivalents.

If it still fails, add hPanel env var `pnpm_config_pm_on_fail=warn`
(Environment → build step receives env vars too). Do **not** use
`--pm-on-fail` CLI overrides: CLI beats `devEngines`, and a CLI
`error` would re-raise the hard failure.

## Environment variables (hPanel → Environment)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://rovotools.com` |
| `NEXT_PUBLIC_APP_NAME` | `RovoTools` |
| `NEXT_PUBLIC_COMPANY_NAME` | `RovoCorp LTD` |

`NEXT_PUBLIC_*` values are baked in at **build** time — after changing one,
trigger a new deployment. Optional ad vars (degrade gracefully, see
`apps/web/.env.example`): `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`,
`NEXT_PUBLIC_ADSENSE_SLOT_ID`, `NEXT_PUBLIC_FUNDING_CHOICES_SRC`.

## Do NOT reuse these values from other projects

| Wrong value | Why it breaks here |
|---|---|
| Root directory `apps/web` | The GitHub import may not accept a monorepo subdirectory here; the working setup is root `./` + output `apps/web/.next` |
| Build command `pnpm run deploy:web` | **No such script exists** in the root `package.json` (the root has `build:web`, but it is for the workspace, not for Hostinger) |
| Output directory `apps/web/out` | The app no longer static-exports — there is no `out/` and no server would start from it |
| Output directory `.next` (with root `./`) | Relative to the monorepo root — the real build output is `apps/web/.next` |
| Package manager `npm` | The runner must use pnpm; the root and `apps/web` both use pnpm |
| `.npmrc` `pm-on-fail=warn` | `pm-on-fail`/`pmOnFail` **is** a real pnpm ≥11 setting, but only via `--pm-on-fail`, env `pnpm_config_pm_on_fail`, or `pnpm-workspace.yaml` — pnpm does not read it from `.npmrc`, so the build still dies on `ERR_PNPM_BAD_PM_VERSION`. The working repo channel is `devEngines.packageManager.onFail` (see Settings above) |
| pnpm resolved to `>=11` | Host corepack `<=0.34` cannot execute pnpm `>=11` — do **not** widen `engines` or re-pin to pnpm 12 (that blesses the crashing combination). See `docs/DEPLOY_SSH.md` support text |

## If install fails with `bin/pnpm.cjs` `MODULE_NOT_FOUND`

The panel resolved pnpm `>=11` despite the repo's `pnpm@10.22.0` pin.
Host corepack `<=0.34` cannot execute pnpm `>=11` — do **not** widen
`engines` or re-pin to pnpm 12 (that blesses the crashing combination).
Use the support text in `docs/DEPLOY_SSH.md`.

## If the site returns 403 or 503

The Node process is not running — either the latest build failed or the app
crashed on start (403 = Hostinger's static edge, nothing is listening;
503 = proxy found the app but it errored). hPanel → **Deployments** → open
the latest deployment: build logs are kept for the last 10 builds, and
**Runtime Logs** show start-phase crashes. Verify, in this order:

1. Build log header: **Entry file** = `server.js` (mode must NOT be
   `publish` — `other` + empty entry publishes `.next` as static files and
   403s everything, see settings section above).
2. Runtime Logs show `Next.js server running on http://0.0.0.0:<port>`
   (from root `server.js`); a missing-BUILD_ID crash means `pnpm run build`
   didn't produce `apps/web/.next` — check the build log.
3. Fallback: `apps/web/.next/standalone/server.js` exists (entry can be
   switched to it; `next.config.ts` emits `output: "standalone"`).

Fix the reported error, redeploy.

## Other deploy routes

- SSH deploy (vendored pnpm): `docs/DEPLOY_SSH.md`
- File Manager static upload (`out.zip` → `public_html`): `docs/DEPLOY_STATIC.md`
