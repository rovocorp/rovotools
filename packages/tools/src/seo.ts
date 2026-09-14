import { ConfigurationError } from "@rovotools/core";
import type {
  ToolPageMetadata,
  ToolRegistryEntry,
  ToolRoute,
  ToolSitemapEntry,
} from "@rovotools/types";

export const DEFAULT_TOOL_BASE_PATH = "/tools";

function normalizeBasePath(basePath: string): string {
  const normalized = basePath.trim();
  if (normalized.length === 0) {
    return DEFAULT_TOOL_BASE_PATH;
  }
  const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return withLeadingSlash.endsWith("/") && withLeadingSlash.length > 1
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

function normalizeBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  if (normalized.length === 0) {
    throw new ConfigurationError("Tool URL generation requires a non-empty base URL.");
  }
  return normalized;
}

export function getToolPath(slug: string, basePath: string = DEFAULT_TOOL_BASE_PATH): string {
  const normalizedSlug = slug.trim().toLowerCase();
  if (normalizedSlug.length === 0) {
    throw new ConfigurationError("Tool path generation requires a non-empty slug.");
  }
  return `${normalizeBasePath(basePath)}/${normalizedSlug}`;
}

export function getToolUrl(
  slug: string,
  baseUrl: string,
  basePath: string = DEFAULT_TOOL_BASE_PATH,
): string {
  return `${normalizeBaseUrl(baseUrl)}${getToolPath(slug, basePath)}`;
}

export function getToolRoute(
  entry: ToolRegistryEntry,
  basePath: string = DEFAULT_TOOL_BASE_PATH,
): ToolRoute {
  return {
    id: entry.definition.id,
    slug: entry.definition.slug,
    path: getToolPath(entry.definition.slug, basePath),
    params: {
      toolId: entry.definition.id,
    },
  };
}

export function getToolRoutes(
  entries: ReadonlyArray<ToolRegistryEntry>,
  basePath: string = DEFAULT_TOOL_BASE_PATH,
): ReadonlyArray<ToolRoute> {
  return entries.map((entry) => getToolRoute(entry, basePath));
}

export function getToolPageMetadata(
  entry: ToolRegistryEntry,
  baseUrl?: string,
  basePath: string = DEFAULT_TOOL_BASE_PATH,
): ToolPageMetadata {
  const definition = entry.definition;
  const canonicalPath = definition.seo?.canonicalPath ?? getToolPath(definition.slug, basePath);
  const keywords = [...(definition.seo?.keywords ?? definition.keywords)].join(", ");

  return {
    title: definition.seo?.title ?? `${definition.name} | RovoTools`,
    description: definition.seo?.description ?? definition.description,
    keywords,
    canonicalPath,
    ...(baseUrl === undefined ? {} : { canonicalUrl: getToolUrl(definition.slug, baseUrl, basePath) }),
    ...(definition.seo?.image === undefined ? {} : { image: definition.seo.image }),
    ...(definition.seo?.noIndex === undefined ? {} : { noIndex: definition.seo.noIndex }),
    ...(definition.seo?.openGraphType === undefined
      ? {}
      : { openGraphType: definition.seo.openGraphType }),
    ...(definition.seo?.twitterCard === undefined
      ? {}
      : { twitterCard: definition.seo.twitterCard }),
  };
}

export function toSitemapEntries(
  entries: ReadonlyArray<ToolRegistryEntry>,
  baseUrl?: string,
  basePath: string = DEFAULT_TOOL_BASE_PATH,
): ReadonlyArray<ToolSitemapEntry> {
  return entries
    .filter((entry) => entry.definition.seo?.noIndex !== true)
    .map((entry) => {
      const path = entry.definition.seo?.canonicalPath ?? getToolPath(entry.definition.slug, basePath);
      return {
        path,
        ...(baseUrl === undefined
          ? {}
          : { url: `${normalizeBaseUrl(baseUrl)}${path.startsWith("/") ? path : `/${path}`}` }),
        ...(entry.definition.seo?.priority === undefined
          ? {}
          : { priority: entry.definition.seo.priority }),
        ...(entry.definition.seo?.changeFrequency === undefined
          ? {}
          : { changeFrequency: entry.definition.seo.changeFrequency }),
        ...(entry.definition.seo?.noIndex === undefined
          ? {}
          : { noIndex: entry.definition.seo.noIndex }),
      };
    });
}
