import { describe, expect, it } from "vitest";

import {
  FX_API_ATTRIBUTION,
  FX_CURRENCIES,
  FX_CURRENCY_OPTIONS,
  convertFromUsd,
  fetchLiveUsdRates,
  formatMoney,
  fxCurrency,
  googleFinanceUrl,
  resolveFxRate,
} from "./fx";

describe("fx helpers", () => {
  it("lists top currencies with symbols", () => {
    expect(FX_CURRENCIES.length).toBeGreaterThanOrEqual(10);
    expect(fxCurrency("inr")?.symbol).toBe("₹");
    expect(fxCurrency("USD")?.name).toBe("US Dollar");
    expect(fxCurrency("xx")).toBeUndefined();
    expect(FX_CURRENCY_OPTIONS.map((o) => o.value)).toContain("USD");
  });

  it("resolves custom rates first", () => {
    expect(resolveFxRate("INR", "90")).toEqual({ currency: "INR", rate: 90, source: "custom" });
    expect(() => resolveFxRate("INR", "-3")).toThrow();
    expect(() => resolveFxRate("INR", "abc")).toThrow();
  });

  it("falls back to static table and USD", () => {
    expect(resolveFxRate("", "").currency).toBe("USD");
    const inr = resolveFxRate("INR", "");
    expect(inr.source).toBe("static");
    expect(inr.rate).toBeGreaterThan(0);
    expect(resolveFxRate("XX", "").currency).toBe("USD");
  });

  it("prefers live rates when provided", () => {
    const live = { base: "USD", date: "x", rates: { INR: 88.42 } };
    expect(resolveFxRate("INR", "", live)).toEqual({ currency: "INR", rate: 88.42, source: "live" });
    expect(resolveFxRate("EUR", "", live).source).toBe("static");
  });

  it("converts and formats money", () => {
    expect(convertFromUsd(375, 88.5)).toBe(33187.5);
    expect(formatMoney(375, "USD")).toContain("375");
    expect(googleFinanceUrl("USD", "INR")).toBe("https://www.google.com/finance/quote/USD-INR");
    expect(FX_API_ATTRIBUTION).toBe("open.er-api.com");
  });

  it("fetches live rates and rejects bad shapes", async () => {
    const ok = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ base_code: "USD", time_last_update_utc: "Mon, 14 Sep 2026", rates: { INR: 88.42 } }),
      });
    const live = await fetchLiveUsdRates(ok);
    expect(live.rates["INR"]).toBe(88.42);

    const badStatus = () => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
    await expect(fetchLiveUsdRates(badStatus)).rejects.toThrow();

    const badShape = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ nope: 1 }) });
    await expect(fetchLiveUsdRates(badShape)).rejects.toThrow();

    const throwing = () => Promise.reject(new Error("offline"));
    await expect(fetchLiveUsdRates(throwing)).rejects.toThrow();
  });
});
