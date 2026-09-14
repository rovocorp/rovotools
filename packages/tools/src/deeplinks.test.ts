import { describe, expect, it } from "vitest";

import {
  buildAppRoute,
  buildCustomSchemeUrl,
  buildWebUrl,
  hasSensitiveQueryParams,
  parseDeepLink,
  stripSensitiveQueryParams,
} from "./deeplinks";

describe("parseDeepLink", () => {
  it("parses canonical web tool URLs", () => {
    expect(parseDeepLink("https://rovotools.com/tools/bmi-calculator")).toEqual({
      kind: "tool",
      slug: "bmi-calculator",
    });
  });

  it("parses category, blog, settings, and home URLs", () => {
    expect(parseDeepLink("https://rovotools.com/tools/category/calculator")).toEqual({
      kind: "category",
      category: "calculator",
    });
    expect(parseDeepLink("https://rovotools.com/blog/bmi-explained")).toEqual({
      kind: "blog",
      slug: "bmi-explained",
    });
    expect(parseDeepLink("https://rovotools.com/settings")).toEqual({
      kind: "settings",
      screen: "theme",
    });
    expect(parseDeepLink("https://rovotools.com/privacy")).toEqual({
      kind: "settings",
      screen: "privacy",
    });
    expect(parseDeepLink("https://rovotools.com/")).toEqual({ kind: "home" });
  });

  it("parses custom-scheme URLs", () => {
    expect(parseDeepLink("rovotools://tools/bmi-calculator")).toEqual({
      kind: "tool",
      slug: "bmi-calculator",
    });
  });

  it("rejects foreign hosts and sensitive query params", () => {
    expect(parseDeepLink("https://evil.com/tools/bmi-calculator")).toBeNull();
    expect(parseDeepLink("https://rovotools.com/tools/bmi-calculator?token=abc")).toBeNull();
    expect(parseDeepLink("https://rovotools.com/tools/bmi-calculator?api_key=abc")).toBeNull();
    expect(parseDeepLink("not a url at all")).toBeNull();
  });
});

describe("builders", () => {
  it("round-trips tool links across web, app, and scheme forms", () => {
    const link = { kind: "tool", slug: "bmi-calculator" } as const;
    expect(buildWebUrl(link)).toBe("https://rovotools.com/tools/bmi-calculator");
    expect(buildAppRoute(link)).toBe("/tools/bmi-calculator");
    expect(buildCustomSchemeUrl(link)).toBe("rovotools://tools/bmi-calculator");
  });

  it("maps categories to filtered tool routes and blog to web fallback", () => {
    expect(buildAppRoute({ kind: "category", category: "calculator" })).toBe(
      "/tools?category=calculator",
    );
    expect(buildAppRoute({ kind: "blog", slug: "bmi-explained" })).toBeNull();
    expect(buildWebUrl({ kind: "blog", slug: "bmi-explained" })).toBe(
      "https://rovotools.com/blog/bmi-explained",
    );
  });
});

describe("query safety", () => {
  it("detects and strips sensitive params while keeping safe ones", () => {
    expect(hasSensitiveQueryParams("https://rovotools.com/tools/x?token=1")).toBe(true);
    expect(hasSensitiveQueryParams("https://rovotools.com/tools/x?q=bmi")).toBe(false);
    expect(
      stripSensitiveQueryParams("https://rovotools.com/tools/x?q=bmi&token=1&category=a"),
    ).toBe("https://rovotools.com/tools/x?q=bmi&category=a");
    expect(stripSensitiveQueryParams("https://rovotools.com/tools/x?token=1")).toBe(
      "https://rovotools.com/tools/x",
    );
  });
});
