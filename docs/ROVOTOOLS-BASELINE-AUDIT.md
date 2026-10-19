# ROVOTOOLS BASELINE AUDIT — Phase 0 (2026-10-19 refresh)

Supersedes the 2026-10-03 report: the site was migrated from static export to **SSR standalone on Hostinger Node**, and an AdSense content-depth pass + SEO fixes landed (commits 3b85074..dfe9e03). Basis: repo @ `dfe9e03` + live checks against `https://rovotools.com` on 2026-10-19. Note: `RovoTools_SEO_Doc.pdf` could not be read by the auditing model (no PDF input) — audit is code + live verified.

## 0. Post-fix status (working tree, 2026-10-19)

The Phase 0 findings below describe the baseline at `dfe9e03`. The following fixes have since been implemented and verified with `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build:web`:

- **Indexable tools 63 → 80**; noIndex tools 40 → 23. 17 hand-written decks added (url-decoder, case-converter, color-converter, color-contrast-checker, timestamp-converter, json-to-yaml, yaml-to-json, code-minifier, average-calculator, date-formatter, number-formatter, text-cleaner, css-gradient-generator, image-cropper, meta-tag-generator, keyword-density-checker, slug-generator).
- **Sitemap 94 → 111 URLs** (11 static + 13 categories + 80 tools + 7 blog). The 17 new tools are present; the remaining noIndex tools are absent.
- **noIndex + follow**: hidden tools/posts now emit `robots: { index: false, follow: true }` instead of `nofollow`.
- **ItemList matches the sitemap**: filtered to indexable entries and the `limit: 100` cap removed (it was truncating XML Sitemap Checker, YAML to JSON and YouTube Thumbnail from the 103-tool registry). `/tools/` now lists 80 items.
- **Titles**: 4 over-long titles trimmed; new decks stay ≤52 chars pre-suffix.
- **robots.txt**: `Crawl-delay` removed.
- **Measurement hooks**: GSC/Bing verification read from env; consent-gated GA4 loader + gtag event forwarding; IndexNow workflow (manual dispatch); RSS feed at `/feed.xml` (7 indexable posts) advertised on `/blog/`.
- **Vendor drift**: `apps/web/src/shared/tools` is the source of truth; `scripts/sync-shared-tools.mjs` (with `--check`) copies into `packages/tools/src`, and CI runs the check.
- **Still pending**: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` on Hostinger; deploy; run the IndexNow workflow and submit the sitemap in GSC; 7 thin blog posts remain noIndex; per-tool OG images and per-URL sitemap dates are still open.

## 1. Executive Summary

Next.js 16 SSR (`output:"standalone"`, webpack-pinned for next-pwa) deployed on Hostinger Node; legacy 301s in `next.config.ts` (17 rules), no `.htaccess`. SEO foundations are solid and verified live: single-suffix titles, trailing-slash canonicals, 308 normalization, 94-URL sitemap, full JSON-LD (Organization/WebSite/WebApplication/Offer/HowTo/FAQPage/BreadcrumbList/CollectionPage/ItemList/Article), robots.txt, 27KB IndexNow key.

Counts: routes 16 `page.tsx` | tools **103** (99 catalog + 4 seed) | indexable tools **63** | noIndex tools **40** | categories 13 (all indexable) | blog 14 (**7 indexable**, 7 noIndex) | redirects 17 | live sitemap **94 URLs** | indexing: confirmed (site: search returns tools/blog/static).

Ranking check (external, 2026-10-19): brand query resolves to homepage; two head terms tested ("word unscrambler free online", "adsense earnings calculator") → **not in top 10** (expected for site age/authority). SERP snippets still show pre-Oct-15 stale titles (`… | RovoTools | RovoTools`) from cache. Biggest blockers: **no measurement** (GSC verification empty, analytics provider is a no-op) and **47 helper pages hidden by noIndex** (40 tools + 7 posts).

## 2. Architecture

- `apps/web/next.config.ts:34-90` SSR `output:"standalone"`, `outputFileTracingRoot=here`, `trailingSlash:true`, `images.unoptimized:true`, `poweredByHeader:false`, 17 permanent redirects in config (Apache `.htaccess` deliberately removed — Hostinger auto-generates one; re-adding breaks the domain, see comment `:26-33`).
- PWA `next-pwa` requires `--webpack` (documented in `:13-23`); claim/jobs handled by `apps/web/package.json:43-44` (`build`, `postbuild` copies standalone assets).
- **Vendored shared code**: `apps/web/src/shared/tools/*` (catalog/seo/seo-copy/categories) is a self-contained copy of `packages/tools/src/*` (needed for standalone tracing). They have **drifted**: 40 `noIndex:true` + deck changes exist only in the web copy. `packages/tools/src` no longer matches what ships.
- Evidence: 16 `app/**/page.tsx`; no `route.ts`; `apps/web/public/{robots.txt,ads.txt,app-ads.txt,manifest.json,og-image.png,pdf.worker.min.mjs,6bf34d0d…txt}`.

## 3. Route Inventory (16 page.tsx, verified live)

| URL | Type | Indexable | Canonical | Schema | Status |
|---|---|---|---|---|---|
| `/` | Home | yes | `/` (slash) | FAQPage+Org+WebSite | ok |
| `/tools/` | Listing | yes | `/tools/` | CollectionPage>ItemList(100 cap) | ok; lists noIndex tools too |
| `/tools/[toolId]/` | Tool | yes unless noIndex | slash form | WebApplication+Offer+HowTo+FAQ*+Breadcrumb | ok |
| `/tools/pdf/[toolId]/` | Tool (10 PDFs) | yes | `/tools/pdf/<slug>/` | same | ok |
| `/tools/category/[category]/` | Category (13) | yes | slash form | CollectionPage>ItemList | ok |
| `/blog/` | Blog index | yes | `/blog/` | Breadcrumb | ok |
| `/blog/[slug]/` | Article (7 of 14) | yes/**no** | `/blog/<slug>/` | Article+Breadcrumb | ok |
| 8 static pages (about/contact/security/accessibility/cookie-policy/disclaimer/privacy/terms) | Static | yes | slash form | Org+Breadcrumb | ok |
| `/offline/` | Shell | **no** (correct) | — | — | ok |

Redirects verified: non-slash → 308 slash (`/tools/bmi-calculator` → 308); legacy flat PDF slugs + emi/vat/character-counter/text-to-pdf → 301/308 in config.

## 4. Tool / Category / Blog Inventory

- Tools: 103 total; **63 indexable** (59 catalog + 4 seed; incl. 10 nested PDF), **40 noIndex** (thin-content decision, commit 9948ed2): json-to-yaml, yaml-to-json, json-to-typescript, csv-to-json, json-to-csv, url-decoder, diff-checker, timestamp-converter, case-converter, duplicate-line-remover, empty-line-remover, text-cleaner, slug-generator, lorem-ipsum-generator, reading-time-calculator, random-token-generator, hex-encoder, css-gradient-generator, css-box-shadow-generator, css-border-radius-generator, css-button-generator, color-converter, color-contrast-checker, wifi-qr-generator, vcard-qr-generator, text-qr-generator, meta-tag-generator, svg-placeholder-generator, average-calculator, url-validator, number-formatter, date-formatter, random-number-generator, code-minifier, keyword-density-checker, robots-txt-generator, youtube-thumbnail-downloader, favicon-generator, color-picker-from-image, image-cropper.
- noIndex pages emit `robots: { index:false, follow:false }` (`tools/[toolId]/page.tsx:26`, `blog/[slug]/page.tsx:30`) → **nofollow also suppresses internal link equity** from these pages.
- Categories: 13, hub copy + More-toggle; all indexable; ItemList per category.
- Blog: 14 posts; **7 noIndex** (tipping-guide, how-to-compress-pdf, jpg-to-pdf-guide, reduce-image-size, pdf-format-guide, image-format-comparison, unscramble-letters-guide) and 7 indexable — matches live sitemap exactly.
- Live sitemap totals reconciled exactly: 11 static + 13 categories + 63 tools + 7 blog = 94.

## 5. SEO Audit

Verified live (all 63 indexable tools swept): no double-brand titles, all descriptions 50–160 chars, canonicals trailing-slash, robots index/follow on public pages, `/offline` noindex.

- **[High] No indexing feedback loop** — Evidence: `GOOGLE_SITE_VERIFICATION = ""` (`apps/web/src/app/metadata.ts:7`), analytics provider is `no-op` (`apps/web/src/lib/analytics.ts:193-198`). IndexNow script exists but is manual (`package.json:21`, `scripts/indexnow.mjs`). Solution: set GSC verification, submit sitemap, wire consent-gated analytics, run IndexNow on deploy. Complexity: 2–4h.
- **[Medium] Stale SERP cache shows old double-suffix titles** — Evidence: search snippets for word-unscrambler/regex-tester/unit-converter show `… | RovoTools | RovoTools`; live HTTP shows correct single suffix (fixed in dfe9e03). Solution: GSC re-index + IndexNow ping; resolves automatically on recrawl. Complexity: 1h.
- **[Medium] 4 titles >65 chars** (SERP truncation risk) — Evidence: age-calculator (66), word-counter (69), password-strength-checker (72), date-difference-calculator (79). File: `apps/web/src/shared/tools/seo-copy.ts` (+catalog overrides). Solution: shorten decks. Complexity: 1h.
- **[Low] `Crawl-delay: 10`** — Evidence: `apps/web/public/robots.txt:4` (live confirmed). Google ignores it; Bing slows crawl 6 req/min. Solution: remove. Complexity: 5 min.
- **[Low] Sitemap `lastModified` frozen at 2026-10-01** for all non-blog URLs (`sitemap.ts:17`), incl. tools shipped Oct 14 — deliberate anti-recrawl tradeoff; consider per-tool dates when content pass completes.
- **[Low] ItemList on `/tools/` includes noIndex tools** (100-item cap) while sitemap excludes them — mixed signals. File: `apps/web/src/app/tools/page.tsx`. Solution: filter to indexable for schema.

### 5.1 Ranking check (external tools, 2026-10-19)

- Indexed: yes (`site:rovotools.com` returns homepage, tools, blog, legal pages with rich snippets).
- Brand: homepage #1 for the brand query.
- Head terms: absent from top 10 for "word unscrambler free online" and "adsense earnings calculator" (both dominated by established high-authority sites — normal at current age).
- Head terms are the wrong KPI now: win long-tail via the 63 decks, then reclaim the 40 hidden tools; measure in GSC once connected.

## 6. Metadata Audit

- Site template `%s | RovoTools`, metadataBase set, full favicon set, manifest, theme colors — ok (`metadata.ts:9-85`).
- Tool metadata deck→seo→fallback chain works; but fallback title is `${name} | RovoTools` (`packages/tools/src/seo.ts:85`) — if a fallback tool ever ships, the template double-suffixes. Note as latent bug; current 63 verified clean.
- **[Medium] One shared OG image** for every page (`og-image.png`, 1200×630) — weak social CTR. File: `[toolId]/page.tsx:29-36`, `metadata.ts:28-35`. Solution: per-category or generated per-tool OG. Complexity: 1–2d.
- **[Low] Homepage twitter:title** uses generic tagline while og:title uses page title — harmless inconsistency.
- Article metadata: canonical, OG article + `publishedTime`, Twitter — ok (`blog/[slug]/page.tsx:26-48`); `authors` absent (Low).

## 7. Structured Data Audit

Live-verified sets: Home (Organization+WebSite+FAQPage), tools (WebApplication+Offer+HowTo+FAQPage+BreadcrumbList), listing/category (CollectionPage+ItemList+Breadcrumb), blog post (Article+Breadcrumb). Real `<script type=application/ld+json>` tags (not RSC payload) — fixed in dfe9e03; `<` escaped.

- **[Low] No `SearchAction`** on WebSite schema despite CommandPalette search existing. File: `layout.tsx:38-43`. Solution: add `potentialAction`. Complexity: 1h.
- **[Low] Organization lacks `sameAs`** (socials empty in `packages/config/constants.ts`) and Article lacks `image`/`dateModified`. Solution: add when profiles/images exist.
- Verify HowTo is skipped when `howTo` is empty (not observed broken in sample).

## 8. Internal Linking Audit

- Home→category nav/explorer→tool→related/workflow→blog guides→tool (bidirectional) all present; breadcrumbs on every public page; 17 legacy redirects preserve equity.
- **[Medium] noindex pages use `follow:false`** — links *from* 40 tool pages + 7 thin posts don't pass equity. Solution: keep `index:false, follow:true`. Complexity: 15 min (2 files, 2 lines).
- **[Low] Guide coverage**: tool→blog backlinks only where `relatedTools`/workflows exist (7 posts for ~13 tools). Extend per Phase 2.
- **[Low] Broken-link sweep**: no CI link checker; recommend `lychee`/`linkinator` on build output.

## 9. Content Audit

- Category hubs with More-toggle copy — improved; listing decks for 63 tools substantive (Why/How/FAQ verified in live samples).
- **[High for growth] 47 hidden thin pages** (40 tools + 7 posts) — each is unique-functionality content that cannot rank. Solution (Phase 2): enrich decks (intro/benefits/howTo/FAQ) until each passes a 600+ word human-useful bar, then flip noIndex→index and sitemap. Do NOT bulk-index as-is (AdSense thin-content risk). Complexity: 2–4 weeks iterative.
- No word-count padding, no duplicate content observed.

## 10. Performance Audit

- Live 2026-10-19 (curl): homepage TTFB ≈0.51s, 76 KB gzip transfer, total 0.77s; tool page TTFB ≈0.47s, 34 KB gzip; raw homepage HTML 318 KB (RSC payload — normal).
- `images.unoptimized:true` (SSR could now optimize — Hostinger Node supports it; audit before enabling), `pdf.worker.min.mjs` 1.2 MB (code-split, loaded only for PDF tools), fonts via `next/font` self-hosted.
- **[Low] No LHCI/PSI gate in CI**; `ANALYZE=true` exists but not automated. Solution: add LHCI budgets to CI. Complexity: 1d.
- AdSense/FundingChoices load gated on consent; script strategies async.

## 11. Accessibility Audit

Previous axe pass (15 routes, light/dark, WCAG 2.1+2.2 AA) green 2026-09-17 (`docs/ACCESSIBILITY_AUDIT.md`). Unchanged since; spot risks (dialog focus-trap, zoom, reduced-motion) deferred to Phase 3. No new findings this pass.

## 12. Security Audit (no exploitation)

- SSR surface added: Next server + 17 path-only redirects; no API routes/DB/uploads still. JSON-LD `JSON.stringify().replace(/</g,"\\u003c")` safe pattern everywhere.
- `fetch-guard.ts` exists (SSRF allowlist for network tools like youtube-thumbnail-downloader) — verify coverage in Phase 4; SVG viewer sanitization to re-verify.
- No secrets in repo; ads.txt pub id public by design; `pnpm audit` exceptions tracked in `docs/SECURITY_EXCEPTIONS.md` (xlsx/serialize-javascript/image-size pinned per commits ec1c143/569ce6e).

## 13. Privacy Audit

- Prior High claim mismatch is **fixed**: header now reads "Most tools run locally in your browser — network tools are labelled." (`Header.tsx:251`), tool pages say "processed locally whenever supported" (`ToolDetail.tsx:141`), network tools badged.
- Consent: granular prefs migrate legacy choice; ads render only after decision (NPA when denied), analytics gated; withdraw via footer — ok. Note privacy policy says ads "always show" — matches NPA behavior. Recheck wording inconsistency risk when analytics is finally wired.

## 14. Monetisation Audit

- AdSense gated (`AdSenseScript` only when publisher id + consent), `AdSlot`/`AdRail` (tool-rail-right/blog-rail-right xl+), funding-choices script present for EU, `ads.txt`/`app-ads.txt` valid, pub id `pub-8311202559739478`.
- No new UX risks observed; keep results above fold and ads away from Download/Copy (device pass in Phase 5).

## 15. Growth Audit

- Exists: CommandPalette search, ToolsExplorer discovery, popular/recent rails, share (Web Share/custom scheme), PWA install/update, feedback widget, IndexNow key file live.
- **[High] Measurement absent**: GSC verification empty + analytics no-op (same root as §5). Without it, no rank tracking, no CTR/X queries, no prioritisation data. Complexity: 2–4h.
- **[Low] SOCIAL_LINKS empty** (no `sameAs`), no RSS for blog, no embed/backlink kit, no changelog. Consider when link-building starts.
- **[Low] IndexNow runs manually** (`pnpm indexnow`); hook into deploy to refresh SERPs after each content push (also fixes stale-title cache faster).

## 16. Programmatic SEO Opportunities

Convert before creating: the 40 noIndex tools are ready-made programmatic surfaces (distinct UI + intent). Sequence: (a) upgrade decks for high-intent hidden tools (url-decoder, case-converter, color-converter, timestamp-converter, css-generators, qr variants, meta-tag-generator, code-minifier, average-calculator), (b) re-index in small batches (5–10) to stay clear of thin-content signals, (c) then consider new pages (unit sub-pages already exist). Never bulk-publish thin pages.

## 17. Missing Features (unchanged high-value, no fake volumes)

1. Unit/length/weight/temp depth — exists (unit-converter); deepen only with sub-intent UI. 2. EMI amortization export. 3. Image WebP/AVIF + bulk compress — partially exists. 4. PDF protect/unlock/rotate/extract. 5. JSON→CSV/YAML (exists, hidden), Regex depth (exists). 6. Student GPA/citation, Marketing hashtag. 7. Validator/formatter hub expansion. All local-first.

## 18. Technical Debt

- **[Medium] Vendored drift**: `apps/web/src/shared/tools/*` vs `packages/tools/src/*` diverged (noIndex + deck changes only in web copy); `packages/tools` tests now validate stale data. Solution: single-source with a sync script/tsup build copy + CI diff check. Complexity: ½–1d.
- **[Low] Sitemap static date**, crawl-delay, ItemList/noIndex mismatch, latent fallback-title double suffix (`seo.ts:85`), `out.zip`/`instructions/` untracked artifacts in repo root.
- Comment rot: `[toolId]/page.tsx` comments still mention "Static export"/"Apache 301s" (`:58-61`) though runtime is SSR.

## 19. Recommended Priority Order

1. **[High] Connect measurement** — GSC verification (`metadata.ts:7`), analytics provider, IndexNow in deploy. (2–4h)
2. **[High] `noindex,follow`** on 40 tools + thin posts; ping IndexNow to refresh stale SERP titles. (1h)
3. **[High] Content upgrade of top-10 hidden tools** → re-index in batches → sitemap. (1–2w)
4. **[Medium] Vendor-drift fix** (single source of truth for tools data). (1d)
5. **[Medium] Per-category OG images** (or per-tool generation) + SearchAction + Org sameAs. (1–2d)
6. **[Medium] Title trims** for 4 long titles. (1h)
7. **[Medium] Internal linking pass** — extend blog↔tool coverage, category hub links. (3–5d)
8. **[Low] robots.txt cleanup** + sitemap per-tool dates + ItemList filter. (2h)
9. **[Low] LHCI/CWV gate** in CI incl. mobile PSI on homepage/tool/blog. (1d)
10. **[Low] Link-checker CI** + a11y manual pass (Phase 3/4 handoff). (2d)

Final: routes 16 | tools 103 (63 indexed / 40 noIndex) | categories 13 | blog 14 (7 indexed / 7 noIndex) | live sitemap 94 | redirects 17 | ranked: brand only; head terms not top-10 (young site, no backlink profile yet). Phase 0 rereview complete — stop; await approval for Phase 1.
