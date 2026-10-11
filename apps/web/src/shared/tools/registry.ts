import { ConfigurationError, NotFoundError } from "@/shared/core";
import type {
  FavoriteToolIds,
  RecentToolIds,
  RegistryIssue,
  ToolCapabilityMatrix,
  ToolCategory,
  ToolCategoryFacet,
  ToolDefinition,
  ToolPlatform,
  ToolQuery,
  ToolRegistryEntry,
} from "@/shared/types";

import { getToolCapabilityMatrix } from "./capabilities";
import {
  filterRegistryEntries,
  getCategoryFacets,
  getFeaturedTools,
  getPopularTools,
  getRelatedTools,
  searchTools,
  validateRegistryEntries,
} from "./discovery";
import { addRecent, resolveFavorites, resolveRecents, toggleFavorite } from "./history";
import { getToolPrivacyModel, type ToolPrivacyModel } from "./privacy";

// NOTE: no import from ./seo here on purpose. seo.ts pulls seo-copy.ts
// (every tool's long-form page copy), and this module is in the client chunk
// graph (ToolRunner, custom tools, CommandPalette). SEO helpers are server-
// only: call getToolPageMetadata/getToolRoute/toSitemapEntries from ./seo
// directly where needed.

export class ToolRegistry {
  private readonly byId = new Map<string, ToolRegistryEntry>();
  private readonly bySlug = new Map<string, ToolRegistryEntry>();

  register(entry: ToolRegistryEntry): void {
    const { id, slug } = entry.definition;
    const existingById = this.byId.get(id);
    if (existingById !== undefined && existingById.definition.slug !== slug) {
      throw new ConfigurationError(`Tool id "${id}" is already registered with another slug.`);
    }
    const existingBySlug = this.bySlug.get(slug);
    if (existingBySlug !== undefined && existingBySlug.definition.id !== id) {
      throw new ConfigurationError(`Tool slug "${slug}" is already registered with another id.`);
    }
    if (existingById !== undefined || existingBySlug !== undefined) {
      throw new ConfigurationError(`Tool "${id}" is already registered. Use upsert to replace it.`);
    }
    this.byId.set(id, entry);
    this.bySlug.set(slug, entry);
  }

  upsert(entry: ToolRegistryEntry): void {
    this.byId.set(entry.definition.id, entry);
    this.bySlug.set(entry.definition.slug, entry);
  }

  registerMany(entries: ReadonlyArray<ToolRegistryEntry>): void {
    for (const entry of entries) {
      this.register(entry);
    }
  }

  unregister(toolIdOrSlug: string): boolean {
    const entry = this.byId.get(toolIdOrSlug) ?? this.bySlug.get(toolIdOrSlug);
    if (entry === undefined) {
      return false;
    }
    this.byId.delete(entry.definition.id);
    this.bySlug.delete(entry.definition.slug);
    return true;
  }

  get(toolIdOrSlug: string): ToolRegistryEntry | undefined {
    return this.byId.get(toolIdOrSlug) ?? this.bySlug.get(toolIdOrSlug);
  }

  getById(toolId: string): ToolRegistryEntry | undefined {
    return this.byId.get(toolId);
  }

  getBySlug(slug: string): ToolRegistryEntry | undefined {
    return this.bySlug.get(slug);
  }

  require(toolIdOrSlug: string): ToolRegistryEntry {
    const entry = this.get(toolIdOrSlug);
    if (entry === undefined) {
      throw new NotFoundError("tool", toolIdOrSlug);
    }
    return entry;
  }

  getAll(): ReadonlyArray<ToolRegistryEntry> {
    return Array.from(this.byId.values());
  }

  getByCategory(category: ToolCategory): ReadonlyArray<ToolRegistryEntry> {
    return this.query({ category, sortBy: "name" });
  }

  getByPlatform(platform: ToolPlatform): ReadonlyArray<ToolRegistryEntry> {
    return this.query({ platform, sortBy: "name" });
  }

  query(query: ToolQuery = {}): ReadonlyArray<ToolRegistryEntry> {
    return filterRegistryEntries(this.getAll(), query);
  }

  search(search: string, query: ToolQuery = {}): ReadonlyArray<ToolRegistryEntry> {
    return searchTools(this.getAll(), search, query);
  }

  featured(limit?: number): ReadonlyArray<ToolRegistryEntry> {
    return getFeaturedTools(this.getAll(), limit);
  }

  popular(limit?: number): ReadonlyArray<ToolRegistryEntry> {
    return getPopularTools(this.getAll(), limit);
  }

  related(toolIdOrSlug: string, limit?: number): ReadonlyArray<ToolRegistryEntry> {
    return getRelatedTools(this.getAll(), toolIdOrSlug, limit ?? 6);
  }

  categories(): ReadonlyArray<ToolCategoryFacet> {
    return getCategoryFacets(this.getAll());
  }

  favorites(favoriteIds: FavoriteToolIds): ReadonlyArray<ToolRegistryEntry> {
    return resolveFavorites(this.getAll(), favoriteIds);
  }

  recents(recentIds: RecentToolIds): ReadonlyArray<ToolRegistryEntry> {
    return resolveRecents(this.getAll(), recentIds);
  }

  toggleFavoriteId(favoriteIds: FavoriteToolIds, toolId: string): FavoriteToolIds {
    return toggleFavorite(favoriteIds, toolId);
  }

  trackRecentId(
    recentIds: RecentToolIds,
    toolId: string,
    limit?: number,
  ): RecentToolIds {
    return limit === undefined ? addRecent(recentIds, toolId) : addRecent(recentIds, toolId, limit);
  }

  issues(): ReadonlyArray<RegistryIssue> {
    return validateRegistryEntries(this.getAll());
  }

  capabilityMatrix(toolIdOrSlug: string): ToolCapabilityMatrix {
    return getToolCapabilityMatrix(this.require(toolIdOrSlug).definition);
  }

  capabilityMatrices(): ReadonlyArray<ToolCapabilityMatrix> {
    return this.getAll().map((entry) => getToolCapabilityMatrix(entry.definition));
  }

  privacyModel(toolIdOrSlug: string): ToolPrivacyModel {
    return getToolPrivacyModel(this.require(toolIdOrSlug).definition);
  }

  privacyModels(): ReadonlyArray<ToolPrivacyModel> {
    return this.getAll().map((entry) => getToolPrivacyModel(entry.definition));
  }

  has(toolIdOrSlug: string): boolean {
    return this.get(toolIdOrSlug) !== undefined;
  }

  count(): number {
    return this.byId.size;
  }

  clear(): void {
    this.byId.clear();
    this.bySlug.clear();
  }

  toArray(): ToolDefinition[] {
    return this.getAll().map((entry) => entry.definition);
  }
}

export const toolRegistry = new ToolRegistry();
