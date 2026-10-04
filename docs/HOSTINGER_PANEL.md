# Hostinger Panel Checklist (copy-paste values)

Use these exact values when configuring this repo in Hostinger's Node.js /
app-deployment flow. Select / type them **manually** — auto-detect fails on
this monorepo (the root `package.json` has no `start` script and Next.js
lives in `apps/web`).

## Settings

| Field | Value |
|---|---|
| Repository | `rovocorp/rovotools` |
| Branch | `main` |
| App root | `./` (monorepo root — never `apps/web`, or workspace resolution breaks) |
| Node.js | `22.x` (matches `.node-version`; `engines` allows `>=20.0.0`) |
| Package manager | `pnpm` (auto-detected from `pnpm-lock.yaml`) |
| Framework preset | `next` |
| Build command | `pnpm run deploy:web` (workspace packages + web static export) |
| Output directory | `apps/web/out` |
| Entry file | *(leave empty — `output: "export"` means there is no server to start)* |
| Environment variables | none required (see below) |

Env vars are only needed when ads go live (all optional, degrade
gracefully): `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`,
`NEXT_PUBLIC_ADSENSE_SLOT_ID`, `NEXT_PUBLIC_FUNDING_CHOICES_SRC`.
Site URL/brand are hardcoded in `packages/config/src/constants.ts`.

## Do NOT reuse these values from other projects

| Wrong value | Why it breaks here |
|---|---|
| Package manager `npm` | npm cannot resolve the 9× `"workspace:*"` deps (`pnpm-workspace.yaml` monorepo) → install fails |
| Build `npm run build` | The root `build` script shells out to `pnpm -r build`, which doesn't exist under npm |
| Output `dist` | `dist/` is only the `tsc` output of the internal `packages/*` libraries — the deployable website is `apps/web/out` |

## If install fails with `bin/pnpm.cjs` `MODULE_NOT_FOUND`

The panel resolved pnpm `>=11` despite the repo's `pnpm@10.22.0` pin.
Host corepack `<=0.34` cannot execute pnpm `>=11` — do **not** widen
`engines` or re-pin to pnpm 12 (that blesses the crashing combination).
Use the support text in `docs/DEPLOY_SSH.md`.

## Other deploy routes

- SSH deploy: `docs/DEPLOY_SSH.md`
- File Manager static upload (`out.zip` → `public_html`): `docs/DEPLOY_STATIC.md`
