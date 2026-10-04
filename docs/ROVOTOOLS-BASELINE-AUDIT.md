# ROVOTOOLS BASELINE AUDIT — Phase 0

Date: 2026-10-03. Source: `RovoTools_SEO_Doc.pdf`. Mode: audit-only, no app-code changes in this file.
Repo: `C:\MyFiles\RovoCorp\rovotools` — pnpm monorepo, `apps/web` Next.js 16.3.3 App Router static export, `apps/mobile` Expo.

## 1. Executive Summary

Production Next.js static site (`output:export`, `trailingSlash:true`, `images.unoptimized:true`) with ~92 tools, 13 categories, 13 blog posts, 16 `page.tsx` routes, ~129 sitemap URLs. SEO foundations solid (per-tool metadata, canonicals, sitemap, robots, JSON-LD), but claims, canonical trailing-slash, shared OG image, fallback copy (58/92 tools), and analytics no-op are top gaps.

Counts: routes 16 page files | tools 92 (88 catalog slugs + 4 seed) | categories 13 | blog 13 | sitemap ~129 (11 static + 13 cat + 92 tool + 13 blog) | SEO decks 34/92 | .htaccess 301s 16 | `route.ts` 0.

## 2. Existing Architecture

- `apps/web/next.config.ts:13-24`: `output:export`, `trailingSlash:true`, `images:{unoptimized:true}`, `poweredByHeader:false`, `generateEtags:false`. No Node/DB/API. Redirects in `apps/web/public/.htaccess` (Apache) — correct for static hosting.
- PWA `next-pwa@5.6.0` `dest:public`, `register:false` owned by `components/PWARegister.tsx`, `fallbacks:{document:/offline}`, runtimeCaching fonts/images/pages. `manifest.json`, `sw.js`, `InstallPrompt`, `PwaUpdatePrompt`.
- Styling Tailwind v4 CSS-first (`@import tailwindcss`, `@rovotools/theme/css`), no `tailwind.config`. `postcss.config.mjs` only `@tailwindcss/postcss`.
- TS strict `ES2022`, `bundler`, `noUnusedLocals/Params`, `exactOptionalPropertyTypes`. pnpm 10.22.0, node>=20. ESLint flat + `eslint-config-next:16.3.3`.
- Registry: `packages/tools/src/seed.ts` 4 core (bmi/age/tip/loan) + `catalog.ts` 88 slugs + `categories.ts` 13 + `seo.ts` URL/metadata/sitemap + `seo-copy.ts` 34 decks. `apps/web/src/lib/registry.ts` singleton, `blog.ts` 13 hardcoded posts, `seo-copy.ts` HOME_TITLE/DESCRIPTION length-guarded.
- Evidence: `package.json:9` `build:web=build:packages + filter @rovotools/web`, `apps/web/src/app/` 16 page files, `public/` robots/manifest/ads.txt/og-image.png/pdf.worker.

## 3. Route Inventory

| URL | File | Type | Indexable | Canonical | Metadata | Schema | Breadcrumb | Status |
|-----|------|------|-----------|-----------|----------|--------|------------|--------|
| `/` | `app/page.tsx` | Homepage | yes | `/` (§42) | HOME_TITLE/DESC + OG website | FAQPage + Org | yes | ok |
| `/tools` | `app/tools/page.tsx` | Listing | yes | `/tools` | toolsTitle/Desc + OG | CollectionPage>ItemList(100) | yes | ok |
| `/tools/[toolId]` | `app/tools/[toolId]/page.tsx` | Tool | yes (unless noIndex) | `canonicalPath` no trailing `/` | per-tool title/desc/keywords/OG/Twitter | WebApplication+HowTo+FAQ* | yes via ToolDetail | ok; 10 PDF slugs excluded from params |
| `/tools/pdf/[toolId]` | `app/tools/pdf/[toolId]/page.tsx` | Tool nested | yes | `/tools/pdf/<slug>` | same | same | yes | ok |
| `/tools/category/[category]` | `app/tools/category/[category]/page.tsx` | Category | yes | category path | category title/desc | CollectionPage>ItemList | yes | ok |
| `/blog` | `app/blog/page.tsx` | Blog index | yes | /blog | blog title/desc | — | yes | ok |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Article | yes | `/blog/<slug>` | title=post.title, desc=excerpt, OG article | Article | yes | ok |
| `/about /contact /security /accessibility /cookie-policy /disclaimer /privacy /terms` | `app/<page>/page.tsx` | Static | yes | per-page | per-page | Org only | yes | ok |
| `/offline` | `app/offline/page.tsx:8-12` | Offline shell | **no** `index:false,follow:false` | none | offline title/desc | none | no | ok (correct) |
| API/Admin/Auth/Dynamic | — | — | n/a | — | — | — | — | none; 0 `route.ts`, no auth/admin routes |

