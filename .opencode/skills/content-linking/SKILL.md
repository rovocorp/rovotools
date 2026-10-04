---
name: content-linking
description: Phase 2 content and internal-linking for RovoTools. Use to fix orphans, weak categories, breadcrumbs, FAQs, blog-tool bidirectional links.
---

# Content Linking (Phase 2)

## Graph

Homepage → Category (13 in `categories.ts`) → Tool (~93) → Related → Guide (13 in `lib/blog.ts`).

## Workflow

1. Read `docs/phases/PHASE-2-content-linking.md`.
2. Category pages: `app/tools/category/[category]/page.tsx` + `CATEGORY_COPY` titles/descriptions/keywords.
3. Tool pages: `components/tools/ToolDetail.tsx`, `TOOL_PAGE_COPY` workflows (IMAGE/JSON/PDF_WORKFLOW), ensure ≥3 related tools + related guides.
4. Breadcrumbs: `components/Breadcrumbs.tsx` + BreadcrumbList schema every page.
5. Blog: `lib/blog.ts` `relatedTools[]` must resolve; tool pages link back to guides.
6. Guard `lib/__tests__/seo-lengths.test.ts`. No word-count padding, no thin pages.
