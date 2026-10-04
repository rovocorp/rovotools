# PHASE-0 — Baseline Audit (Audit Only)

> Source: `RovoTools_SEO_Doc.pdf` §1-16. DO NOT modify, delete, rename or rewrite application files.

## Tasks

1. Inspect: package.json, lock, next.config.ts (`output:export`, `trailingSlash:true`, `images.unoptimized:true`), tsconfig, eslint, tailwind v4 CSS-first, app/ (no pages/), components, lib, hooks, public/, PWA, analytics, AdSense, blog, tool/category registry.
2. Route inventory: every `page.tsx` (16) — URL, file, type, indexable, canonical, metadata, schema, breadcrumbs, internal links, status.
3. Tool inventory: ~93 tools (4 seed + 89 catalog), 13 categories, per-tool slug/route/category/component/title/desc/H1/FAQ/related/processing model/share/download/copy. Flag duplicates/orphans/broken/missing.
4. Technical SEO: titles, descriptions, canonicals, robots, robots.txt, sitemap.xml, OG/Twitter, favicon.
5. Structured data: WebSite/Organization/WebApplication/Breadcrumb/Article/FAQ/ItemList — missing/malformed.
6. Internal linking: Home→Category→Tool→Related→Guide. Orphans, weak categories, missing related, breadcrumbs, broken links.
7. Content: homepage/category/tool/how-to/FAQ/blog — useful vs thin. No word-count padding.
8. Performance: Server vs Client components, bundle, images, fonts, third-party, AdSense, hydration — LCP/INP/CLS/TTFB risks.
9. Accessibility: semantics, headings, labels, keyboard, focus, contrast, ARIA, mobile.
10. Security: XSS/unsafe HTML/URL/SSRF/uploads/SVG/traversal/API abuse/rate-limit/secrets. Focus: analyzer, SEO checker, image/PDF/URL/dev tools. No exploitation.
11. Privacy: local vs server vs third-party per tool vs claims (e.g. "never leave device").
12. Monetisation: AdSense placement/loading/mobile/result positioning/accidental confusion.
13. Growth: search/discovery/trending/popular/shareable URLs/social/OG/backlinks/embeds/analytics/returning users.
14. Programmatic: legit calculator/image/color/dev/SEO/PDF pages only where intent + unique function.
15. Gaps: missing tools in Calculators/Developer/Image/Design/Color/PDF/SEO/Finance/Security/Text/QR/Student/Marketing ranked by usefulness/intent/complexity/link-value, no fake volumes.

## Output

`docs/ROVOTOOLS-BASELINE-AUDIT.md` with 19 sections:
Executive Summary, Architecture, Route/Tool Inventory, SEO, Metadata, Structured Data, Internal Linking, Content, Performance, Accessibility, Security, Privacy, Monetisation, Growth, Programmatic, Missing Features, Technical Debt, Priority Order.
Each issue: Severity / Evidence / File / Solution / Complexity.

## Exit

Report committed. Counts reported: routes, tools, categories, blog posts, SEO/perf/security/privacy issues, growth ops, top-10 priorities. Stop, do not auto-start Phase 1.
