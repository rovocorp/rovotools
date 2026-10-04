---
name: seo-fix
description: Phase 1 technical SEO fixes for RovoTools static-export Next.js. Use after Phase 0 report to fix titles, descriptions, canonicals, robots, sitemap, OG, schema.
---

# SEO Fix (Phase 1)

Precondition: `docs/ROVOTOOLS-BASELINE-AUDIT.md` exists.

## Rules

- Static export only: no `route.ts`, no `redirects()` in `next.config.ts`. Redirects in `apps/web/public/.htaccess`.
- Trailing slash canonicals via `getToolPath`/`getToolUrl` in `packages/tools/src/seo.ts`.
- 10 PDF tools nested canonical `/tools/pdf/<slug>`; flat excluded from `generateStaticParams` in `app/tools/[toolId]/page.tsx`.

## Workflow

1. Read `docs/phases/PHASE-1-technical-seo-fixes.md` + audit §5-7.
2. Fix `getToolPageMetadata()` fallbacks, `seo-copy.ts` decks (extend beyond 34 only with unique copy), per-tool `generateMetadata` keywords/robots/og:url.
3. Validate `sitemap.ts` filters `noIndex`, `robots.txt` Sitemap line, `metadata.ts` metadataBase `https://rovotools.com`.
4. Verify: `pnpm --filter @rovotools/web build`, check `out/sitemap.xml`, `pnpm typecheck && pnpm lint`.
