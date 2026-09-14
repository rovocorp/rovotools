# RovoTools

A multi-platform tool ecosystem built with:

- **Web**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Mobile**: React Native, Expo, TypeScript
- **Shared Core**: Pure TypeScript packages (types, validation, calculations, tools, i18n)

## Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Install
\`\`\`bash
pnpm install
\`\`\`

### Build
\`\`\`bash
pnpm build
\`\`\`

### Development
\`\`\`bash
pnpm dev
\`\`\`

## Package Structure

| Package | Purpose |
|---------|---------|
| `@rovotools/types` | Shared TypeScript interfaces (ToolDefinition, ToolInput, etc.) |
| `@rovotools/core` | Core utilities (Result type, errors) |
| `@rovotools/calculations` | Pure calculation functions |
| `@rovotools/validation` | Zod-based validation engine |
| `@rovotools/localization` | i18n keys, translation loading |
| `@rovotools/tools` | Tool definitions, registry, factory |
| `@rovotools/ui` | Shared React UI primitives (SSR-safe) |
| `@rovotools/config` | Shared constants and configuration |

## Adding a New Tool

1. Create `packages/tools/[tool-name]/index.ts` using `defineTool()`
2. Add validation in `packages/validation/src/schema.ts`
3. Add calculations in `packages/calculations/src/`
4. Add translation keys in `packages/localization/src/keys.ts`
5. Add to `packages/tools/src/registry.ts`
6. Add web UI in `apps/web/components/tools/`
7. Add mobile UI in `apps/mobile/components/`

## License

MIT
