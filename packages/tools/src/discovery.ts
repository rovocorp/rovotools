import { ConfigurationError, NotFoundError } from "@rovotools/core";
import type {
  RegistryIssue,
  SortDirection,
  ToolCategory,
  ToolCategoryFacet,
  ToolDefinition,
  ToolPlatform,
  ToolQuery,
  ToolRegistryEntry,
  ToolSortField,
} from "@rovotools/types";

const TOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_RELATED_LIMIT = 6;

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeList(values: ReadonlyArray<string>): ReadonlyArray<string> {
  return values.map((value) => normalizeText(value)).filter((value) => value.length > 0);
}

function getSearchHaystack(entry: ToolRegistryEntry): string {
  const definition = entry.definition;
  return normalizeText(
    [
      definition.id,
      definition.slug,
      definition.name,
      definition.description,
      definition.category,
      definition.localizationKey,
      definition.nameKey,
      definition.descriptionKey,
      ...definition.keywords,
      ...definition.metadata.tags,
    ].join("\n"),
  );
}

export function supportsPlatform(
  entry: ToolRegistryEntry,
  platform: ToolPlatform,
): boolean {
  return entry.definition.supportedPlatforms.includes(platform);
}

export function isAvailableOffline(
  definition: ToolDefinition,
  platform?: ToolPlatform,
): boolean {
  if (platform !== undefined && !definition.supportedPlatforms.includes(platform)) {
    return false;
  }

  return (
    definition.processingMode === "LOCAL" &&
    definition.requiresNetwork === false &&
    definition.metadata.isOfflineCapable
  );
}

function matchesSearch(entry: ToolRegistryEntry, search: string): boolean {
  const normalizedSearch = normalizeText(search);
  if (normalizedSearch.length === 0) {
    return true;
  }
  return getSearchHaystack(entry).includes(normalizedSearch);
}

function matchesTags(entry: ToolRegistryEntry, tags: ReadonlyArray<string>): boolean {
  const available = new Set([
    ...normalizeList(entry.definition.metadata.tags),
    ...normalizeList(entry.definition.keywords),
  ]);
  return normalizeList(tags).every((tag) => available.has(tag));
}

function matchesFormat(entry: ToolRegistryEntry, format: string): boolean {
  const normalizedFormat = normalizeText(format);
  if (normalizedFormat.length === 0) {
    return true;
  }
  return normalizeList(entry.definition.supportedFormats).includes(normalizedFormat);
}

export function matchesToolQuery(entry: ToolRegistryEntry, query: ToolQuery): boolean {
  const definition = entry.definition;

  if (query.platform !== undefined && !supportsPlatform(entry, query.platform)) {
    return false;
  }
  if (query.category !== undefined && definition.category !== query.category) {
    return false;
  }
  if (query.processingMode !== undefined && definition.processingMode !== query.processingMode) {
    return false;
  }
  if (query.featured !== undefined && definition.featured !== query.featured) {
    return false;
  }
  if (query.popular !== undefined && definition.popular !== query.popular) {
    return false;
  }
  if (
    query.offlineCapable !== undefined &&
    isAvailableOffline(definition, query.platform) !== query.offlineCapable
  ) {
    return false;
  }
  if (query.format !== undefined && !matchesFormat(entry, query.format)) {
    return false;
  }
  if (query.tags !== undefined && !matchesTags(entry, query.tags)) {
    return false;
  }
  if (query.search !== undefined && !matchesSearch(entry, query.search)) {
    return false;
  }
  return true;
}

