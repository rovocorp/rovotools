import { NextResponse } from "next/server";
import { z } from "zod";
import type { ToolCategory, ToolPlatform, ToolRegistryEntry } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { getToolRegistry } from "@/lib/registry";

const querySchema = z.object({
  q: z.string().max(100).optional(),
  category: z
    .enum([
      "calculator",
      "validator",
      "formatter",
      "pdf",
      "image",
      "developer",
      "text",
      "security",
      "design",
      "color",
      "qr",
      "finance",
      "seo",
    ])
    .optional(),
  platform: z.enum(["WEB", "PWA", "ANDROID", "IOS"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

function toPublicTool(entry: ToolRegistryEntry): Record<string, unknown> {
  const tool = entry.definition;
  return {
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
    requiresNetwork: tool.requiresNetwork,
    relatedTools: tool.relatedTools,
    path: `/tools/${tool.slug}`,
  };
}

export function GET(request: Request): NextResponse {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    platform: url.searchParams.get("platform") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: t("en", "errors.invalidInput") }, { status: 400 });
  }

  const registry = getToolRegistry();
  const { q, category, limit } = parsed.data;
  const platform: ToolPlatform = parsed.data.platform ?? "WEB";
  const baseQuery = {
    ...(category === undefined ? {} : { category: category as ToolCategory }),
    ...(limit === undefined ? {} : { limit }),
    platform,
    sortBy: "name" as const,
  };
  const entries = q === undefined || q === "" ? registry.query(baseQuery) : registry.search(q, baseQuery);

  return NextResponse.json({ tools: entries.map(toPublicTool) });
}

