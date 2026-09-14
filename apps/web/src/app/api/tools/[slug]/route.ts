import { NextResponse } from "next/server";
import { t } from "@rovotools/localization";
import { getToolRegistry } from "@/lib/registry";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const registry = getToolRegistry();
  const entry = registry.get((await params).slug);
  if (entry === undefined) {
    return NextResponse.json({ error: t("en", "errors.notFound") }, { status: 404 });
  }
  const tool = entry.definition;
  return NextResponse.json({
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    icon: tool.icon,
    keywords: tool.keywords,
    featured: tool.featured,
    popular: tool.popular,
    supportedPlatforms: tool.supportedPlatforms,
    processingMode: tool.processingMode,
    supportedFormats: tool.supportedFormats,
    requiresNetwork: tool.requiresNetwork,
    relatedTools: tool.relatedTools,
    inputs: tool.inputs,
    outputs: tool.outputs,
    path: `/tools/${tool.slug}`,
  });
}