function compareStrings(a: string, b: string): number {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function compareBooleans(a: boolean, b: boolean): number {
  return Number(a) - Number(b);
}

function compareEntries(
  a: ToolRegistryEntry,
  b: ToolRegistryEntry,
  sortBy: ToolSortField,
  direction: SortDirection,
): number {
  let result = 0;
  if (sortBy === "name") {
    result = compareStrings(a.definition.name, b.definition.name);
  } else if (sortBy === "slug") {
    result = compareStrings(a.definition.slug, b.definition.slug);
  } else if (sortBy === "id") {
    result = compareStrings(a.definition.id, b.definition.id);
  } else if (sortBy === "category") {
    result = compareStrings(a.definition.category, b.definition.category);
    if (result === 0) {
      result = compareStrings(a.definition.name, b.definition.name);
    }
  } else if (sortBy === "featured") {
    result = compareBooleans(a.definition.featured, b.definition.featured);
    if (result === 0) {
      result = compareStrings(a.definition.name, b.definition.name);
    }
  } else {
    result = compareBooleans(a.definition.popular, b.definition.popular);
    if (result === 0) {
      result = compareStrings(a.definition.name, b.definition.name);
    }
  }
  return direction === "desc" ? -result : result;
}

export function sortRegistryEntries(
  entries: ReadonlyArray<ToolRegistryEntry>,
  sortBy?: ToolSortField,
  direction: SortDirection = "asc",
): ReadonlyArray<ToolRegistryEntry> {
  if (sortBy === undefined) {
    return [...entries];
  }
  return [...entries].sort((a, b) => compareEntries(a, b, sortBy, direction));
}

function assertValidPagination(limit?: number, offset?: number): void {
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 0)) {
    throw new ConfigurationError("Tool query limit must be a non-negative integer.");
  }
  if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
    throw new ConfigurationError("Tool query offset must be a non-negative integer.");
  }
}

export function filterRegistryEntries(
  entries: ReadonlyArray<ToolRegistryEntry>,
  query: ToolQuery = {},
): ReadonlyArray<ToolRegistryEntry> {
  assertValidPagination(query.limit, query.offset);
  const filtered = entries.filter((entry) => matchesToolQuery(entry, query));
  const sorted = sortRegistryEntries(filtered, query.sortBy, query.sortDirection ?? "asc");
  const offset = query.offset ?? 0;
  const limited =
    query.limit === undefined ? sorted.slice(offset) : sorted.slice(offset, offset + query.limit);
  return limited;
}

export function queryTools(
  entries: ReadonlyArray<ToolRegistryEntry>,
  query: ToolQuery = {},
): ReadonlyArray<ToolRegistryEntry> {
  return filterRegistryEntries(entries, query);
}

export function searchTools(
  entries: ReadonlyArray<ToolRegistryEntry>,
  search: string,
  query: ToolQuery = {},
): ReadonlyArray<ToolRegistryEntry> {
  return filterRegistryEntries(entries, { ...query, search });
}

export function getCategoryFacets(
  entries: ReadonlyArray<ToolRegistryEntry>,
): ReadonlyArray<ToolCategoryFacet> {
  const counts = new Map<ToolCategory, number>();
  for (const entry of entries) {
    const category = entry.definition.category;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => compareStrings(a.category, b.category));
}

export function getFeaturedTools(
  entries: ReadonlyArray<ToolRegistryEntry>,
  limit?: number,
): ReadonlyArray<ToolRegistryEntry> {
  return filterRegistryEntries(entries, {
    featured: true,
    sortBy: "name",
    ...(limit === undefined ? {} : { limit }),
  });
}

export function getPopularTools(
  entries: ReadonlyArray<ToolRegistryEntry>,
  limit?: number,
): ReadonlyArray<ToolRegistryEntry> {
  return filterRegistryEntries(entries, {
    popular: true,
    sortBy: "name",
    ...(limit === undefined ? {} : { limit }),
  });
}

function findEntry(
  entries: ReadonlyArray<ToolRegistryEntry>,
  reference: string,
): ToolRegistryEntry | undefined {
  const normalized = normalizeText(reference);
  return entries.find(
    (entry) =>
      normalizeText(entry.definition.id) === normalized ||
      normalizeText(entry.definition.slug) === normalized,
  );
}

function countSharedKeywords(target: ToolDefinition, candidate: ToolDefinition): number {
  const targetKeywords = new Set(normalizeList(target.keywords));
  let shared = 0;
  for (const keyword of normalizeList(candidate.keywords)) {
    if (targetKeywords.has(keyword)) {
      shared += 1;
    }
  }
  return shared;
}

function scoreRelatedCandidate(target: ToolDefinition, candidate: ToolDefinition): number {
  let score = countSharedKeywords(target, candidate);
  if (candidate.category === target.category) {
    score += 2;
  }
  if (candidate.popular) {
    score += 1;
  }
  if (candidate.featured) {
    score += 1;
  }
  return score;
}

