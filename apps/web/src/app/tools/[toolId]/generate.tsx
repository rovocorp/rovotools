import { getToolRegistry } from "@/lib/registry";

export function getToolStaticParams(): Array<{ toolId: string }> {
  const registry = getToolRegistry();
  return registry.routes().map((route) => ({ toolId: route.slug }));
}
