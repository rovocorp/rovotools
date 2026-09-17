// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { getCustomToolComponent } from "../tools/custom/customTools";

describe("customTools", () => {
  it("falls back to the generic runner for engine-driven tools", () => {
    expect(getCustomToolComponent("json-formatter")).toBeUndefined();
    expect(getCustomToolComponent("code-minifier")).toBeUndefined();
    expect(getCustomToolComponent("no-such-tool")).toBeUndefined();
  });

  it("resolves bespoke fetch-analyzer UIs for the live checkers", () => {
    for (const slug of [
      "seo-checker",
      "open-graph-checker",
      "sitemap-checker",
      "tag-detector",
      "performance-analyzer",
    ]) {
      expect(getCustomToolComponent(slug)).toBeDefined();
    }
  });
});
