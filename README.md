# RovoTools

Multi-platform tool ecosystem — Web, PWA, and Mobile built from a single shared core.

## Architecture

```
rovotools/
├── apps/
│   ├── web/              # Next.js (Web + PWA)
│   └── mobile/           # React Native (Expo — Android + iOS)
├── packages/
│   ├── types/            # Shared TypeScript types & interfaces
│   ├── config/           # Shared build / project configuration
│   ├── core/             # Core utilities, result types, errors
│   ├── calculations/     # Pure calculation engines
│   ├── validation/       # Input validation (Zod-based)
│   ├── localization/     # i18n keys, translation loading
│   ├── tools/            # Tool definitions & registry
│   └── ui/               # Shared UI primitives (SSR-safe)
└── pnpm-workspace.yaml
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build web
pnpm run build:web

# Build mobile
pnpm run build:mobile

# Type-check all
pnpm typecheck

# Lint all
pnpm lint
```

## Package Scripts

Each package and app has its own `package.json` with platform-specific scripts.

## Adding a New Tool

1. Create `packages/tools/[tool-name]/` with `index.ts` using `defineTool()`
2. Add validation logic in `packages/validation/`
3. Add calculation logic in `packages/calculations/`
4. Add translation keys in `packages/localization/`
5. Register in `packages/tools/registry.ts`
6. Add web UI in `apps/web/components/tools/[tool-name].tsx`
7. Add mobile UI in `apps/mobile/components/tools/[tool-name].tsx`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Package Manager | pnpm 9 |
| Monorepo | pnpm workspaces |
| Language | TypeScript 5 (strict) |
| Web Framework | Next.js 16 (App Router) |
| Mobile Framework | React Native + Expo |
| Styling (Web) | Tailwind CSS v4 |
| Validation | Zod |
| i18n | react-i18next |
| State (Web) | Zustand + TanStack Query |
| State (Mobile) | Zustand |
| Linting | ESLint 9 |
