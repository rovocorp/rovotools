# PHASE-1 — Technical SEO Fixes

Entry: `docs/ROVOTOOLS-BASELINE-AUDIT.md` Phase 0 complete.

## Scope

- `apps/web/src/app/metadata.ts`, `layout.tsx`, per-tool `generateMetadata`, `sitemap.ts`, `public/robots.txt`, `.htaccess` 301s, favicon/manifest/OG.
- Fix: duplicate titles/descriptions, missing metadata, incorrect canonicals (`trailingSlash:true` → trailing `/`), noindex mistakes, duplicate indexable URLs, missing/malformed schema.

## Tasks

1. Dedupe titles/descriptions using `packages/tools/src/seo.ts:getToolPageMetadata()` + `seo-copy.ts` decks (34) + fallbacks.
2. Verify canonical per tool incl. 10 nested PDF canonicals `/tools/pdf/<slug>`, flat excluded from static params.
3. Validate `sitemap.ts` (~130 URLs: 11 static + 13 categories + ~93 tools + 13 blog), `robots.txt` Allow/Disallow + Sitemap.
4. OG/Twitter `og-image.png` 1200x630 per page, `metadataBase=https://rovotools.com`.
5. Schema: Organization (layout), BreadcrumbList, WebApplication+HowTo+FAQPage (ToolDetail), CollectionPage+ItemList (listing/category), Article (blog).

## Exit

`pnpm build:web` passes, sitemap.xml valid, robots valid, schema validators pass, no duplicate indexables.
