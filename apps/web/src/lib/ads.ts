import type { AdPlacement } from "@rovotools/tools";

/**
 * Default publisher ID (public — also in public/ads.txt). Env override wins.
 * Production-only default: dev/CI/tests keep publisher unset so placeholders
 * and consent-gating tests stay meaningful; production serves Auto ads even
 * when the hosting environment does not set the variable.
 */
export const DEFAULT_PUBLISHER_ID = "ca-pub-8311202559739478";

export function getPublisherId(): string | undefined {
  const id = process.env["NEXT_PUBLIC_ADSENSE_PUBLISHER_ID"];
  if (id !== undefined && id.trim() !== "") {
    return id.trim();
  }
  if (typeof process !== "undefined" && process.env["NODE_ENV"] === "production") {
    return DEFAULT_PUBLISHER_ID;
  }
  return undefined;
}

export function getAdSlotId(placement: AdPlacement): string | undefined {
  const scoped = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${placement.toUpperCase().replace(/-/g, "_")}`];
  const shared = process.env["NEXT_PUBLIC_ADSENSE_SLOT_ID"];
  const id = scoped ?? shared;
  return id === undefined || id.trim() === "" ? undefined : id.trim();
}

export function areAdsEnabled(): boolean {
  return getPublisherId() !== undefined && getAdSlotId("tool-footer") !== undefined;
}

export type AdsConsent = "granted" | "denied" | "unknown";

/**
 * Industry-standard gate (Google EU consent policy): the AdSense SDK and ad
 * units load only with a publisher ID configured AND explicit user consent.
 * Anything else renders nothing (production) or the dev placeholder.
 */
export function shouldLoadAds(publisherId: string | undefined, consent: AdsConsent): boolean {
  return publisherId !== undefined && publisherId.trim() !== "" && consent === "granted";
}

export function adsenseSdkUrl(publisherId: string): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
}
