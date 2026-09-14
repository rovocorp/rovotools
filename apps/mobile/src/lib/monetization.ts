import { createPolicy, type AdPlacement, type MonetizationPolicy } from "@rovotools/tools";

export interface MobileAdsProvider {
  readonly provider: "admob" | "custom" | "none";
  isEnabled(): boolean;
}

const disabledAdsProvider: MobileAdsProvider = {
  provider: "none",
  isEnabled: () => false,
};

function readPublicFlag(name: string): string | undefined {
  // Dynamic access on purpose: babel-preset-expo statically rewrites
  // `process.env.EXPO_PUBLIC_*` member expressions into an import of the
  // Metro-only virtual module `expo/virtual/env`, which breaks jest.
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}

export function resolveMobileAdsProvider(): MobileAdsProvider {
  // Web AdSense must never be embedded in native UI (WebViews or otherwise).
  // A future native SDK (e.g. AdMob) plugs in here behind an explicit flag;
  // until then advertising stays off and tools render identically.
  const flag = readPublicFlag("EXPO_PUBLIC_ADS_ENABLED");
  if (flag === "true") {
    return disabledAdsProvider;
  }
  return disabledAdsProvider;
}

export function resolveMobilePolicy(): MonetizationPolicy {
  const provider = resolveMobileAdsProvider();
  return createPolicy({ provider: provider.provider });
}

export function isSponsoredPlacementAllowed(placement: AdPlacement): boolean {
  return resolveMobilePolicy().adsEnabled && placement === "tool-footer";
}
