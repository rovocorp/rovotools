// Direct module imports: lib/registry is used by client components
// (CommandPalette, RecentTools) and must not drag the tools barrel —
// which re-exports pdf.ts (pdf-lib) and seo-copy — into client chunks.
import { registerCoreTools } from "@/shared/tools/seed";
import { toolRegistry, type ToolRegistry } from "@/shared/tools/registry";

let seeded = false;

export function getToolRegistry(): ToolRegistry {
  if (!seeded) {
    registerCoreTools(toolRegistry);
    seeded = true;
  }
  return toolRegistry;
}
