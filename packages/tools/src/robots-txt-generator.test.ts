import { describe, expect, it } from "vitest";

import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

registerCoreTools(toolRegistry);

async function run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const entry = toolRegistry.require("robots-txt-generator");
  const v = entry.definition.validate(input);
  expect(v.valid).toBe(true);
  return (await entry.definition.execute(input)) as Record<string, unknown>;
}

describe("robots-txt-generator behavior", () => {
  it("builds the wordpress preset with sitemap and extras", async () => {
    const out = await run({ preset: "wordpress", sitemap: "https://example.com/sitemap.xml", disallow: "/private\ntmp", allow: "" });
    const txt = String(out["robotsTxt"]);
    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Disallow: /wp-admin/");
    expect(txt).toContain("Allow: /wp-admin/admin-ajax.php");
    expect(txt).toContain("Disallow: /private");
    expect(txt).toContain("Disallow: /tmp");
    expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
    expect(out["rules"]).toBe(4);
  });

  it("custom preset starts empty and shopify blocks store paths", async () => {
    const custom = await run({ preset: "custom", sitemap: "", disallow: "", allow: "/" });
    expect(String(custom["robotsTxt"])).toBe("User-agent: *\nAllow: /\n");
    const shopify = await run({ preset: "shopify", sitemap: "", disallow: "", allow: "" });
    expect(String(shopify["robotsTxt"])).toContain("Disallow: /checkout");
  });

  it("rejects unknown presets", async () => {
    const entry = toolRegistry.require("robots-txt-generator");
    await expect(entry.definition.execute({ preset: "wix", sitemap: "", disallow: "", allow: "" })).rejects.toThrow();
  });
});
