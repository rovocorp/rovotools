import { describe, expect, it } from "vitest";

import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

registerCoreTools(toolRegistry);

async function run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const entry = toolRegistry.require("adsense-earnings-calculator");
  const v = entry.definition.validate(input);
  expect(v.valid).toBe(true);
  return (await entry.definition.execute(input)) as Record<string, unknown>;
}

const base = { pageviews: "100000", mode: "ctr-cpc", ctr: "1.5", cpc: "0.25", rpm: "", currency: "USD" };

describe("adsense-earnings-calculator behavior", () => {
  it("computes ctr-cpc earnings in USD", async () => {
    const out = await run({ ...base });
    expect(out["monthly"]).toBe(375);
    expect(out["daily"]).toBe(12.5);
  });

  it("computes rpm earnings and converts to INR at the table rate", async () => {
    const out = await run({ ...base, mode: "rpm", rpm: "4", currency: "INR" });
    expect(out["monthly"]).toBe(38200);
    expect(String(out["assumptions"])).toContain("INR");
    expect(String(out["assumptions"])).toContain("approximate built-in rate");
  });

  it("supports more currencies and custom rate overrides", async () => {
    const eur = await run({ ...base, currency: "EUR" });
    expect(eur["monthly"]).toBe(322.5);
    const custom = await run({ ...base, currency: "INR", rate: "90" });
    expect(custom["monthly"]).toBe(33750);
    expect(String(custom["assumptions"])).toContain("custom rate");
    const unknown = await run({ ...base, currency: "XX" });
    expect(unknown["monthly"]).toBe(375);
  });

  it("rejects bad input", async () => {
    const entry = toolRegistry.require("adsense-earnings-calculator");
    expect(entry.definition.validate({ ...base, pageviews: "" }).valid).toBe(false);
    await expect(run({ ...base, mode: "rpm", rpm: "" })).rejects.toThrow();
    await expect(run({ ...base, mode: "cpm" })).rejects.toThrow();
    await expect(run({ ...base, currency: "INR", rate: "-2" })).rejects.toThrow();
  });
});
