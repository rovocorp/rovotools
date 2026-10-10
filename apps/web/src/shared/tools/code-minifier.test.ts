import { describe, expect, it } from "vitest";

import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

registerCoreTools(toolRegistry);

async function run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const entry = toolRegistry.require("code-minifier");
  const v = entry.definition.validate(input);
  expect(v.valid).toBe(true);
  return (await entry.definition.execute(input)) as Record<string, unknown>;
}

describe("code-minifier behavior", () => {
  it("minifies js and strips line comments", async () => {
    const out = await run({ code: "function add( a, b ) { // sum\n  return a + b;\n}", language: "js", mode: "minify" });
    expect(out["result"]).toBe("function add(a,b){return a+b;}");
    expect(out["savedBytes"] as number).toBeGreaterThan(0);
  });

  it("protects strings and urls", async () => {
    const out = await run({ code: 'const u = "https://example.com/x"; // real comment\nconst s = "a  b";', language: "js", mode: "minify" });
    expect(out["result"]).toBe('const u="https://example.com/x";const s="a  b";');
  });

  it("minifies css", async () => {
    const out = await run({ code: "a { color : red ; } /* c */", language: "css", mode: "minify" });
    expect(out["result"]).toBe("a{color:red}");
  });

  it("minifies html", async () => {
    const out = await run({ code: "<!-- c --><div>\n  <p>hi</p>\n</div>", language: "html", mode: "minify" });
    expect(out["result"]).toBe("<div><p>hi</p></div>");
  });

  it("beautifies js with indentation", async () => {
    const out = await run({ code: "function f(){if(x){y();}}", language: "js", mode: "beautify" });
    const result = String(out["result"]);
    expect(result).toContain("\n");
    expect(result).toMatch(/if\(x\) \{\n {4}y\(\);/);
    expect(out["savedBytes"] as number).toBeLessThan(0);
  });

  it("beautifies html with nesting", async () => {
    const out = await run({ code: "<div><p>hi</p></div>", language: "html", mode: "beautify" });
    expect(String(out["result"])).toBe("<div>\n  <p>hi</p>\n</div>");
  });

  it("rejects unknown language", async () => {
    const entry = toolRegistry.require("code-minifier");
    await expect(entry.definition.execute({ code: "x", language: "python", mode: "minify" })).rejects.toThrow();
  });
});
