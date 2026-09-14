# Final Production Audit — RovoTools

> **Remediation addendum (2026-09-12).** The web gaps found in the September
> verification have been fixed: tool catalog 4 → 55 real client-side tools
> across 18 categories (pdf, image, document, developer, text, security,
> design, color, qr, calculator, finance, seo, utility, converter, analytics,
> validator, formatter, other), every category populated, homepage
> headline/CTAs/Why-cards per spec, global nav (Home/Tools/Categories/Blog/
> Search/Ctrl+K/theme incl. mobile) + full footer (Tools/Company/Legal/social
> placeholders/Powered by RovoCorp LTD), contact page + Zod APIs
> (/api/contact, /api/feedback), cookie consent + analytics abstraction,
> feedback widget, fuzzy Ctrl+K palette, recents UI, copy/download/reset on
> every tool, QR previews, 13-post blog, 8 trust/SEO pages, Prisma on
> PostgreSQL (+Feedback/ContactMessage/ToolUsage), env + ads.txt documented,
> `next build --webpack` + `babel-loader` fixed (102 static pages, sw.js
> emitted). Baselines now: tools 32, calculations 71, web 39, mobile 41
> passing; web + mobile typecheck + lint clean. Remaining from below: C2
> (store signing/assets), H1 (accepted best-effort design), H3 (E2E still
> planned), M1/M2/M4–M6, L1/L3. Heavy file-based PDF ops (merge/split/
> compress) remain planned rather than faked — Text-to-PDF ships and works.

**Verdict: NOT production-ready.** Two critical blockers prevent release.
No fake implementations were added to hide this; gaps are listed plainly.

Verification baseline (all green): 205 tests passing — calculations 71,
web 39, mobile 41, tools 30, localization 13, core 7, theme 4. Web + mobile
`typecheck` and `lint` clean. All shared packages build.

## CRITICAL

### C1 — Web production build is broken
- **Problem:** `next build` fails. Next 16 defaults to Turbopack while
  `next-pwa` injects a webpack config; forcing `--webpack` then fails on a
  missing `babel-loader`.
- **Impact:** No production web/PWA builds, no deploy, no service-worker
  generation, no measurable bundle budgets.
- **Fix:** Either add `babel-loader` + pin `next build --webpack`, or replace
  `next-pwa` with a Turbopack-compatible worker (e.g. Serwist).
- **Files:** `apps/web/package.json`, `apps/web/next.config.ts`.
- **Verify:** `pnpm --filter @rovotools/web build` succeeds and emits `sw.js`.

### C2 — Release signing and store assets are placeholders
- **Problem:** EAS project ID, Apple IDs/team, Play service-account path,
  `assetlinks.json` fingerprint, AASA team ID, and all mobile artwork are
  placeholders.
- **Impact:** Cannot submit to either store; verified links will not activate.
- **Fix:** Fill from App Store Connect / Play Console / EAS; commission final
  brand art; follow `apps/mobile/STORE_READINESS.md`.
- **Files:** `apps/mobile/eas.json`, `app.json`, `assets/*`,
  `apps/web/public/.well-known/*`.
- **Verify:** staging submission to internal track + TestFlight.

## HIGH

### H1 — Favorites sync trusts client device IDs
- **Problem:** Any caller can read/overwrite any `deviceId` bucket.
- **Impact:** Low-sensitivity (tool IDs) but cross-user tampering is possible.
- **Fix:** Accept as best-effort cache (current design) or add auth; do not
  store anything sensitive there — enforced.
- **Files:** `apps/web/src/app/api/favorites/route.ts`.
- **Verify:** Threat review before enabling server sync in production.

### H2 — Prisma targets sqlite
- **Problem:** `schema.prisma` uses the sqlite provider; serverless/Postgres
  deploys will fail.
- **Fix:** Make the provider environment-driven or document sqlite-only
  deployment with a persistent volume.
- **Files:** `apps/web/prisma/schema.prisma`.
- **Verify:** `prisma migrate deploy` on target infrastructure.

### H3 — No end-to-end tests yet
- **Problem:** Playwright/Maestro suites from `docs/TESTING.md` are planned,
  not implemented. UI rows (reset/copy/export/offline/themes/a11y) are
  unverified on real devices and browsers.
- **Fix:** Implement the E2E plan before release.
- **Verify:** CI runs E2E green on Android emulator + iOS simulator + Chromium.

### H4 — Service-worker output unverified
- **Problem:** Cache-safety claims rest on config review; the generated
  worker was never inspected (blocked by C1).
- **Fix:** After C1, inspect precache manifest and exercise the offline flow.
- **Verify:** Offline tool run with network disabled serves shell, never API.

## MEDIUM

- **M1 — In-memory API rate limiter is single-instance.** Move to edge KV
  when scaling horizontally. (`apps/web/src/lib/security.ts`)
- **M2 — Mobile perf traces unmeasured.** Budgets in `docs/PERFORMANCE.md`;
  profile on-device before release.
- **M3 — No authentication exists.** Correct per design (no accounts), but
  revisit if server sync, sync-across-devices, or AdMob identity arrives.
  Token pattern is reserved: SecureStore only.
- **M4 — Accessibility proven by labels only.** Needs axe + screen-reader
  passes (covered by H3).
- **M5 — `@types/react-native@0.73.0` vs RN 0.76.** Type drift risk;
  contained by `skipLibCheck`. Upgrade when available.
- **M6 — Unused mobile Header/Footer components remain.** Migrated to tokens
  but unmounted; delete or wire up.

## LOW

- **L1 — `sitemap.lastModified` always returns build time.** Harmless;
  wire real content mtimes later.
- **L2 — `app-ads.txt` and AdSense slot IDs are placeholders.** Required
  before monetization, irrelevant before.
- **L3 — Console ban is lint-enforced but has no CI gate yet.** Wire lint
  into CI.

## What is genuinely ready

Architecture, shared packages, registry, calculations, security headers,
privacy model, theme system, localization, deep links, offline behavior,
file handling, permissions, localization catalogs, test vectors, and store
configuration are implemented, tested (205 passing), and typechecked.
