import { describe, expect, it } from "vitest";
import { getCategoryLabel } from "../category-label";

describe("getCategoryLabel", () => {
  it("uses curated titles so abbreviations render correctly", () => {
    expect(getCategoryLabel("seo")).toBe("SEO Tools");
    expect(getCategoryLabel("qr")).toBe("QR & Barcode Tools");
    expect(getCategoryLabel("pdf")).toBe("PDF Tools");
    expect(getCategoryLabel("calculator")).toBe("Calculators & Converters");
    expect(getCategoryLabel("finance")).toBe("Finance Tools");
  });

  it("falls back to the raw slug for unknown categories", () => {
    expect(getCategoryLabel("something-new")).toBe("something-new");
  });
});
