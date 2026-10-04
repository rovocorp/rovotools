---
name: perf-a11y
description: Phase 3 performance and accessibility for RovoTools. Use for LCP/INP/CLS/TTFB budgets, bundle, fonts, images, AdSense, axe-core WCAG 2.2 AA.
---

# Perf A11y (Phase 3)

Refs: `docs/PERFORMANCE.md`, `docs/ACCESSIBILITY_AUDIT.md`, `docs/PRODUCTION_AUDIT.md`.

## Perf

- Budgets: LCP<2.5s, INP<200ms, CLS<0.1, shared JS<150KB, mobile cold start<2s.
- `next/dynamic ssr:false` ToolRunner, `next/font` Inter `display:swap`, `images.unoptimized:true` + explicit dims, AdSense/analytics async/defer, PWA `runtimeCaching` fonts/images/pages, offline `/offline`.
- Commands: `ANALYZE=true pnpm --filter @rovotools/web build`, `@lhci/cli`, `pnpm typecheck`.

## A11y

- axe-core `wcag2a+wcag2aa+wcag22aa` 15 routes × light/dark + dialogs, `layout.tsx` skip-link, semantics/headings/labels/keyboard/focus/contrast/ARIA/24px targets/200% zoom/reduced-motion.
- Manual: keyboard-only, NVDA + VoiceOver.
