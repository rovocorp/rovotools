import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatUnit,
  getLocaleDirection,
  isRtl,
  resolveLocale,
  toBcp47,
} from "./format";
import { t, tx } from "./i18n";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, TRANSLATED_LOCALES } from "./keys";

describe("locale resolution", () => {
  it("defaults to International English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(resolveLocale()).toBe("en");
    expect(resolveLocale("")).toBe("en");
    expect(resolveLocale("xx")).toBe("en");
  });

  it("normalizes regional variants", () => {
    expect(resolveLocale("en-US")).toBe("en");
    expect(resolveLocale("pt-BR")).toBe("pt");
    expect(resolveLocale("zh-CN")).toBe("zh");
    expect(resolveLocale("ar-EG")).toBe("ar");
  });

  it("lists every planned locale", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(14);
    expect(SUPPORTED_LOCALES[0]).toBe("en");
    expect(TRANSLATED_LOCALES).toEqual(["en", "ar", "ur"]);
  });
});

describe("text direction", () => {
  it("marks Arabic and Urdu as RTL", () => {
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("ur")).toBe(true);
    expect(isRtl("en")).toBe(false);
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("en")).toBe("ltr");
  });

  it("maps locales to BCP-47 tags", () => {
    expect(toBcp47("zh")).toBe("zh-CN");
    expect(toBcp47("en")).toBe("en");
  });
});

describe("translation lookup", () => {
  it("resolves English keys", () => {
    expect(t("en", "common.search")).toBe("Search");
    expect(t("en", "tools.bmi-calculator.name")).toBe("BMI Calculator");
  });

  it("resolves translated locales", () => {
    expect(t("ar", "common.search")).toBe("بحث");
  });

  it("falls back to English for untranslated locales and keys", () => {
    expect(t("es", "common.search")).toBe("Search");
    expect(t("ja", "tool.execute")).toBe("Calculate");
    expect(t("en", "seo.siteTitle")).toBe("RovoTools — Free Online Tools for Everyday Work");
  });

  it("interpolates variables", () => {
    expect(tx("en", "common.search")).toBe("Search");
    expect(tx("en", "seo.siteTitle", { brand: "X" })).toBe("RovoTools — Free Online Tools for Everyday Work");
  });
});

describe("formatters", () => {
  it("formats numbers per locale", () => {
    expect(formatNumber("en", 1234567.89)).toBe("1,234,567.89");
    expect(typeof formatNumber("ar", 1234.5)).toBe("string");
  });

  it("formats currency with a safe fallback", () => {
    expect(formatCurrency("en", 115, "USD")).toBe("$115.00");
    expect(formatCurrency("en", Number.NaN, "USD")).toBe("NaN");
  });

  it("formats ISO dates in UTC without shifting days", () => {
    expect(formatDate("en", "2026-09-11")).toContain("2026");
    expect(formatDate("en", "not-a-date")).toBe("not-a-date");
  });

  it("formats units with a plain fallback", () => {
    expect(formatUnit("en", 70, "kilogram")).toContain("70");
    expect(formatUnit("en", 70, "not-a-unit")).toBe("70 not-a-unit");
  });
});
