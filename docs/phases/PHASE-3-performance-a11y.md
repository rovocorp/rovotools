# PHASE-3 — Performance & Accessibility

Entry: Phase 2 done.

## Perf scope (static export, shared hosting)

- Server vs Client components, `next/dynamic ssr:false` ToolRunner, bundle (<150KB shared JS), `images.unoptimized:true`, `next/font` Inter, AdSense async-only, PWA caches (fonts/images/pages).
- Risks: LCP/INP/CLS/TTFB. See `docs/PERFORMANCE.md`, `PRODUCTION_AUDIT.md`.

## Tasks

1. Audit bundle with `ANALYZE=true`, remove unused deps, code-split heavy tools (PDF/image).
2. Fonts: `display:swap`, precache; images: explicit dimensions; third-party: defer AdSense/analytics.
3. Verify `out/` build, `.htaccess` caching, offline fallback `/offline`.

## A11y scope (see `docs/ACCESSIBILITY_AUDIT.md`)

axe-core `wcag2a+2aa+22aa` 15 routes × light/dark, keyboard, NVDA/VoiceOver, 200% zoom, reduced-motion, contrast, 24px targets, skip-link in `layout.tsx`.

## Exit

LCP<2.5s INP<200ms CLS<0.1, axe clean, manual checklist pass.
