# Store Readiness — RovoTools Mobile

## Validated SDK matrix (verified 2026-09-12)

- Expo SDK 56.0.21 · React Native 0.85.3 · React 19.2.3
- `targetSdkVersion` 36 / `compileSdkVersion` 36 → complies with the Play
  Aug-31-2026 API-36 rule for new apps and updates.
- 16 KB page-size ready (RN ≥ 0.77 requirement met; Expo-side fixes present
  since expo@53.0.14). Confirm in Play Console → App bundle explorer.
- iOS 16.4+ deployment target; EAS default Xcode ≥ 26.4 satisfies the
  Apr-28-2026 Xcode-26 / iOS-26-SDK rule.
- New Architecture default-on; edge-to-edge enforced on Android 16, covered
  by safe-area-aware layouts.
- Splash via `expo-splash-screen` config plugin (legacy top-level key removed).

## Identifiers (confirm before first submission; do not invent replacements)

- Android application ID: `com.rovocorp.rovotools`
- iOS bundle identifier: `com.rovocorp.rovotools`
- App name: RovoTools · Version: 1.0.0 · iOS build: 1 · Android versionCode: 1
- Custom scheme: `rovotools://` · Web fallback: `https://rovotools.com`

## Artwork (placeholders in `assets/`, replace with final brand art)

- `icon.png` (1024), `adaptive-icon.png` (1024, #4f46e5 background), `splash.png`

## Permissions declared (minimum set)

- iOS: camera + photo library, both with narrow usage strings, requested only
  on user tap. No location, contacts, microphone, tracking, or notifications.
- Android: only what Expo file/image/camera modules require at runtime.

## Data safety (both stores)

- Collected: nothing. No accounts, analytics SDKs, or ad SDKs.
- Stored on-device only: favorite tool IDs, recent tool IDs, theme.
- No health, financial, location, contact, or identifier data leaves the device.

## Release gates

1. Replace EAS placeholders in `eas.json` (project ID, Apple/Play credentials).
2. Replace `assetlinks.json` fingerprint and AASA team ID on the web side.
3. Bump `version` + `buildNumber`/`versionCode` together per release.
4. Submit staging to internal track / TestFlight before production.
