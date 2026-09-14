import { describe, expect, it } from "vitest";

import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

registerCoreTools(toolRegistry);

async function run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const entry = toolRegistry.require("keyword-density-checker");
  const v = entry.definition.validate(input);
  expect(v.valid).toBe(true);
  return (await entry.definition.execute(input)) as Record<string, unknown>;
}

describe("keyword-density-checker behavior", () => {
  it("counts words and ranks phrases with percentages", async () => {
    const out = await run({ text: "Dogs are great. Dogs love walks. Cats are great too.", top: "5", maxWords: "1" });
    expect(out["totalWords"]).toBe(10);
    expect(String(out["topPhrases"])).toContain("dogs — 2 (20.00%)");
  });

  it("filters stopwords and finds two-word phrases", async () => {
    const out = await run({ text: "The quick brown fox jumps. The quick brown dog runs.", top: "6", maxWords: "2" });
    const lines = String(out["topPhrases"]);
    expect(lines).toContain("quick brown — 2");
    expect(lines).not.toMatch(/(^|\n)the( —|\n)/);
  });

  it("rejects empty text and bad phrase length", async () => {
    const entry = toolRegistry.require("keyword-density-checker");
    expect(entry.definition.validate({ text: "" }).valid).toBe(false);
    await expect(entry.definition.execute({ text: "hello world", top: "5", maxWords: "9" })).rejects.toThrow();
  });
});