Total page files: 16 (verified glob).

## 4. Tool Inventory

- Total 92: `catalog.ts` 88 `slug:` (0 dups) + `seed.ts` 4 LOCAL `requiresNetwork:false`. Categories 13: pdf/image/developer/text/security/design/color/qr/calculator/finance/seo/validator/formatter (`categories.ts:12-78`).
- Per-tool: slug/route/category/component (`ToolDetail` shared)/description/SEO title/desc/H1 (`display.name`)/FAQ (`seo-copy` faqs)/related (deck.related else `registry.related(id,3)`)/guides (blog `relatedTools`)/processing (`processingMode` + `requiresNetwork`)/share (`buildCustomSchemeUrl` Open-in-App + Web Share in runner)/download/copy (runner buttons).
- Processing: default LOCAL `requiresNetwork:false` (`catalog.ts:3390-3409`); ≥1 SERVER/network tool (`catalog.ts:2574 requiresNetwork:true`, `youtube-thumbnail-downloader.test.ts:18`). `ToolDetail.tsx:34` `runsLocally = LOCAL && !requiresNetwork`.
- Gaps: 58/92 tools fallback generated copy (only 34 decks); `validator`/`formatter` categories thin (1-line descriptions); no duplicate slugs; no broken registry refs found; orphan risk needs crawl (see §8).

## 5. SEO Audit

- Titles/descriptions: homepage + listing + per-tool via `getToolPageMetadata()` deck→seo→fallback (`seo.ts:69-99`). No mass duplicates observed in code; risk is thin fallback for 58 tools — Medium.
- Canonicals: per-tool `alternates.canonical = canonicalPath` (`[toolId]/page.tsx:25`) without trailing `/` while `trailingSlash:true` serves `/slug/` — mismatch risk — Medium (`seo.ts:32-46`, `next.config.ts:16`).
- Robots: page-level `noIndex` respected (`:26`, `seo.ts:101-107` sitemap filters noIndex, 0 noIndex in catalog today); `/offline` correctly noindex; `public/robots.txt`: `Allow:/ Disallow:/api/ Sitemap:https://rovotools.com/sitemap.xml` — ok, minimal.
- Sitemap `sitemap.ts:10-52` force-static: 11 static + 13 cat + ~92 tool + 13 blog ≈129, `lastModified:now` (all URLs same timestamp — Low), priorities 1/0.9/0.85/0.8/0.7-0.3 sane.
- OG/Twitter: shared `/og-image.png` 1200×630 everywhere, no per-tool images — Medium for CTR/share.
- Favicon/manifest: `metadata.ts:51-61` ico/svg/32/16/192 + apple-touch + `/manifest.json` — ok. `metadataBase=https://rovotools.com` — ok.

## 6. Metadata Audit

- Site: `metadata.ts:7-62` default/template `%s | RovoTools`, description from `seo.siteDescription`, OG website/en, Twitter summary_large_image, `robots:{index:true,follow:true}`, adaptive `themeColor` in viewport — ok.
- Tool: title/desc/keywords[]/canonical/robots-if-noIndex/OG url=canonicalUrl else path/Twitter — ok, but `keywords.split(,)` and shared OG image limit.
- Blog article: title=post.title, desc=excerpt, canonical, OG article — ok.
- Issues: (1) canonical missing trailing slash — Medium; (2) no per-page `authors/publishedTime` on articles — Low; (3) `SOCIAL_LINKS href:""` in `packages/config/constants.ts` — Low (empty social profiles).

## 7. Structured Data Audit

Present (9 `ld+json` hits, `</` escaped): Organization (`layout.tsx:53-57`, minimal name+url — missing logo/sameAs — Low), BreadcrumbList (`Breadcrumbs.tsx:27`), WebApplication + HowTo always + FAQPage if faqs (`ToolDetail.tsx:77-81`), CollectionPage>ItemList tools (limit 100 — covers 92 — ok) + category, Article (blog), FAQPage home.
Missing/malformed: no `WebSite` + `SearchAction` schema — Medium (site search exists via CommandPalette but not exposed to Google); WebApplication missing `offers.priceCurrency`, `operatingSystem` ok; HowTo emitted even when `howTo=[]`? — verify (Low); Organization should add `logo`, `sameAs` when socials real.

## 8. Internal Linking Audit

