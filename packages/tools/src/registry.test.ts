import type { ToolRegistryEntry } from "@rovotools/types";
import { describe, expect, it } from "vitest";

import {
  addRecent,
  defineTool,
  getToolPageMetadata,
  getToolRoute,
  resolveFavorites,
  resolveRecents,
  toggleFavorite,
  toSitemapEntries,
  ToolRegistry,
  validateRegistryEntries,
} from "./index";

function createEntry(
  id: string,
  overrides: Partial<ToolRegistryEntry["definition"]> = {},
): ToolRegistryEntry {
  const base = defineTool({
    id,
    slug: id,
    name: `${id} tool`,
    description: `${id} description`,
    category: "utility",
    icon: "utility",
    keywords: [id],
    featured: false,
    popular: false,
    supportedPlatforms: ["WEB", "PWA", "ANDROID", "IOS"],
    processingMode: "LOCAL",
    supportedFormats: [],
    requiresNetwork: false,
    localizationKey: `tools.${id}`,
    relatedTools: [],
    nameKey: `tools.${id}.name`,
    descriptionKey: `tools.${id}.description`,
    metadata: {
      version: "1.0.0",
      isOfflineCapable: true,
      tags: [id],
    },
    inputs: [],
    outputs: [],
    validate: () => ({ valid: true, errors: [] }),
    execute: async () => ({}),
  });

  return {
    definition: {
      ...base,
      ...overrides,
    },
  };
}

describe("tool registration", () => {
  it("rejects duplicate ids and slugs", () => {
    const registry = new ToolRegistry();
    registry.register(createEntry("unit-converter"));
    expect(() => registry.register(createEntry("unit-converter"))).toThrow();
    expect(() =>
      registry.register(
        createEntry("other-tool", {
          id: "other-tool",
          slug: "unit-converter",
          name: "Other",
          description: "Other",
          localizationKey: "tools.other",
          nameKey: "tools.other.name",
          descriptionKey: "tools.other.description",
        }),
      ),
    ).toThrow();
  });

  it("rejects invalid slugs and empty platforms", () => {
    expect(() =>
      defineTool({
        ...createEntry("valid-tool").definition,
        id: "bad-tool",
        slug: "Bad Slug!",
      }),
    ).toThrow();
    expect(() =>
      defineTool({
        ...createEntry("offline-tool").definition,
        id: "offline-tool",
        supportedPlatforms: [],
      }),
    ).toThrow();
  });
});

describe("tool discovery", () => {
  it("filters, searches, sorts, and paginates from one source", () => {
    const registry = new ToolRegistry();
    registry.registerMany([
      createEntry("unit-converter", {
        name: "Unit Converter",
        description: "Convert units",
        category: "converter",
        featured: true,
        popular: true,
        keywords: ["unit", "convert"],
      }),
      createEntry("date-calculator", {
        name: "Date Calculator",
        description: "Calculate dates",
        category: "calculator",
        popular: true,
        supportedPlatforms: ["WEB", "PWA"],
        keywords: ["date"],
      }),
      createEntry("server-tool", {
        name: "Server Tool",
        description: "Server processing",
        category: "analytics",
        processingMode: "SERVER",
        requiresNetwork: true,
        supportedPlatforms: ["WEB"],
        metadata: {
          version: "1.0.0",
          isOfflineCapable: false,
          tags: ["server"],
        },
      }),
    ]);

    expect(registry.query({ platform: "ANDROID" }).map((entry) => entry.definition.id)).toEqual([
      "unit-converter",
    ]);
    expect(registry.featured().map((entry) => entry.definition.id)).toEqual(["unit-converter"]);
    expect(registry.search("date").map((entry) => entry.definition.id)).toEqual([
      "date-calculator",
    ]);
    expect(
      registry
        .query({ sortBy: "name", limit: 2, offset: 1 })
        .map((entry) => entry.definition.id),
    ).toEqual(["server-tool", "unit-converter"]);
    expect(registry.categories()).toEqual([
      { category: "analytics", count: 1 },
      { category: "calculator", count: 1 },
      { category: "converter", count: 1 },
    ]);
  });

  it("resolves explicit relations before category backfill", () => {
    const registry = new ToolRegistry();
    registry.registerMany([
      createEntry("unit-converter", {
        category: "converter",
        relatedTools: ["date-calculator"],
      }),
      createEntry("date-calculator", { category: "calculator" }),
      createEntry("length-converter", { category: "converter" }),
    ]);

    const related = registry.related("unit-converter", 2).map((entry) => entry.definition.id);
    expect(related[0]).toBe("date-calculator");
    expect(related).toContain("length-converter");
  });
});

describe("favorites and recents", () => {
  it("toggles, orders, resolves, and drops unknown tools", () => {
    const entries = [createEntry("alpha"), createEntry("beta")];
    const favorites = toggleFavorite(toggleFavorite([], "alpha"), "beta");
    expect(resolveFavorites(entries, favorites).map((entry) => entry.definition.id)).toEqual([
      "alpha",
      "beta",
    ]);
    expect(toggleFavorite(favorites, "alpha")).toEqual(["beta"]);

    const recents = addRecent(addRecent([], "beta"), "alpha");
    expect(recents).toEqual(["alpha", "beta"]);
    expect(
      resolveRecents(entries, [...recents, "missing-tool"]).map(
        (entry) => entry.definition.id,
      ),
    ).toEqual(["alpha", "beta"]);
  });
});

describe("routes, metadata, and sitemap", () => {
  it("derives all three from the registry entry", () => {
    const entry = createEntry("unit-converter", {
      name: "Unit Converter",
      description: "Convert units",
    });
    expect(getToolRoute(entry)).toEqual({
      id: "unit-converter",
      slug: "unit-converter",
      path: "/tools/unit-converter",
      params: { toolId: "unit-converter" },
    });
    expect(getToolPageMetadata(entry, "https://rovotools.com")).toMatchObject({
      title: "Unit Converter | RovoTools",
      canonicalPath: "/tools/unit-converter",
      canonicalUrl: "https://rovotools.com/tools/unit-converter",
    });

    const hidden = createEntry("hidden-tool", {
      seo: {
        title: "Hidden",
        description: "Hidden",
        keywords: ["hidden"],
        noIndex: true,
      },
    });
    expect(
      toSitemapEntries([entry, hidden], "https://rovotools.com").map((item) => item.path),
    ).toEqual(["/tools/unit-converter"]);
  });
});

describe("registry validation", () => {
  it("reports dangling relations and offline inconsistencies", () => {
    const issues = validateRegistryEntries([
      createEntry("offline-tool", {
        requiresNetwork: true,
        metadata: {
          version: "1.0.0",
          isOfflineCapable: true,
          tags: ["offline-tool"],
        },
        relatedTools: ["missing-tool"],
      }),
    ]);
    expect(issues.map((issue) => issue.code).sort()).toEqual([
      "inconsistent-offline-capability",
      "unknown-related-tool",
    ]);
  });
});
