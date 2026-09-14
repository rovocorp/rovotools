import { registerCoreTools, toolRegistry, type ToolRegistry } from "@rovotools/tools";

let seeded = false;

export function getToolRegistry(): ToolRegistry {
  if (!seeded) {
    registerCoreTools(toolRegistry);
    seeded = true;
  }
  return toolRegistry;
}
