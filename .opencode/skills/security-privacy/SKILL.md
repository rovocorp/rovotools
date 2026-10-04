---
name: security-privacy
description: Phase 4 security and privacy for RovoTools file/URL tools. Use to audit XSS, SSRF, uploads, SVG, traversal, rate-limiting, secrets and privacy-claim alignment. No exploitation.
---

# Security Privacy (Phase 4)

Refs: `docs/SECURITY_EXCEPTIONS.md`, `SECURITY.md`, `PRODUCTION_AUDIT.md` (CSRF/honeypot).

## Security

- Focus: website analyzer, SEO checker, image/PDF/URL/dev tools, `pdf.worker.min.mjs`, `xlsx`/`image-size`/`serialize-javascript` build-only exceptions.
- Check: unsafe HTML/URL, SSRF, uploads, malicious SVG, path traversal, API abuse (none — static export, no `route.ts`), `pnpm audit --prod`, client secrets in `packages/config/constants.ts` (`WEB_URL=https://rovotools.com`), `.htaccess`/CSP.

## Privacy

- Per-tool local vs server vs third-party vs hybrid. Verify vs claims ("never leave device").
- Cookie/consent: `CookieBanner.tsx`, `lib/ads.ts`, `lib/analytics.ts`. Fix copy to match reality.
