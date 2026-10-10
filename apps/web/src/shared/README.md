# Shared code (vendored for Hostinger self-containment)

This directory contains **copies** of the monorepo workspace packages, so that
`apps/web` builds and runs standalone when Hostinger deploys only the
`apps/web` directory (no repo root, no `packages/*`, no root lockfile):

| Directory | Copied from | Notes |
|---|---|---|
| `calculations/` | `packages/calculations/src` | Pure calculation engines |
| `config/` | `packages/config/src` | Brand constants; `WEB_URL` is env-driven here (see below) |
| `core/` | `packages/core/src` | Result/error primitives, rate limiter |
| `localization/` | `packages/localization/src` | i18n strings (`en`, `ar`, `ur`) |
| `theme/` | `packages/theme/src` + `packages/theme/css/tokens.css` | Design tokens; only the CSS is imported by the web app |
| `tools/` | `packages/tools/src` | Tool registry, catalog, SEO copy |
| `types/` | `packages/types/src` | Shared TypeScript types |
| `validation/` | `packages/validation/src` | Input validation (zod) |

Not copied: `packages/ui` (the web app never imports it).

## Rules

- **Source of truth stays in `packages/*`.** `apps/mobile` keeps using the
  workspace packages. If you change a package, mirror the change here (or
  re-copy the package directory) so the web app does not drift.
- **No imports outside `apps/web`.** Everything here must resolve within this
  directory tree (`@/` maps to `apps/web/src`). Never reintroduce
  `@rovotools/*` or `../../packages` imports.
- `WEB_URL` here reads `NEXT_PUBLIC_SITE_URL` (default
  `http://localhost:3000`); the workspace original hardcodes the production
  domain. Keep that difference when re-copying `config/`.