Graph implemented: Home (`CategoryNav`, `RecentTools`, `ToolsExplorer`) → Category → Tool (`Badge` category link + `ToolDetail` related + workflow IMAGE/JSON/PDF_WORKFLOW) → Guide (blog `relatedTools` → `ToolCard`).
- Strengths: breadcrumbs every public page, 16 `.htaccess` 301s preserve legacy/equity, blog→tool links real slugs.
- Risks: (1) tool→guide backlinks only if deck/blog references exist — 58 fallback tools may lack guides — Medium; (2) `validator`/`formatter` weak hubs — Medium; (3) `ToolsExplorer` client filter via `useSearchParams` + `Suspense` — crawlable fallback is static grid? verify — Low; (4) excessive footer/nav links not observed; broken-link sweep needs CI link-check — Low.

## 9. Content Audit

- Homepage `page.tsx:37-59` + WHY grid + category/tool sections — useful, not padded.
- Category `CATEGORY_COPY` 1-2 sentences each; pdf/image/dev/calculator/finance/seo strong, validator/formatter 1-liners — Medium thin.
- Tool: `intro/benefits/howTo/faqs/related/workflow` for 34 decks; rest generated from spec — unique but thin — Medium. No word-count stuffing observed — good.
- Blog 13 posts × 5-6 paras, excerpts real, `relatedTools` valid (bmi/loan/tip/iscohort) — useful. Tool↔article coverage only ~13 tools — Medium gap (see §16).

## 10. Performance Audit

- Positives: static export (no TTFB server), `next/dynamic ssr:false` ToolRunner, `next/font` Inter, AdSense/analytics consent-gated async (`ads.ts:26-28`, `analytics.ts:113-118` no-op until granted), PWA caches, `docs/PERFORMANCE.md` budgets LCP<2.5/INP<200/CLS<0.1/JS<150KB.
- Risks: (1) `images.unoptimized:true` — no AVIF/WebP responsive serving despite `formats` — Medium (LCP on image tools); (2) single shared OG PNG + `icon-*.png` unoptimized — Low; (3) `pdf.worker.min.mjs` + heavy PDF/image libs code-split? verify chunks — Medium; (4) `StaleWhileRevalidate` pages-cache 30/7d + fonts 1y — ok; (5) `ANALYZE=true` bundle check not in CI — Low.
- No edits made; recommend LHCI + `out/` size check in Phase 3.

## 11. Accessibility Audit

- Positives: `layout.tsx:58-63` skip-link, `main#main-content`, `sr-only` brand, `aria-hidden` icons, focus styles, `docs/ACCESSIBILITY_AUDIT.md` axe `wcag2a+2aa+22aa` 15 routes×light/dark green 2026-09-17.
- Gaps to verify: heading order in `ToolDetail` (H1 + workflow titles), form labels in runners, contrast in dark `zinc` + badges, 24px targets, `CommandPalette` dialog focus-trap, 200% zoom, reduced-motion — Low/Medium pending manual pass in Phase 3.

## 12. Security Audit (no exploitation)

- Surface: static, 0 API routes, no uploads to server; file flows client-side. `dangerouslySetInnerHTML` only for JSON-LD with `JSON.stringify(...).replace(/</g,\\u003c)` — safe pattern — ok.
- Focus tools: `youtube-thumbnail-downloader` (`requiresNetwork:true`) fetches external URLs — SSRF/proxy abuse if server-side? Verify it is client `fetch` + URL allowlist — **High to verify**.
- Image/PDF/dev tools: SVG/malicious file parsing locally — XSS via rendered SVG/HTML preview? Verify sanitization — Medium.
- Secrets: `NEXT_PUBLIC_*` AdSense IDs public by design; no private keys in `config/constants.ts` (`WEB_URL`, brand) — ok. `pnpm audit --prod` exceptions in `SECURITY_EXCEPTIONS.md` (xlsx/serialize-javascript/image-size/deepmerge/uuid) build-time only — ok. Rate-limit n/a (no backend); abuse = hotlinking — Low via CDN/.htaccess.

## 13. Privacy Audit

- Reality: mostly `LOCAL` offline-capable (`catalog.ts:3409 tags:[...,local]`); ≥1 network tool + AdSense/analytics third-party when consented.
- Claims mismatch: `Header.tsx:249` "All tools run in your browser — your files never leave your device." vs `ToolDetail.tsx:131-138` "processed locally whenever supported… Only data required for that step leaves your device" + blog "nothing leaves" for BMI/finance/base64/JSON — **High**: header absolute claim contradicted by network-tool + ads/analytics + hybrid wording. Fix to "most tools run locally; network tools labelled; ads/analytics only with consent".
- Consent: `CookieBanner`, `shouldLoadAds`+`trackEvent` gated on `granted`, withdraw via footer — good.

## 14. Monetisation Audit

