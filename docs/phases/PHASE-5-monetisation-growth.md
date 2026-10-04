# PHASE-5 — Monetisation & Growth

Entry: Phase 4 done.

## Monetisation

- Audit `components/ads/AdSenseScript.tsx`, `AdSlot.tsx`, `AdRail.tsx` (`tool-rail-right`/`blog-rail-right`), `public/ads.txt` (pub-8311202559739478), `app-ads.txt`.
- Rules: async loading, no layout shift, no ad/control confusion, mobile safe, results above fold.
- Consent (done 2026-10-04): granular per-purpose store (`lib/analytics.ts` + `rovotools:consent:v2`, legacy migration), banner = Accept + Customize with Reject all inside settings (`CookieBanner.tsx`), TCF v2 reader (`lib/tcf.ts`), `FundingChoicesScript.tsx` (renders once `NEXT_PUBLIC_FUNDING_CHOICES_SRC` is set from AdSense → Privacy & messaging), ads gate on our advertising flag OR TCF Google vendor consent.

## Growth architecture

- Verify: tool search (`CommandPalette.tsx`, `SearchBar.tsx`), discovery (`ToolsExplorer.tsx`, `CategoryNav.tsx`), trending/popular (`RecentTools.tsx`), shareable URLs (`getToolUrl` + deeplinks `packages/tools/src/deeplinks.ts` "Open in App"), social sharing + OG previews, embeds, backlinks, tool analytics, returning-user (PWA install/update prompts).

## Exit

Ad UX checklist pass, share/OG verified per tool, analytics events firing, PWA install working.
