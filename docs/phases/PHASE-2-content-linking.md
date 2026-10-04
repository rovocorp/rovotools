# PHASE-2 — Content & Internal Linking

Entry: Phase 1 done.

## Scope

Graph: Homepage → Category (13) → Tool (~93) → Related Tool → Guide (13 blog posts in `lib/blog.ts`).

## Tasks

1. Strengthen weak category pages (`packages/tools/src/categories.ts` copy + `app/tools/category/[category]/page.tsx`).
2. Ensure every tool has related tools + related guides (`ToolDetail.tsx`, `seo-copy.ts` workflows).
3. Fix orphans (tools with zero inbound), weak breadcrumbs (`components/Breadcrumbs.tsx`), excessive/broken links.
4. Tool copy: intro/how-to/benefits/FAQs unique, no word-count padding. Blog↔tool bidirectional links (`relatedTools`).
5. Guard lengths: `lib/__tests__/seo-lengths.test.ts` for HOME_TITLE/DESCRIPTION.

## Exit

No orphans, every tool ≥3 related links, breadcrumbs + ItemList schema on all pages, no broken internals.
