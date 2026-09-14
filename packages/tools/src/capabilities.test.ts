import type { ToolDefinition } from "@rovotools/types";
import { describe, expect, it } from "vitest";

import { getToolCapabilityMatrix } from "./capabilities";
import { defineTool } from "./define-tool";
import { ToolRegistry } from "./registry";

function localTool(): ToolDefinition {
  return defineTool({
    id: "bmi-calculator",
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate body mass index.",
    category: "calculator",
    icon: "activity",
    keywords: ["bmi"],
    featured: true,
    popular: true,
    supportedPlatforms: ["WEB", "PWA", "ANDROID", "IOS"],
    processingMode: "LOCAL",
    supportedFormats: [],
    requiresNetwork: false,
    localizationKey: "tools.bmi-calculator",
    relatedTools: [],
    nameKey: "tools.bmi-calculator.name",
    descriptionKey: "tools.bmi-calculator.description",
    metadata: { version: "1.0.0", isOfflineCapable: true, tags: ["health"] },
    inputs: [{ id: "weightKg", type: "string", labelKey: "w", required: true }],
    outputs: [{ id: "bmi", type: "number", labelKey: "b" }],
    validate: () => ({ valid: true, errors: [] }),
    execute: async () => ({}),
  });
}

function serverTool(): ToolDefinition {
  return defineTool({
    ...localTool(),
    id: "server-tool",
    slug: "server-tool",
    name: "Server Tool",
    processingMode: "SERVER",
    requiresNetwork: true,
    supportedPlatforms: ["WEB"],
    metadata: { version: "1.0.0", isOfflineCapable: false, tags: [] },
  });
}

describe("capability matrix", () => {
  it("marks local tools offline-capable on every supported platform", () => {
    const matrix = getToolCapabilityMatrix(localTool());
    expect(matrix.offlineCapableOn).toEqual(["WEB", "PWA", "ANDROID", "IOS"]);
    expect(matrix.requiresFileSystem).toBe(false);
    expect(matrix.requiresCamera).toBe(false);
    expect(matrix.shareable).toBe(true);
    for (const platform of matrix.platforms) {
      expect(platform.supported).toBe(true);
      expect(platform.localProcessing).toBe(true);
      expect(platform.serverProcessing).toBe(false);
      expect(platform.requiredCapabilities).toContain("local-storage");
      expect(platform.requiredCapabilities).toContain("share");
      expect(platform.requiredCapabilities).not.toContain("network");
    }
  });

  it("marks unsupported platforms and server processing correctly", () => {
    const matrix = getToolCapabilityMatrix(serverTool());
    expect(matrix.offlineCapableOn).toEqual([]);
    const android = matrix.platforms.find((platform) => platform.platform === "ANDROID");
    expect(android?.supported).toBe(false);
    expect(android?.offlineCapable).toBe(false);
    const web = matrix.platforms.find((platform) => platform.platform === "WEB");
    expect(web?.serverProcessing).toBe(true);
    expect(web?.requiredCapabilities).toContain("network");
  });

  it("flags file inputs as file-system requirements", () => {
    const base = localTool();
    const withFile = defineTool({
      ...base,
      id: "file-tool",
      slug: "file-tool",
      inputs: [{ id: "document", type: "file", labelKey: "d", required: true }],
    });
    const matrix = getToolCapabilityMatrix(withFile);
    expect(matrix.requiresFileSystem).toBe(true);
    expect(matrix.platforms[0]?.requiredCapabilities).toContain("file-system");
  });

  it("exposes one matrix per registered tool", () => {
    const registry = new ToolRegistry();
    registry.register({ definition: localTool() });
    registry.register({ definition: serverTool() });
    const matrices = registry.capabilityMatrices();
    expect(matrices.map((matrix) => matrix.toolId).sort()).toEqual([
      "bmi-calculator",
      "server-tool",
    ]);
    expect(registry.capabilityMatrix("bmi-calculator").shareable).toBe(true);
  });
});
