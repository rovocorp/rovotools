import { describe, expect, it } from "vitest";

import { getAllCategoryMetadata, getCategoryMetadata, getCategoryPath } from "./categories";

describe("category metadata", () => {
  it("covers every tool category with unique paths", () => {
    const all = getAllCategoryMetadata();
    expect(all).toHaveLength(18);
    const paths = all.map((meta) => meta.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const meta of all) {
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
      expect(meta.keywords.length).toBeGreaterThan(0);
    }
  });

  it("builds calculator metadata and path", () => {
    expect(getCategoryPath("calculator")).toBe("/tools/category/calculator");
    const meta = getCategoryMetadata("calculator");
    expect(meta.title).toContain("Calculators");
    expect(meta.path).toBe("/tools/category/calculator");
  });
});
