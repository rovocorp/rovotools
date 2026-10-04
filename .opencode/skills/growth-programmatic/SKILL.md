---
name: growth-programmatic
description: Phases 5-6 monetisation, growth and programmatic SEO for RovoTools. Use for AdSense UX, discovery/share/OG/embeds/analytics and legit landing-page backlog. No thin pages, no fake volumes.
---

# Growth Programmatic (Phases 5-6)

## Monetisation/Growth (Phase 5)

- Ads: `components/ads/AdSenseScript.tsx`, `AdSlot.tsx`, `AdRail.tsx`, `public/ads.txt` pub-8311202559739478. Async, no CLS, no ad/control confusion, mobile safe.
- Growth: `Header.tsx`/`CommandPalette.tsx`/`SearchBar.tsx`, `ToolsExplorer.tsx`/`CategoryNav.tsx`, `RecentTools.tsx`, `getToolUrl` shareables, `deeplinks.ts` Open-in-App, OG `og-image.png`, `PWARegister`/`InstallPrompt`/`PwaUpdatePrompt`, `FeedbackWidget.tsx`.

## Programmatic/Gaps (Phase 6)

- Only unique-function + intent pages (calculator/image/color/dev/SEO/PDF). Each needs full `TOOL_PAGE_COPY` deck + FAQ + HowTo.
- Gaps across Calculators/Developer/Image/Design/Color/PDF/SEO/Finance/Security/Text/QR/Student/Marketing ranked usefulness/intent/complexity/link-value.
- Add flow: `packages/tools/[tool]/index.ts` → validation → calculations → i18n → registry → web/mobile UI (see `README.md`).
