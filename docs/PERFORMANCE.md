# Performance Audit

## Budgets

- Web LCP < 2.5s · INP < 200ms · CLS < 0.1 (measure with Lighthouse CI on staging)
- Shared JS loaded on tool pages < 150 KB minified (engines are tree-shaken per import)
- Mobile cold start < 2s on mid-range Android; no work before first paint except registry seeding (4 tools, microseconds)

## Web/PWA findings

- ToolRunner (registry + engines + TanStack Query) is `next/dynamic` with
  `ssr: false` + skeleton: shell paints first, interactivity hydrates after.
  Engines execute synchronously on submit (microseconds for current tools).
- Fonts via `next/font` (self-hosted, display=swap). No `<img>` tags; icons
  are SVG/PNG through the manifest pipeline.
- Third-party scripts: AdSense loads only when a publisher ID is configured,
  once, async. No other third-party code.
- Middleware adds negligible latency (header set + Map lookup, no I/O).
- Static generation for tool/category/blog pages; API routes are dynamic.
- Known gap: `next build` is currently blocked by the pre-existing
  Turbopack/next-pwa-webpack conflict (see P20 audit). Bundle budgets cannot
  be measured until that is resolved.

## Mobile findings

- Startup: providers + tab navigator only; registry seeding is 4 object
  literals; no network calls on launch. Heavy work (file pick, share sheet)
  happens only on user action.
- Animations use the native driver (`BottomSheet`) and honor reduced motion.
- Lists are small (FlatList with fixed data); no virtualization debt yet.
- Storage: AsyncStorage holds ID lists only; cache-dir files for exports.
- Known gap: no on-device perf traces yet (measure with Expo devtools +
  Android Studio profiler before release).

## Shared

- Total shared `dist` is ~365 KB unminified including sourcemaps and
  declarations; runtime JS actually shipped per platform is a fraction of
  that, and Metro/Next tree-shake per import.
- Calculation engines are O(1)–O(n) pure functions with no I/O; amortization
  schedules are capped by loan-term validation.
