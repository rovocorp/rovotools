---
name: seo-audit
description: Phase 0 read-only baseline audit for RovoTools Next.js static-export site. Use for route/tool inventory, metadata, schema, linking, content, perf, a11y, security, privacy checks without modifying app code.
---

# SEO Audit (Phase 0 — Read Only)

Do not modify app files. Read-only: `Read`, `Glob`, `Grep`, `Bash` with non-mutating commands only.

## Workflow

1. Read `docs/phases/PHASE-0-baseline-audit.md` + `RovoTools_SEO_Doc.pdf`.
2. Architecture: `apps/web/next.config.ts` (output:export, trailingSlash, unoptimized), `apps/web/package.json`, `packages/tools/src/{seed,catalog,categories,seo,seo-copy}.ts`, `apps/web/src/lib/{registry,blog,seo-copy}.ts`.
3. Routes: glob `apps/web/src/app/**/page.tsx` (16 expected). Classify Homepage/Tool/Category/Blog/Article/Static. Check `generateMetadata`, canonical (`getToolUrl` trailing `/`), `Breadcrumbs.tsx`.
4. Tools: count `id:` in `catalog.ts` (~89) + 4 in `seed.ts`. Categories: `getAllCategoryMetadata()` (13). Blog: `BLOG_POSTS` (13). Sitemap: `sitemap.ts` (~130 URLs).
5. SEO: `metadata.ts`, `layout.tsx` Organization JSON-LD, `ToolDetail.tsx` WebApplication/HowTo/FAQ, listing CollectionPage/ItemList, blog Article, `public/robots.txt`, `.htaccess` 301s (16).
6. Report to `docs/ROVOTOOLS-BASELINE-AUDIT.md` 19 sections, each issue Severity/Evidence/File/Solution/Complexity. Then stop.