export function getRelatedTools(
  entries: ReadonlyArray<ToolRegistryEntry>,
  toolIdOrSlug: string,
  limit: number = DEFAULT_RELATED_LIMIT,
): ReadonlyArray<ToolRegistryEntry> {
  assertValidPagination(limit, 0);
  const target = findEntry(entries, toolIdOrSlug);
  if (target === undefined) {
    throw new NotFoundError("tool", toolIdOrSlug);
  }

  const byId = new Map(entries.map((entry) => [entry.definition.id, entry]));
  const bySlug = new Map(entries.map((entry) => [entry.definition.slug, entry]));
  const selected: ToolRegistryEntry[] = [];
  const seen = new Set<string>([target.definition.id]);

  for (const related of target.definition.relatedTools) {
    const resolved = byId.get(related) ?? bySlug.get(related);
    if (resolved !== undefined && !seen.has(resolved.definition.id)) {
      seen.add(resolved.definition.id);
      selected.push(resolved);
    }
    if (selected.length >= limit) {
      return selected;
    }
  }

  const candidates = entries
    .filter((entry) => !seen.has(entry.definition.id))
    .map((entry) => ({
      entry,
      score: scoreRelatedCandidate(target.definition, entry.definition),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return compareStrings(a.entry.definition.name, b.entry.definition.name);
    });

  for (const candidate of candidates) {
    selected.push(candidate.entry);
    if (selected.length >= limit) {
      break;
    }
  }
  return selected;
}

export function validateRegistryEntries(
  entries: ReadonlyArray<ToolRegistryEntry>,
): ReadonlyArray<RegistryIssue> {
  const issues: RegistryIssue[] = [];
  const ids = new Map<string, number>();
  const slugs = new Map<string, number>();

  for (const entry of entries) {
    const definition = entry.definition;
    ids.set(definition.id, (ids.get(definition.id) ?? 0) + 1);
    slugs.set(definition.slug, (slugs.get(definition.slug) ?? 0) + 1);

    if (!TOOL_SLUG_PATTERN.test(definition.slug)) {
      issues.push({
        code: "invalid-slug",
        toolId: definition.id,
        message: `Tool "${definition.id}" has an invalid slug "${definition.slug}".`,
      });
    }
    if (definition.supportedPlatforms.length === 0) {
      issues.push({
        code: "missing-platforms",
        toolId: definition.id,
        message: `Tool "${definition.id}" must support at least one platform.`,
      });
    }
    if (definition.requiresNetwork && definition.metadata.isOfflineCapable) {
      issues.push({
        code: "inconsistent-offline-capability",
        toolId: definition.id,
        message: `Tool "${definition.id}" requires a network connection but is marked offline-capable.`,
      });
    }
    if (definition.processingMode === "SERVER" && !definition.requiresNetwork) {
      issues.push({
        code: "server-tool-without-network",
        toolId: definition.id,
        message: `Tool "${definition.id}" uses server processing but does not require a network connection.`,
      });
    }
  }

  for (const [id, count] of ids.entries()) {
    if (count > 1) {
      issues.push({
        code: "duplicate-tool-id",
        toolId: id,
        message: `Tool id "${id}" is registered ${count} times.`,
      });
    }
  }
  for (const [slug, count] of slugs.entries()) {
    if (count > 1) {
      issues.push({
        code: "duplicate-tool-slug",
        message: `Tool slug "${slug}" is registered ${count} times.`,
      });
    }
  }

  const knownIds = new Set(entries.map((entry) => entry.definition.id));
  const knownSlugs = new Set(entries.map((entry) => entry.definition.slug));
  for (const entry of entries) {
    for (const related of entry.definition.relatedTools) {
      if (related === entry.definition.id || related === entry.definition.slug) {
        issues.push({
          code: "self-related-tool",
          toolId: entry.definition.id,
          message: `Tool "${entry.definition.id}" lists itself as related.`,
        });
      } else if (!knownIds.has(related) && !knownSlugs.has(related)) {
        issues.push({
          code: "unknown-related-tool",
          toolId: entry.definition.id,
          message: `Tool "${entry.definition.id}" references unknown related tool "${related}".`,
        });
      }
    }
  }

  return issues;
}
