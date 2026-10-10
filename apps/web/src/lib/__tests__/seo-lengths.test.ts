import { describe, expect, it } from "vitest";
import { en } from "@/shared/localization";
import { HOME_DESCRIPTION, HOME_TITLE } from "../seo-copy";

// Google truncates meta descriptions at ~155-160 chars and titles at ~60.
// Homepage copy keeps a margin; every localized SEO description must at
// least fit the hard 160-char limit (was: homepage hit 162 and truncated).

describe("homepage search copy", () => {
  it("description fits with margin (<=155 chars)", () => {
    expect(HOME_DESCRIPTION.length).toBeLessThanOrEqual(155);
  });

  it("title fits with margin (<=60 chars)", () => {
    expect(HOME_TITLE.length).toBeLessThanOrEqual(60);
  });
});

describe("localized SEO descriptions", () => {
  it("every seo description is <=160 chars", () => {
    const seo = en["seo"];
    expect(typeof seo).toBe("object");
    const failures: Array<string> = [];
    for (const [key, value] of Object.entries(seo as Record<string, unknown>)) {
      if (key.endsWith("Description") && typeof value === "string" && value.length > 160) {
        failures.push(`${key}: ${value.length} chars`);
      }
    }
    expect(failures).toEqual([]);
  });
});
