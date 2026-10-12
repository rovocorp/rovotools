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
| Root directory | `apps/web` (monorepo subdirectory — auto-detected on import; **never** `./`) |
| Application type | `next` (auto-detected from `next` in `apps/web/package.json` dependencies) |
| Node.js | `22.x` (from `engines.node`; Hostinger supports 18/20/22/24) |
| Package manager | `pnpm` (auto-detected from `apps/web/pnpm-lock.yaml`) |
| Build script | `build` (= `next build --webpack`; the `--webpack` flag is load-bearing — it is how `next-pwa` regenerates `public/sw.js`) |
| Output directory | `.next` (Hostinger injects `output: "standalone"` itself and starts the bundled server) |
| Entry file | *(leave empty — ignored for `next` apps)* |
| Environment variables | all optional (defaults work); recommended for canonical URLs below |

The repo's `.npmrc` (root + `apps/web`) sets `package-manager-strict=false`
and `package-manager-strict-version=false`: if the panel's runner resolves a
pnpm other than the pinned `10.22.0` (it has run `12.5.1` on the build step
while install used `10.22.0`), pnpm warns instead of aborting the build with
`ERR_PNPM_BAD_PM_VERSION`. The pin in `packageManager` stays — do not widen it.

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
| Root directory `./` | Builds the monorepo root, where Next.js and the pnpm workspace lockfile do not live — framework detection fails or the build can't find `next` |
| Build command `pnpm run deploy:web` | **No such script exists** in the root `package.json` (the root has `build:web`, but it is for the workspace, not for Hostinger) |
| Output directory `apps/web/out` | The app no longer static-exports — there is no `out/` and no server would start from it |
| Package manager `npm` | The runner must use pnpm; `apps/web` is detected via `pnpm-lock.yaml` |
| `.npmrc` `pm-on-fail=warn` | Not a pnpm setting — pnpm prints "unknown setting" and ignores it, so the build still dies on `ERR_PNPM_BAD_PM_VERSION` |
| `devEngines.packageManager` with `onFail: warn` | Valid pnpm syntax but a different check; it does not disable the `packageManager`-field version check that throws `ERR_PNPM_BAD_PM_VERSION` — use `package-manager-strict=false` instead |
| pnpm resolved to `>=11` | Host corepack `<=0.34` cannot execute pnpm `>=11` — do **not** widen `engines` or re-pin to pnpm 12 (that blesses the crashing combination). See `docs/DEPLOY_SSH.md` support text |

## If install fails with `bin/pnpm.cjs` `MODULE_NOT_FOUND`

The panel resolved pnpm `>=11` despite the repo's `pnpm@10.22.0` pin.
Host corepack `<=0.34` cannot execute pnpm `>=11` — do **not** widen
`engines` or re-pin to pnpm 12 (that blesses the crashing combination).
Use the support text in `docs/DEPLOY_SSH.md`.

## If the site returns 503

The Node process is not running — either the latest build failed or the app
crashed on start. hPanel → **Deployments** → open the latest deployment:
build logs are kept for the last 10 builds. Fix the reported error, redeploy.

## Other deploy routes

- SSH deploy (vendored pnpm): `docs/DEPLOY_SSH.md`
- File Manager static upload (`out.zip` → `public_html`): `docs/DEPLOY_STATIC.md`
