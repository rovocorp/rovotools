import { describe, expect, it } from "vitest";

import { EXTRA_TOOLS } from "./catalog";

function getTool() {
  const entry = EXTRA_TOOLS.find((tool) => tool.definition.id === "date-difference-calculator");
  if (entry === undefined) {
    throw new Error("date-difference-calculator not found");
  }
  return entry.definition;
}

describe("date-difference-calculator", () => {
  it("exposes years and breakdown outputs", () => {
    const ids = getTool().outputs.map((output) => output.id);
    expect(ids).toEqual(["years", "breakdown", "days", "weeks", "monthsApprox"]);
  });

  it("accepts DD-MM-YYYY, DD/MM/YYYY and YYYY-MM-DD with age-like years", async () => {
    const tool = getTool();
    for (const from of ["01-01-2020", "01/01/2020", "2020-01-01"]) {
      expect(tool.validate({ from, to: "12-09-2026" }).valid).toBe(true);
      const output = (await tool.execute({ from, to: "12-09-2026" })) as Record<string, unknown>;
      expect(output["years"]).toBe(6);
      expect(output["breakdown"]).toBe("6 years, 8 months, 11 days");
      expect(output["days"]).toBe(2446);
    }
  });

  it("shows wrong-date messages for invalid and reversed dates", () => {
    const tool = getTool();
    expect(tool.validate({ from: "31-02-2026", to: "12-09-2026" }).valid).toBe(false);
    const reversed = tool.validate({ from: "12-09-2026", to: "01-01-2026" });
    expect(reversed.valid).toBe(false);
    expect(reversed.errors[0]?.message).toMatch(/on or after/i);
  });
});
