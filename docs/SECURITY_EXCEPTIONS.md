# Accepted dependency findings (`pnpm audit`)

Reviewed 2026-10-13 after the 29-finding batch audit. 24 findings are fixed via
`pnpm-workspace.yaml` overrides (image-size was accepted here before 2.0.4
shipped the JXL/HEIF/ICNS loop fixes, and is now overridden); the 5 below have
**no patched release on npm** (`patched_versions: <0.0.0`) as of this date.
CI fails only on `critical` (`pnpm audit --prod --audit-level critical`);
everything below is accepted with rationale and must be re-reviewed when the
dependency changes or an upstream fix ships.

## High

- **node-forge RSA PKCS#1 v1.5 signature forgery** (CVE-2026-85393,
  GHSA-86w9-cpqp-85rv, `<=1.4.0`, prod chain
  `expo > @expo/cli > node-forge`). Expo CLI dev tooling only — signature
  checks run on the developer machine during `expo start`/prebuild and never
  ship in the app or site bundle. Triggering it needs an attacker-supplied
  signature for the CLI to verify, i.e. a hostile local input, not a remote
  one. 1.4.0 is npm `latest`. Revisit when `@expo/cli` bumps node-forge.
- **braces stack exhaustion via nested glob patterns** (CVE-2026-93687,
  GHSA-vfj7-8cjw-p6xm, `<=3.0.3`, chains
  `expo > @expo/cli > @expo/metro-file-map > micromatch > braces` and
  `@types/jest > expect > jest-message-util > micromatch > braces`). DoS needs
  a *deeply nested attacker-controlled pattern*; every pattern reaching these
  chains is a local CLI argument or repo config file, never remote input, and
  the process is dev/build tooling. 3.0.3 is npm `latest`. Revisit when
  braces 3.0.4+ ships (micromatch still pins `^3.0.2`).
- **extract-zip symlink traversal → arbitrary file write** (CVE-2026-56876 +
  CVE-2026-19693, GHSA-jmr9-qjv8-65gv + GHSA-7pqw-9j4j-h8q3, `<=2.0.1`, dev
  chain `@lhci/cli > lighthouse > puppeteer-core > @puppeteer/browsers`).
  Dev-only and absent from `pnpm audit --prod`: it runs during `lhci autorun`
  to unpack the Chrome-for-Testing archive, fetched over HTTPS from Google's
  CDN — the archive is not an untrusted input in this setup, and the result is
  never shipped. 2.0.1 is npm `latest`; `@puppeteer/browsers` 3.x dropped
  extract-zip for `modern-tar`, so the entry clears itself when Lighthouse
  bumps puppeteer-core. Revisit on the next `@lhci/cli` upgrade.

## Moderate

- **sprintf-js unbounded precision DoS** (CVE-2026-97058,
  GHSA-hp3w-g68c-fv3c, `<=1.1.3`, chains via
  `expo-router > @testing-library/react-native > jest > … > argparse` and the
  mobile jest/eslint argparse chains). Exploitation requires an
  attacker-controlled *format string*; argparse formats its own fixed strings
  only. Already pinned to npm `latest` (1.1.3) — the advisory was widened to
  cover 1.1.3 on 2026-10-05 with no fix published. Revisit when
  sprintf-js 1.1.4+ ships.
