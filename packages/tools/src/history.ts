import { ConfigurationError } from "@rovotools/core";
import type {
  FavoriteToolIds,
  RecentToolIds,
  ToolRegistryEntry,
} from "@rovotools/types";

export const DEFAULT_RECENT_TOOL_LIMIT = 10;
export const MAX_RECENT_TOOL_LIMIT = 50;

function normalizeId(toolId: string): string {
  return toolId.trim();
}

function assertValidId(toolId: string): string {
  const normalized = normalizeId(toolId);
  if (normalized.length === 0) {
    throw new ConfigurationError("Favorite and recent tool references must be non-empty.");
  }
  return normalized;
}

function assertValidRecentLimit(limit: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RECENT_TOOL_LIMIT) {
    throw new ConfigurationError(
      `Recent tool history limit must be an integer between 1 and ${MAX_RECENT_TOOL_LIMIT}.`,
    );
  }
}

export function toggleFavorite(
  favoriteIds: FavoriteToolIds,
  toolId: string,
): FavoriteToolIds {
  const normalized = assertValidId(toolId);
  if (favoriteIds.includes(normalized)) {
    return Object.freeze(favoriteIds.filter((favorite) => favorite !== normalized));
  }
  return Object.freeze([...favoriteIds, normalized]);
}

export function addRecent(
  recentIds: RecentToolIds,
  toolId: string,
  limit: number = DEFAULT_RECENT_TOOL_LIMIT,
): RecentToolIds {
  const normalized = assertValidId(toolId);
  assertValidRecentLimit(limit);
  const ordered = [normalized, ...recentIds.filter((recent) => recent !== normalized)];
  return Object.freeze(ordered.slice(0, limit));
}

export function resolveFavorites(
  entries: ReadonlyArray<ToolRegistryEntry>,
  favoriteIds: FavoriteToolIds,
): ReadonlyArray<ToolRegistryEntry> {
  const byId = new Map(entries.map((entry) => [entry.definition.id, entry]));
  const resolved: ToolRegistryEntry[] = [];
  for (const favoriteId of favoriteIds) {
    const entry = byId.get(favoriteId);
    if (entry !== undefined) {
      resolved.push(entry);
    }
  }
  return resolved;
}

export function resolveRecents(
  entries: ReadonlyArray<ToolRegistryEntry>,
  recentIds: RecentToolIds,
): ReadonlyArray<ToolRegistryEntry> {
  return resolveFavorites(entries, recentIds);
}
