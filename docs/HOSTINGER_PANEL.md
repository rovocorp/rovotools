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
| Application type | `other` **+ entry file** (preferred), or `next` if the hPanel framework dropdown offers it — see below |
| Node.js | `22.x` (from `engines.node`; Hostinger supports 18/20/22/24) |
| Package manager | `pnpm` |
| Build script | `build` (root script → `pnpm build:web`; the `--webpack` flag inside `apps/web` is load-bearing — it is how `next-pwa` regenerates `public/sw.js`) |
| Output directory | `apps/web/.next` (relative to root `./`; ignored when the entry file below is set) |
| Entry file | `apps/web/.next/standalone/server.js` (only for Application type `other`; leave empty for `next`) |
| Environment variables | all optional (defaults work); recommended for canonical URLs below |

### Why `other` + entry file (not the `next` preset)

hPanel's framework dropdown does not always list Next.js (auto-detection ran
once at import, before the root manifest declared `next`, and the value sticks
as `Other`). Two working shapes:

1. **`other` + entry file (current, verified):** Hostinger deploys the whole
   repo and runs `node apps/web/.next/standalone/server.js`. The generated
   server does `process.chdir(__dirname)` first, so the path works from the
   repo root. `apps/web/next.config.ts` emits `output: "standalone"` with
   `outputFileTracingRoot` pinned to `apps/web`, and the `postbuild` hook
   copies `.next/static` + `public/` into `standalone/` (the `next` preset
   does this for you; `other` does not — without it every page loads with
   404 JS/CSS).
2. **`next` preset:** set Application type to Next.js if the dropdown offers
   it (or re-import the repo now that the root manifest declares `next`).
   Entry file stays empty; output stays `apps/web/.next`.

### Application type `other` with NO entry file = static 403

With `other` and an empty entry file, Hostinger runs in **publish mode**:
it copies `apps/web/.next` to `public_html` as static files. There is no
`index.html` at the `.next` root, so `/` returns Hostinger's static
**403** ("Access to this resource on the server is denied!"), `/robots.txt`
serves Hostinger's *default* placeholder, and Runtime Logs stay **empty**
despite a green build. That is the bug this file exists to prevent.

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

1. Build log header: **Entry file** = `apps/web/.next/standalone/server.js`
   (mode must NOT be `publish` — `other` + empty entry publishes `.next` as
   static files and 403s everything, see settings section above).
2. `apps/web/.next/standalone/server.js` exists in the build output
   (`next.config.ts` sets `output: "standalone"` + `outputFileTracingRoot`).
3. Runtime Logs show `▲ Next.js … ✓ Ready` after "Restarting Node.js server".

Fix the reported error, redeploy.

## Other deploy routes

- SSH deploy (vendored pnpm): `docs/DEPLOY_SSH.md`
- File Manager static upload (`out.zip` → `public_html`): `docs/DEPLOY_STATIC.md`
