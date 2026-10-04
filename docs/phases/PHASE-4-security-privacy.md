# PHASE-4 — Security & Privacy

Entry: Phase 3 done. No exploitation, identify risks only, then fix with approval.

## Security tasks

- Review XSS/unsafe HTML/URL handling/SSRF/uploads/malicious SVG/traversal/rate-limit/secrets.
- Focus: website analyzer, SEO checker, image/PDF/URL/dev tools, file flows (`pdf.worker.min.mjs`, `xlsx`, `image-size` per `SECURITY_EXCEPTIONS.md`).
- Check `public/.htaccess`, CSP, CSRF/honeypot (see `PRODUCTION_AUDIT.md`), `pnpm audit --prod`, client-side secrets (`packages/config/constants.ts`).

## Privacy tasks

- Per-tool: local/browser vs server vs third-party vs hybrid.
- Compare implementation vs messaging ("files never leave device"). Fix claims, do not over-claim.
- Cookie banner, consent for AdSense/analytics (`components/CookieBanner.tsx`, `lib/ads.ts`, `analytics.ts`).

## Exit

Threat list with Severity/File/Solution, `pnpm audit` clean (or exceptions documented), privacy copy matches reality.
