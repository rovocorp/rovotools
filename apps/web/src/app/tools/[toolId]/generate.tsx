import { getToolRegistry } from "@/lib/registry";

export function getToolStaticParams(): Array<{ toolId: string }> {
  const registry = getToolRegistry();
  // Tools with a nested canonical landing page (all /tools/pdf/* tools)
  // are statically generated at their canonical route instead — the flat
  // /tools/<slug> URL redirects there (see next.config.ts).
  return registry
    .getAll()
    .filter((entry) => entry.definition.seo?.canonicalPath?.startsWith("/tools/pdf/") !== true)
    .map((entry) => ({ toolId: entry.definition.slug }));
}
