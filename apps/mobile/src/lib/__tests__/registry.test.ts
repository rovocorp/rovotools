import { getToolRegistry } from "@/lib/registry";

describe("mobile tool registry", () => {
  it("seeds the shared core tools exactly once", () => {
    const first = getToolRegistry();
    const second = getToolRegistry();
    expect(first).toBe(second);
    expect(first.count()).toBeGreaterThanOrEqual(40);
  });

  it("serves every tool on at least one mobile platform", () => {
    const registry = getToolRegistry();
    for (const entry of registry.getAll()) {
      const platforms = entry.definition.supportedPlatforms;
      expect(
        platforms.includes("ANDROID") || platforms.includes("IOS"),
      ).toBe(true);
    }
  });

  it("executes a shared calculation engine end to end", async () => {
    const registry = getToolRegistry();
    const bmi = registry.require("bmi-calculator");
    const validation = bmi.definition.validate({ weightKg: "70", heightCm: "175" });
    expect(validation.valid).toBe(true);
    const result = (await bmi.definition.execute({
      weightKg: "70",
      heightCm: "175",
    })) as Record<string, unknown>;
    expect(result["bmi"]).toBe(22.86);
    expect(result["category"]).toBe("normal");
  });

  it("resolves favorites and recents from id lists", () => {
    const registry = getToolRegistry();
    expect(
      registry.favorites(["bmi-calculator", "missing-tool"]).map((entry) => entry.definition.id),
    ).toEqual(["bmi-calculator"]);
    expect(registry.recents(["tip-calculator"]).map((entry) => entry.definition.id)).toEqual([
      "tip-calculator",
    ]);
  });
});
