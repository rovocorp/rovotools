"use client";

import { useState } from "react";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import {
  FX_API_ATTRIBUTION,
  FX_CURRENCIES,
  STATIC_USD_RATES,
  fetchLiveUsdRates,
  formatMoney,
  fxCurrency,
  googleFinanceUrl,
  resolveFxRate,
  toolRegistry,
  type LiveFxRates,
} from "@rovotools/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CACHE_KEY = "rovotools:fx-usd";

interface FxCache {
  readonly date: string;
  readonly rates: Record<string, number>;
}

function readCache(): FxCache | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<FxCache>;
    if (typeof parsed.date !== "string" || typeof parsed.rates !== "object" || parsed.rates === null) {
      return null;
    }
    return { date: parsed.date, rates: parsed.rates as Record<string, number> };
  } catch {
    return null;
  }
}

function readInitialCache(): LiveFxRates | null {
  const cached = readCache();
  if (cached === null) {
    return null;
  }
  return { base: "USD", date: cached.date, rates: cached.rates };
}

function rateFor(currency: string, live: LiveFxRates | null): { rate: number; source: string } {
  try {
    const resolved = resolveFxRate(currency, "", live ?? undefined);
    const source =
      resolved.source === "live" ? `Live rate via ${FX_API_ATTRIBUTION}, ${live?.date ?? ""}` : "Approximate built-in rate";
    return { rate: resolved.rate, source };
  } catch {
    return { rate: STATIC_USD_RATES[currency] ?? 1, source: "Approximate built-in rate" };
  }
}

export default function AdsenseCalculator(): React.ReactElement {
  const [pageviews, setPageviews] = useState("100000");
  const [mode, setMode] = useState("ctr-cpc");
  const [ctr, setCtr] = useState("1.5");
  const [cpc, setCpc] = useState("0.25");
  const [rpm, setRpm] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [live, setLive] = useState<LiveFxRates | null>(readInitialCache);
  const [rate, setRate] = useState(() => {
    const cached = readInitialCache();
    return String(rateFor("USD", cached).rate);
  });
  const [rateTouched, setRateTouched] = useState(false);
  const [rateNote, setRateNote] = useState(() => {
    const cached = readInitialCache();
    return cached === null ? "Approximate built-in rate" : `Cached rate via ${FX_API_ATTRIBUTION}, ${cached.date}`;
  });
  const [refreshState, setRefreshState] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<{ monthly: string; daily: string; assumptions: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function onCurrencyChange(code: string): void {
    setCurrency(code);
    if (!rateTouched) {
      const next = rateFor(code, live);
      setRate(String(next.rate));
      setRateNote(next.source);
    }
  }

  async function onRefresh(): Promise<void> {
    setRefreshState("loading");
    try {
      const fresh = await fetchLiveUsdRates();
      setLive(fresh);
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify({ date: fresh.date, rates: fresh.rates }));
      } catch {
        // Cache is best-effort only.
      }
      const next = rateFor(currency, fresh);
      setRate(String(next.rate));
      setRateNote(`Live rate via ${FX_API_ATTRIBUTION}, ${fresh.date}`);
      setRateTouched(false);
      setRefreshState("idle");
    } catch {
      setRefreshState("error");
    }
  }

  async function onCalculate(): Promise<void> {
    setError(null);
    setCopied(false);
    try {
      const entry = toolRegistry.require("adsense-earnings-calculator");
      const input = { pageviews, mode, ctr, cpc, rpm, currency, rate, rateNote };
      const validation = entry.definition.validate(input);
      if (!validation.valid) {
        setError(validation.errors[0]?.message ?? "Check your inputs and try again.");
        setResult(null);
        return;
      }
      const out = (await entry.definition.execute(input)) as Record<string, unknown>;
      const monthly = Number(out["monthly"]);
      const daily = Number(out["daily"]);
      setResult({
        monthly: formatMoney(monthly, currency),
        daily: formatMoney(daily, currency),
        assumptions: String(out["assumptions"] ?? ""),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed.");
      setResult(null);
    }
  }

  async function onCopy(): Promise<void> {
    if (result === null) {
      return;
    }
    try {
      await navigator.clipboard.writeText(`Est. monthly: ${result.monthly}\nEst. daily: ${result.daily}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const symbol = fxCurrency(currency)?.symbol ?? "$";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              1 USD = {rate === "" ? "…" : rate} {currency} ({symbol})
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{rateNote}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void onRefresh()} disabled={refreshState === "loading"}>
            <RefreshCw className={cn("h-4 w-4", refreshState === "loading" && "animate-spin")} aria-hidden="true" />
            {refreshState === "loading" ? "Refreshing…" : "Refresh live rates"}
          </Button>
          <a
            href={googleFinanceUrl("USD", currency)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Check live USD→{currency} on Google <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
        {refreshState === "error" ? (
          <p role="alert" className="mt-2 text-xs text-red-600">
            Live rates are unavailable right now — the built-in approximate rate is used instead.
          </p>
        ) : null}
        <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          Rates by {FX_API_ATTRIBUTION}. Fetched only when you tap refresh — nothing is requested automatically.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adsense-pageviews">Monthly pageviews</Label>
          <Input id="adsense-pageviews" inputMode="numeric" value={pageviews} onChange={(e) => setPageviews(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adsense-mode">Mode</Label>
          <select
            id="adsense-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="ctr-cpc">CTR + CPC</option>
            <option value="rpm">RPM</option>
          </select>
        </div>
      </div>

      {mode === "rpm" ? (
        <div className="space-y-1.5">
          <Label htmlFor="adsense-rpm">Revenue per 1000 views in USD (RPM)</Label>
          <Input id="adsense-rpm" inputMode="decimal" value={rpm} onChange={(e) => setRpm(e.target.value)} placeholder="e.g. 4" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="adsense-ctr">Click-through rate %</Label>
            <Input id="adsense-ctr" inputMode="decimal" value={ctr} onChange={(e) => setCtr(e.target.value)} placeholder="1.5" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adsense-cpc">Cost per click in USD</Label>
            <Input id="adsense-cpc" inputMode="decimal" value={cpc} onChange={(e) => setCpc(e.target.value)} placeholder="0.25" />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adsense-currency">Currency</Label>
          <select
            id="adsense-currency"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {FX_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adsense-rate">Custom USD rate (empty = auto)</Label>
          <Input
            id="adsense-rate"
            inputMode="decimal"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setRateTouched(true);
              setRateNote("Custom rate entered manually");
            }}
            placeholder="e.g. 88.42"
          />
        </div>
      </div>

      {error !== null ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="button" onClick={() => void onCalculate()}>
        Calculate earnings
      </Button>

      {result !== null ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Est. monthly earnings</p>
          <p className="mt-1 text-3xl font-black">{result.monthly}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Est. daily: {result.daily}</p>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{result.assumptions}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void onCopy()}>
            <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? "Copied!" : "Copy result"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