- Impl: `AdSenseScript` (SDK only if publisher+consent), `AdSlot`/`AdRail` null when disabled, `tool-rail-right`/`blog-rail-right` sticky xl+ + bottom unit, `ads.txt` `pub-8311202559739478` — good, async, no CLS reserve? verify `min-height` — Low.
- UX risks: Low observed; ensure results above fold on mobile, no ad adjacent to Download/Copy buttons causing mis-tap — Medium to verify on device. `app-ads.txt` present for mobile — ok.

## 15. Growth Audit

- Exists: search (`CommandPalette`, `SearchBar`), discovery (`ToolsExplorer`, `CategoryNav`), trending/popular (`RecentTools`, `popular` badge), shareables (`getToolUrl` + `buildCustomSchemeUrl` Open-in-App), social OG (shared image), PWA install/update, `FeedbackWidget`, `CookieBanner`.
- Missing/weak: analytics provider no-op (`analytics.ts:102-106` default no-op, `trackEvent` gated) — no dashboards — High; OG previews generic (no per-tool) — Medium; no embeds/backlink kit, no public changelog/RSS, `SOCIAL_LINKS` empty — Medium; no returning-user history beyond RecentTools/localStorage — Low.

## 16. Programmatic SEO Opportunities

Legit only (unique function + intent): calculator variants (loan/compound/tax/adsense — have decks), image compress/resize/convert workflows (have), color convert/contrast/palette (have 2 decks, add HEX→RGB/RGB→HSL pages only if distinct UI), dev JSON/base64/JWT (have), SEO meta/robots/sitemap/serp/schema/OG (have 7 decks), PDF 10 nested (have). Do NOT bulk thin pages.
New legit candidates (need distinct functionality): unit-converter sub-pages, age/date-difference, word-counter sub-modes, QR WiFi/vCard (already qr category), password/hash explainers — each needs full deck + FAQ + HowTo.

## 17. Missing Features (high-value, no fake volumes)

Ranked usefulness/intent/complexity/link-value: (1) Unit/length/weight/temp converter depth — High/Med; (2) Invoice/EMI amortization table export — High/Med; (3) Image WebP/AVIF + bulk compress — High/Med; (4) PDF protect/unlock/rotate/extract-text — High/Med; (5) JSON→CSV/YAML, Regex tester depth — Med/Low; (6) Student (GPA, citation) + Marketing (UTM already, hashtag) — Med/Low; (7) Validator/formatter hub expansion — Med/Low. All need privacy-local first.

## 18. Technical Debt

- Canonical trailing-slash (`seo.ts:32-46` vs `trailingSlash:true`) — Med/Low effort.
- 58 fallback copy decks — Med.
- Shared OG image + missing WebSite schema + Org logo/sameAs — Low.
- `images.unoptimized` + PDF worker chunking + LHCI in CI — Med.
- `SOCIAL_LINKS` empty, analytics no-op, no RSS/embeds — Low/Med.
- Turbopack/`next-pwa` build conflict note in `PERFORMANCE.md` (blocked `next build`) — verify current `build:web` — Med.

## 19. Recommended Priority Order

1. [Critical] Verify `youtube-thumbnail-downloader`/network tools: client-only + allowlist + sanitization — `catalog.ts:2574`, `privacy.ts`, runner. (½-1d)
2. [High] Fix privacy claim: header absolute → nuanced + per-tool badges already (`ToolDetail:104-110` requiresInternet) — `Header.tsx:249`. (1h)
3. [High] Canonical trailing-slash alignment + sitemap `lastModified` per-file + verify `out/sitemap.xml` — `seo.ts`, `sitemap.ts`, `[toolId]/page.tsx:25`. (½d)
4. [High] Wire analytics provider (privacy-safe, consent-gated) or remove dead code — `analytics.ts:97-118`. (½d)
5. [Medium] 58 fallback decks: prioritize validator/formatter + top-traffic tools with unique FAQs — `seo-copy.ts`. (1-2w iterative)
6. [Medium] Per-tool OG (or category OG) + WebSite/SearchAction + Org logo/sameAs. (1d)
7. [Medium] Image perf: responsive `sizes` + preloading + PDF lazy chunks + LHCI CI. (2-3d)
8. [Medium] Tool↔guide coverage: every category ≥2 guides; related-tools fallback audit. (1w)
9. [Low] Validator/formatter hubs, SOCIAL_LINKS/RSS/embeds, `.htaccess` cache headers. (1w)
10. [Low] A11y manual pass (NVDA/VoiceOver/keyboard/zoom/motion) + link-checker CI. (2d)

Final: routes 16 | tools 92 | categories 13 | blog 13 | SEO issues 6 | perf 4 | security 2 to verify | privacy 1 high | growth 4 | top-10 above. Stop — await approval for Phase 1.
