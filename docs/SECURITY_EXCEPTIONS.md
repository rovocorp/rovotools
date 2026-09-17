# Accepted dependency findings (`pnpm audit --prod`)

Reviewed 2026-09-16. CI fails on `critical`; everything below is accepted
with rationale and must be re-reviewed when the dependency changes.

## High

- **xlsx prototype pollution + ReDoS** (unpatched upstream, `<0.0.0`).
  Only used in `PdfToExcel.tsx`, write path only: workbooks are generated
  from locally extracted PDF text, never parsed from untrusted files.
  Formula injection additionally neutralized by `sanitizeSpreadsheetCell`.
- **serialize-javascript RCE** (via `next-pwa → workbox-build`).
  Build-time only (service-worker bundling); never shipped to browsers.
  Revisit if `next-pwa` is replaced (e.g. Serwist).
- **image-size DoS (ICNS / JXL+HEIF)** (via Metro/expo CLI chain).
  Mobile build tooling only; never in the app runtime bundle.
- **deepmerge-ts stack exhaustion** (via `@prisma/client → prisma config`).
  Prisma CLI/config-time only; the query runtime never merges recursive
  graphs. Revisit on the next Prisma 6.x bump.

## Moderate

- **uuid bounds check** (via expo/xcode chain). Build tooling only.
- **decode-uri-component DoS** (via expo-router `query-string`).
  Dev-server routing helper; production deep links go through the audited
  `parseDeepLink` (see SECURITY.md).
