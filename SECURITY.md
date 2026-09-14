# RovoTools Security Policy

Shared principles apply everywhere. Platform-specific controls live in each app.

## Never log or persist

Passwords, JWTs, API keys, private documents, and sensitive user inputs must
never appear in logs, caches, analytics, error reports, or URLs. Tool inputs
and results stay in memory only. Verified: no `console.*` calls in either app.

## Secrets

- No secrets in source code, manifests, or client bundles (verified by audit).
- Server secrets use environment variables only (`apps/web/.env.example`).
  `DATABASE_URL` is read server-side in API routes and never exposed with a
  `NEXT_PUBLIC_` prefix.
- The mobile app embeds no API keys. If backends later require keys, they go
  through Expo config `extra` at build time, never committed.

## Web (`apps/web/src/middleware.ts`)

- Strict security headers on every response: CSP, `nosniff`,
  `DENY` framing, strict referrer policy, restrictive permissions policy, HSTS,
  same-origin opener/resource policies.
- CSP allows `'unsafe-inline'` scripts/styles only because Next.js requires
  inline bootstrapping; `unsafe-eval`, plugins, and foreign frames are banned.
- Mutating `/api/*` requests must carry a matching Origin/Referer (CSRF
  defense; no cookie sessions exist, so there are no ambient credentials).
- In-memory rate limiting (60 req/min/IP) on `/api/*`. Single-instance only;
  move to Redis/edge KV when horizontally scaled.
- All API input validated with zod; Prisma access is parameterized.

## PWA

- Service worker scope is `/`; registration is owned by one component.
- `/api/*` is `NetworkOnly` — favorites and metadata are never cached, so no
  stale or private data is served offline.
- Offline storage holds only tool IDs (favorites/recents), theme, and the
  install-dismissal timestamp. Never inputs, results, documents, or tokens.
- Updates apply via `skipWaiting` with a user-visible refresh prompt.

## Mobile

- Non-sensitive data in AsyncStorage; secrets/tokens in SecureStore
  (Keychain/Keystore). Auth tokens, when introduced, go to SecureStore only.
- Minimum permissions: camera/photos/files are requested lazily, only when
  the user taps the corresponding picker. iOS usage descriptions are declared
  in `app.json`.
- Picked files are validated (25 MB cap, executable blocklist) and copied to
  the app cache; export filenames are sanitized.
- All network traffic is HTTPS (`https://rovotools.com`). Certificate pinning
  is deferred until a first-party authenticated API exists.
- No WebViews; no JavaScript bridges to audit.

## Deep links

`parseDeepLink` rejects foreign hosts and any URL carrying sensitive query
params (`token`, `api_key`, `password`, …). Sanitized links never enter
navigation state. See `packages/tools/src/deeplinks.ts`.

## Monetization privacy

- Ad scripts load only when a publisher ID is configured; otherwise ad slots
  render nothing and make zero network requests.
- Tool inputs and results are never passed to ad code. Ad containers are
  labeled, placed below content, and cannot overlay interactive controls.
- The mobile app contains no web ad SDKs; a future native provider plugs into
  `resolveMobileAdsProvider` without touching tool code.

## Reporting

Security issues: support@rovotools.com. Do not open public issues for
vulnerabilities.
