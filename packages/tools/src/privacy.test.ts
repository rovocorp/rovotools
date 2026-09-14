import type { ToolDefinition, ToolInputField } from "@rovotools/types";
import { describe, expect, it } from "vitest";

import { defineTool } from "./define-tool";
import { getToolPrivacyModel } from "./privacy";
import { ToolRegistry } from "./registry";

function baseOptions(id: string, inputs: ReadonlyArray<ToolInputField> = []) {
  return {
    id,
    slug: id,
    name: id,
    description: `${id} description`,
    category: "utility" as const,
    icon: "utility",
    keywords: [id],
    featured: false,
    popular: false,
    supportedPlatforms: ["WEB", "PWA", "ANDROID", "IOS"] as const,
    processingMode: "LOCAL" as const,
    supportedFormats: [],
    requiresNetwork: false,
    localizationKey: `tools.${id}`,
    relatedTools: [],
    nameKey: `tools.${id}.name`,
    descriptionKey: `tools.${id}.description`,
    metadata: { version: "1.0.0", isOfflineCapable: true, tags: [] },
    inputs,
    outputs: [],
    validate: () => ({ valid: true, errors: [] }),
    execute: async () => ({}),
  };
}

function definition(id: string, inputs: ReadonlyArray<ToolInputField> = []): ToolDefinition {
  return defineTool(baseOptions(id, inputs));
}

describe("tool privacy model", () => {
  it("marks local tools as memory-only with no permissions", () => {
    const model = getToolPrivacyModel(definition("bmi-calculator"));
    expect(model).toMatchObject({
      processing: "LOCAL",
      offlineCapable: true,
      permissions: [],
      collectsPersonalData: false,
      storesInputs: false,
      sharesWithServer: false,
      retention: "memory-only",
    });
  });

  it("derives file, photo, and camera permissions from inputs", () => {
    const fileField: ToolInputField = { id: "document", type: "file", labelKey: "d", required: true };
    expect(getToolPrivacyModel(definition("file-tool", [fileField])).permissions).toEqual(["files"]);

    const photoField: ToolInputField = { id: "photo", type: "file", labelKey: "p", required: true };
    expect(getToolPrivacyModel(definition("photo-tool", [photoField])).permissions).toEqual([
      "camera",
      "photos",
      "files",
    ]);

    const cameraField: ToolInputField = { id: "camera", type: "file", labelKey: "c", required: true };
    expect(getToolPrivacyModel(definition("camera-tool", [cameraField])).permissions).toEqual([
      "camera",
      "files",
    ]);
  });

  it("flags server processing as sharing with a server", () => {
    const server = defineTool({
      ...baseOptions("server-tool"),
      processingMode: "SERVER",
      requiresNetwork: true,
      metadata: { version: "1.0.0", isOfflineCapable: false, tags: [] },
    });
    const model = getToolPrivacyModel(server);
    expect(model.sharesWithServer).toBe(true);
    expect(model.offlineCapable).toBe(false);
  });

  it("exposes one model per registered tool", () => {
    const registry = new ToolRegistry();
    registry.register({ definition: definition("bmi-calculator") });
    expect(registry.privacyModels().map((model) => model.toolId)).toEqual(["bmi-calculator"]);
    expect(registry.privacyModel("bmi-calculator").retention).toBe("memory-only");
  });
});
