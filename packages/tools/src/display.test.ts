import { describe, expect, it } from "vitest";

import { defineTool } from "./define-tool";
import { getFieldLabel, getFieldPlaceholder, getOutputLabel, getToolDisplay } from "./display";

const definition = defineTool({
  id: "bmi-calculator",
  slug: "bmi-calculator",
  name: "BMI Calculator",
  description: "Calculate body mass index.",
  category: "calculator",
  icon: "activity",
  keywords: ["bmi"],
  featured: true,
  popular: true,
  supportedPlatforms: ["WEB"],
  processingMode: "LOCAL",
  supportedFormats: [],
  requiresNetwork: false,
  localizationKey: "tools.bmi-calculator",
  relatedTools: [],
  nameKey: "tools.bmi-calculator.name",
  descriptionKey: "tools.bmi-calculator.description",
  metadata: { version: "1.0.0", isOfflineCapable: true, tags: [] },
  inputs: [
    {
      id: "weightKg",
      type: "string",
      labelKey: "tools.bmi-calculator.weight",
      placeholderKey: "tools.bmi-calculator.weightPlaceholder",
      required: true,
    },
  ],
  outputs: [],
  validate: () => ({ valid: true, errors: [] }),
  execute: async () => ({}),
});

describe("tool display localization", () => {
  it("resolves translated names and falls back to defaults", () => {
    expect(getToolDisplay("en", definition)).toEqual({
      name: "BMI Calculator",
      description: "Calculate body mass index from weight and height.",
    });
    expect(getToolDisplay("es", definition).name).toBe("BMI Calculator");
  });

  it("resolves field labels and placeholders", () => {
    const field = definition.inputs[0];
    if (field === undefined) {
      throw new Error("expected one input");
    }
    expect(getFieldLabel("en", field)).toBe("Weight (kg)");
    expect(getFieldPlaceholder("en", field)).toBe("e.g. 70");
    expect(getFieldPlaceholder("es", field)).toBe("e.g. 70");
  });

  it("keeps literal labels with decimals verbatim", () => {
    // Region option labels carry decimal standards ("14.975%"): splitting
    // them like key paths used to render fragments such as "975%".
    expect(
      getOutputLabel("en", {
        id: "quebec",
        type: "string",
        labelKey: "Canada, Quebec (GST + QST) — standard 14.975%",
      }),
    ).toBe("Canada, Quebec (GST + QST) — standard 14.975%");
    expect(getOutputLabel("en", { id: "x", type: "string", labelKey: "tools.nope.missing" })).toBe("missing");
  });
});
