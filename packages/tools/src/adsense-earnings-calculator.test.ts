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

  it("computes rpm earnings and converts to INR", async () => {
    const out = await run({ ...base, mode: "rpm", rpm: "4", currency: "INR" });
    expect(out["monthly"]).toBe(33200);
    expect(String(out["assumptions"])).toContain("INR");
  });

  it("rejects bad input", async () => {
    const entry = toolRegistry.require("adsense-earnings-calculator");
    expect(entry.definition.validate({ ...base, pageviews: "" }).valid).toBe(false);
    await expect(run({ ...base, mode: "rpm", rpm: "" })).rejects.toThrow();
    await expect(run({ ...base, mode: "cpm" })).rejects.toThrow();
  });
});
