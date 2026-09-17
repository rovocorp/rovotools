import { getToolRegistry } from "@/lib/registry";

// Static params for the nested PDF landing pages:
// /tools/pdf/pdf-to-word, /tools/pdf/merge-pdf, … — one per high-demand
// PDF task. Deliberately NOT a single combined /pdf-tools page.
export function getPdfToolStaticParams(): Array<{ toolId: string }> {
  const registry = getToolRegistry();
  return registry
    .getAll()
    .filter((entry) => entry.definition.seo?.canonicalPath?.startsWith("/tools/pdf/") === true)
    .map((entry) => ({ toolId: entry.definition.slug }));
}
