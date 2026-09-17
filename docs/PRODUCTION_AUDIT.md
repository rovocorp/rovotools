# Final Production Audit — RovoTools

> **Ad placements addendum (2026-09-17).** Right sticky rail (xl+ only,
> never a fixed overlay) + one in-flow bottom unit per page (tool-footer on
> tool pages, blog-footer on blog pages, content-bottom on home). Placements
> `tool-rail-right` / `blog-rail-right` in the policy allowlist; `AdSlot`
> rail variant (300px, 600px reserve) + `AdRail` aside that collapses when
> ads are off; consent-gating, CSP, and dev placeholders unchanged in
> behavior.
> Google policy compliance: no overlays/interstitials, no ads on 404 /
> offline / legal pages, labeled units, reserved sizes (no CLS), vendor
> named in cookie/privacy pages, ads.txt + app-ads.txt live with
> pub-8311202559739478. Verified: monetization + AdSlot/AdRail unit tests,
> placement E2E (bottom confined on all page types, rail hidden on mobile),
> axe over new regions, full 5-engine matrix green (1060+).
> Live ads still need publisher + slot IDs in hosting env.
>
> **Element-verification addendum (2026-09-17).** Every element checked
> per industry standards, all executed:
> unit 307 passing (web 65, mobile 55, calculations 71, tools 85,
> localization 13, core 14, theme 4); `pnpm -r lint` + `typecheck` clean;
> prod build 133 pages, zero warnings; **E2E 1060 green: 212 each on
> Chromium, Firefox, mobile-chrome, 210 + 1 skip on WebKit, 211 + 1 skip
> on mobile-safari** (flows, inputs, a11y, API-abuse, SEO, PWA, CSP).
> Real bugs fixed: CSRF proxy check compared against the reconstructed URL
> and denied every same-origin POST on standalone (contact form was dead
> in prod) — now Host-based, unit-tested; `@theme inline` froze themed
> surfaces to light values (entire dark theme broken) — now plain `@theme`;
> honeypot schema contradicted its silent-accept intent (400 instead of
> 200); AdSense could never render (no SDK loader, no ad-unit element) —
> now consent-gated loader + units + tests (publisher/slot IDs still
> needed); `og:image`/`og:site_name` missing on all 15 pages (Next replaces
> openGraph instead of merging) — shared block added everywhere; footer
> social spans, skeleton loaders, file inputs, scrollable regions,
> ~120 contrast spots fixed; E2E suite itself fixed (stray-server reuse,
> hydration races, fixture races, banner overlays, flaky count asserts).
> Local Lighthouse (desktop): perf 0.85, a11y/best-practices/SEO 1.0,
> LCP 3.0s (over 2.5s budget on this loaded box; 160 KB unused JS noted
> for follow-up), CLS 0. `pnpm audit --prod`: 0 critical.
> Still open: AdSense IDs, store credentials/assets (C2), H1 decision,
> M1 scaling, M2 device traces, Maestro, staging Lighthouse + error
> tracking, version bump + commit/tag, manual a11y protocol below.
>
> **Verification addendum (2026-09-16).** Full fix-and-verify pass over the
> whole tree (web + mobile + packages), all executed, not reviewed:
> unit 285 passing (web 53, mobile 53, calculations 71, tools 84,
> localization 13, core 7, theme 4); `pnpm -r lint` and `pnpm -r typecheck`
> clean in all 11 workspaces; `pnpm build:web` green on Next 16.3.3
> (133 static pages, zero warnings, `sw.js` + standalone emitted);
> Playwright **157/157 green on the standalone deploy artifact** (flows,
> inputs, file uploads, PWA stability, ad-slot confinement).
> Fixed this pass: C1 (build verified), H2 (schema already postgres),
> H3-web (E2E implemented, green) + L3 (CI added: `.github/workflows/ci.yml`
> with lint/typecheck/test/build/E2E), Next 16.2.6 → 16.3.3 (both critical
> RCEs + all Next highs resolved; `pnpm audit --prod` now 0 critical,
> 6 high / 2 moderate, all assessed below), themeColor → viewport export,
> mobile PDF screens (16 wrong Button props, missing imports, expo import,
> drawPage/drawImage, mammoth dep, 30 dead imports, Jest RN stubs),
> `saveAndShare` hex/base64 corruption (now unit-tested),
> AdSense "tool not found" client-registry bug (now E2E-covered),
> E2E harness (dedicated port, standalone server, no stray-server reuse,
> hydration race, bespoke-tool exclusions via `customToolSlugs`).
> Deploy note: standalone requires staging `.next/static` + `public` into
> `.next/standalone/apps/web/` (standard Next recipe — not automatic).
> Live artifact probes: full security-header set present, prod CSP has no
> `unsafe-eval`, cross-origin API POST → 403. Remaining blockers: C2 (store
> credentials/assets), H1 (favorites trust decision), M1 (single-instance
> rate limit), M2 (on-device traces), Maestro E2E, Lighthouse-on-staging,
> AdSense IDs (ads correctly disabled until configured), version still
> 0.1.0 with an uncommitted tree. Verdict below is otherwise superseded
> for web: **web is releasable once the tree is committed/tagged**; stores
> are not (C2).
>
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
