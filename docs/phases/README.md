# RovoTools Phases — Index

Source: `RovoTools_SEO_Doc.pdf` (Phase 0) + inferred Phases 1-6.
Status: Phase 0 audit-only. Do not modify app files during Phase 0.

## Order

| Phase | File | Goal | Entry | Exit |
|-------|------|------|-------|------|
| 0 | PHASE-0-baseline-audit.md | Complete architecture, SEO & growth audit | Repo access | `docs/ROVOTOOLS-BASELINE-AUDIT.md` with 19 sections |
| 1 | PHASE-1-technical-seo-fixes.md | Fix titles/meta/canonical/robots/sitemap/schema | Phase 0 report | No duplicate/missing metadata, valid schema |
| 2 | PHASE-2-content-linking.md | Home→Category→Tool→Guide graph, FAQs, blog-tool links | Phase 0 report | No orphans, breadcrumbs valid |
| 3 | PHASE-3-performance-a11y.md | LCP/INP/CLS/TTFB + WCAG 2.2 AA | Phase 0 metrics | Budgets met, axe clean |
| 4 | PHASE-4-security-privacy.md | XSS/SSRF/uploads/rate-limit + claim alignment | Phase 0 risks | Risks mitigated, claims truthful |
| 5 | PHASE-5-monetisation-growth.md | AdSense UX + discovery/share/analytics | Phase 0 audit | No ad confusion, share/OG working |
| 6 | PHASE-6-programmatic-gaps.md | Legit landing pages + missing high-value tools | Phase 0 gaps | Prioritized backlog, no thin pages |

## Step-by-step rule

1. Finish previous phase exit criteria before starting next.
2. One phase at a time, small PRs, `pnpm typecheck && pnpm lint`.
3. Static-export constraint: `output:export`, no API routes, redirects in `apps/web/public/.htaccess`.
4. Never invent search volumes. No thin keyword pages.

## Key paths

- Web: `apps/web/src/app/`, `apps/web/src/lib/registry.ts`, `blog.ts`, `seo-copy.ts`, `sitemap.ts`, `metadata.ts`
- Registry: `packages/tools/src/seed.ts`, `catalog.ts`, `categories.ts`, `seo.ts`, `seo-copy.ts`
- Public: `apps/web/public/robots.txt`, `.htaccess`, `manifest.json`, `og-image.png`
