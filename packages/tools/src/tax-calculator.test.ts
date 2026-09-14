import { describe, expect, it } from "vitest";

import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

registerCoreTools(toolRegistry);

async function run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const entry = toolRegistry.require("tax-calculator");
  const v = entry.definition.validate(input);
  expect(v.valid).toBe(true);
  return (await entry.definition.execute(input)) as Record<string, unknown>;
}

const base = { amount: "1000", region: "india", rate: "18", customRate: "", mode: "add" };

describe("tax-calculator behavior", () => {
  it("adds GST with CGST/SGST split", async () => {
    const out = await run({ ...base });
    expect(out["net"]).toBe(1000);
    expect(out["tax"]).toBe(180);
    expect(out["gross"]).toBe(1180);
    expect(out["split"]).toBe("CGST (9%): 90.00, SGST (9%): 90.00");
  });

  it("removes tax by division, not subtraction", async () => {
    const out = await run({ ...base, amount: "1180", mode: "remove" });
    expect(out["net"]).toBe(1000);
    expect(out["tax"]).toBe(180);
    expect(out["gross"]).toBe(1180);
  });

  it("uses regional standards and custom overrides", async () => {
    const uk = await run({ ...base, region: "uk", rate: "", customRate: "" });
    expect(uk["tax"]).toBe(200);
    expect(String(uk["appliedRate"])).toContain("Standard 20%");
    const custom = await run({ ...base, region: "uk", rate: "20", customRate: "7.5" });
    expect(custom["tax"]).toBe(75);
    expect(String(custom["appliedRate"])).toContain("Custom 7.5%");
  });

  it("rejects bad input", async () => {
    const entry = toolRegistry.require("tax-calculator");
    expect(entry.definition.validate({ ...base, amount: "" }).valid).toBe(false);
    await expect(run({ ...base, region: "atlantis" })).rejects.toThrow();
    await expect(run({ ...base, customRate: "150" })).rejects.toThrow();
    await expect(run({ ...base, mode: "multiply" })).rejects.toThrow();
  });
});
