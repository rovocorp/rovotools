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

  it("covers major APAC and world standards", async () => {
    const pk = await run({ ...base, region: "pakistan", rate: "", customRate: "" });
    expect(pk["tax"]).toBe(180);
    expect(String(pk["appliedRate"])).toContain("Standard 18%");
    const cn = await run({ ...base, region: "china", rate: "", customRate: "" });
    expect(cn["tax"]).toBe(130);
    const nz = await run({ ...base, region: "new-zealand", rate: "", customRate: "" });
    expect(nz["tax"]).toBe(150);
    const kr = await run({ ...base, region: "south-korea", rate: "", customRate: "" });
    expect(kr["tax"]).toBe(100);
  });

  it("uses US state and Canadian province standards", async () => {
    const ca = await run({ ...base, region: "usa-california", rate: "", customRate: "" });
    expect(ca["tax"]).toBe(72.5);
    expect(String(ca["appliedRate"])).toContain("Standard 7.25%");
    expect(String(ca["split"])).toContain("no split");
    const qc = await run({ ...base, region: "canada-quebec", rate: "", customRate: "" });
    expect(qc["tax"]).toBe(149.75);
    expect(String(qc["appliedRate"])).toContain("Standard 14.975%");
    const tx = await run({ ...base, region: "usa-texas", rate: "", customRate: "" });
    expect(tx["tax"]).toBe(62.5);
  });

  it("stacks extra tax rows additively on the base rate", async () => {
    const out = await run({ ...base, region: "usa-california", rate: "", customRate: "", mode: "add", extraTaxes: "City = 1.5\nCounty: 0.5" });
    expect(out["net"]).toBe(1000);
    expect(out["tax"]).toBe(92.5);
    expect(out["gross"]).toBe(1092.5);
    expect(String(out["appliedRate"])).toContain("+ 2% stacked (City, County).");
    expect(String(out["extras"])).toContain("Stacked total: 2%");
  });

  it("rejects malformed extra tax lines", async () => {
    const entry = toolRegistry.require("tax-calculator");
    expect(entry.definition.validate({ ...base, extraTaxes: "City = lots" }).valid).toBe(false);
    expect(entry.definition.validate({ ...base, extraTaxes: "City = 150" }).valid).toBe(false);
    expect(entry.definition.validate({ ...base, extraTaxes: "" }).valid).toBe(true);
  });

  it("computes with a custom rate when no region is selected", async () => {
    const entry = toolRegistry.require("tax-calculator");
    expect(entry.definition.validate({ ...base, region: "", customRate: "12" }).valid).toBe(true);
    const out = (await entry.definition.execute({ ...base, region: "", customRate: "12" })) as Record<string, unknown>;
    expect(out["net"]).toBe(1000);
    expect(out["tax"]).toBe(120);
    expect(out["gross"]).toBe(1120);
    expect(String(out["appliedRate"])).toBe("Custom 12% applied.");
    expect(out["split"]).toBe("Single custom levy — no split.");
  });

  it("requires a region or a custom rate — never assumes one", async () => {
    const entry = toolRegistry.require("tax-calculator");
    const validation = entry.definition.validate({ ...base, region: "", customRate: "" });
    expect(validation.valid).toBe(false);
    await expect(entry.definition.execute({ ...base, region: "", customRate: "" })).rejects.toThrow(
      "Select a region or enter a custom rate.",
    );
  });

  it("rejects bad input", async () => {
    const entry = toolRegistry.require("tax-calculator");
    expect(entry.definition.validate({ ...base, amount: "" }).valid).toBe(false);
    await expect(run({ ...base, region: "atlantis" })).rejects.toThrow();
    await expect(run({ ...base, customRate: "150" })).rejects.toThrow();
    await expect(run({ ...base, mode: "multiply" })).rejects.toThrow();
  });
});
