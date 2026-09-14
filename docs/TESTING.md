# Cross-Platform Testing Strategy

## Principle

Financial (and all) calculations must produce identical results on Web,
Android, and iOS. There is exactly one implementation
(`packages/calculations`) and one vector set (`vectors.ts`). Platforms run —
never rewrite — the vectors.

## Layers

| Layer | Web | Mobile | Shared |
|---|---|---|---|
| Unit: engines | `packages/calculations` vitest (71) | same | vectors dispatcher |
| Contract: vectors | `apps/web/.../calculations.vectors.test.ts` (32) | `src/lib/__tests__/vectors.test.ts` (32) | `CALCULATION_VECTORS`, `INVALID_VECTORS`, `compareResult` |
| Registry/policy | `packages/tools` vitest (30) | jest re-run (4) | same suites |
| Security | web `security.test.ts` (7) | — | core `security.test.ts` (7) |
| UI behavior | Playwright (planned) | Maestro (planned) | — |

## Per-tool checklist (every important tool)

Correct result · input validation · error state · empty state · reset ·
copy · export · file processing · large input · invalid input · offline
behavior · dark mode · light mode · accessibility · performance.

Unit-testable rows (result, validation, errors, invalid input) are covered by
vectors + engine tests. UI rows (reset, copy, export, offline, themes,
accessibility, performance) are E2E rows below.

## E2E plan (not yet implemented)

- **Web/PWA (Playwright)**: tool runner flows per seed tool (fill → calculate
  → assert result → reset → copy → export), offline mode via service-worker
  bypass, axe accessibility pass, dark/light snapshots, Lighthouse budgets.
- **Mobile (Maestro)**: mirrored flows on Android emulator + iOS simulator,
  airplane-mode offline run, theme toggle, share-sheet dismissal.

## Adding a vector

1. Add `{ engine, label, input, expected, tolerance }` to
   `CALCULATION_VECTORS` (or `INVALID_VECTORS`).
2. Run `pnpm --filter @rovotools/calculations test`,
   `pnpm --filter @rovotools/web test`,
   `pnpm --filter @rovotools/mobile test`.
3. All three must pass with zero per-platform adjustments. If a platform
   diverges, the bug is in the platform runner — never "fix" it by forking
   the vector.
