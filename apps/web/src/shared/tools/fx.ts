/**
 * Shared foreign-exchange helpers for currency-aware tools.
 *
 * Design: calculation engines stay pure and offline-safe. Live rates are an
 * optional UI-layer enhancement (fetched only on explicit user action);
 * engines resolve rates from explicit input (custom override) or the bundled
 * approximate table. Rates are planning-grade estimates, never exact quotes.
 */

export interface FxCurrency {
  readonly code: string;
  readonly symbol: string;
  readonly name: string;
}

/** Top currencies offered by currency-aware tools (USD-based). */
export const FX_CURRENCIES: ReadonlyArray<FxCurrency> = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export const FX_CURRENCY_CODES: ReadonlyArray<string> = FX_CURRENCIES.map((c) => c.code);

/** Select options for generic ToolRunner dropdowns (`{ value, labelKey }`). */
export const FX_CURRENCY_OPTIONS: ReadonlyArray<{ value: string; labelKey: string }> =
  FX_CURRENCIES.map((c) => ({ value: c.code, labelKey: `${c.name} (${c.code})` }));

export function fxCurrency(code: string): FxCurrency | undefined {
  return FX_CURRENCIES.find((c) => c.code === code.trim().toUpperCase());
}

/**
 * Bundled approximate rates: 1 USD in each currency. Clearly approximate —
 * engines label output accordingly. Update rarely; users can override.
 */
export const STATIC_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.86,
  GBP: 0.74,
  INR: 95.5,
  PKR: 278,
  BDT: 123,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.39,
  AUD: 1.4,
  JPY: 154,
  CNY: 6.72,
};

export const FX_API_URL = "https://open.er-api.com/v6/latest/USD";
export const FX_API_ATTRIBUTION = "open.er-api.com";

export interface LiveFxRates {
  readonly base: string;
  readonly date: string;
  readonly rates: Record<string, number>;
}

type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

function defaultFetch(): FetchLike | undefined {
  if (typeof fetch === "function") {
    return fetch as unknown as FetchLike;
  }
  return undefined;
}

/**
 * Fetch live USD-based rates. Throws on network/timeout/shape errors so
 * callers can fall back to the static table. Never called automatically —
 * UI layers invoke this only on explicit user action.
 */
export async function fetchLiveUsdRates(
  fetchImpl: FetchLike | undefined = defaultFetch(),
  timeoutMs = 8000,
): Promise<LiveFxRates> {
  if (fetchImpl === undefined) {
    throw new Error("Live rates are unavailable in this environment.");
  }
  const controller = typeof AbortController === "function" ? new AbortController() : undefined;
  const timer =
    controller === undefined
      ? undefined
      : setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(FX_API_URL, controller === undefined ? undefined : { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Rate service responded with HTTP ${res.status}.`);
    }
    const body = (await res.json()) as { base_code?: unknown; time_last_update_utc?: unknown; rates?: unknown };
    if (typeof body !== "object" || body === null || typeof body.rates !== "object" || body.rates === null) {
      throw new Error("Rate service returned an unexpected response.");
    }
    return {
      base: typeof body.base_code === "string" ? body.base_code : "USD",
      date: typeof body.time_last_update_utc === "string" ? body.time_last_update_utc : new Date().toUTCString(),
      rates: body.rates as Record<string, number>,
    };
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

export type FxRateSource = "custom" | "live" | "static";

export interface ResolvedFxRate {
  readonly currency: string;
  readonly rate: number;
  readonly source: FxRateSource;
}

/**
 * Resolve the USD→currency multiplier. Explicit custom rate wins, then live
 * table, then the bundled static table. Unknown codes fall back to USD.
 */
export function resolveFxRate(
  currencyRaw: string,
  customRateRaw: string,
  liveRates?: LiveFxRates,
): ResolvedFxRate {
  const currency = currencyRaw.trim() === "" ? "USD" : currencyRaw.trim().toUpperCase();
  const custom = customRateRaw.trim() === "" ? null : Number(customRateRaw);
  if (custom !== null) {
    if (!Number.isFinite(custom) || custom <= 0) {
      throw new RangeError("Custom rate must be a number greater than zero.");
    }
    return { currency, rate: custom, source: "custom" };
  }
  if (fxCurrency(currency) === undefined) {
    return { currency: "USD", rate: 1, source: "static" };
  }
  const live = liveRates?.rates[currency];
  if (typeof live === "number" && Number.isFinite(live) && live > 0) {
    return { currency, rate: live, source: "live" };
  }
  return { currency, rate: STATIC_USD_RATES[currency] ?? 1, source: "static" };
}

/** Convert a USD amount into the target currency. */
export function convertFromUsd(amountUsd: number, rate: number): number {
  return Math.round(amountUsd * rate * 100) / 100;
}

/** Format an amount with the currency's symbol (Intl, locale-aware). */
export function formatMoney(amount: number, currency: string, locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = fxCurrency(currency)?.symbol ?? "";
    return `${symbol}${amount.toLocaleString(locale)}`;
  }
}

/** Link-out to a live Google Finance quote for the pair. */
export function googleFinanceUrl(from: string, to: string): string {
  return `https://www.google.com/finance/quote/${encodeURIComponent(from)}-${encodeURIComponent(to)}`;
}
