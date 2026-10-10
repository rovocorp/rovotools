import type { AdPlacement } from "@/shared/tools";

/**
 * Default publisher ID (public â€” also in public/ads.txt). Env override wins.
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

/**
 * Publisher-only gate for Auto ads. Manual slot IDs are optional
 * enhancements: when a slot is configured it is attached as
 * `data-ad-slot`, otherwise the unit renders with only `data-ad-client`
 * + `data-ad-format="auto"` and AdSense Auto ads fill it. This keeps
 * production rendering when only the publisher ID is set (the reported
 * "placeholders not displaying site-wide" case was `slotId === undefined`
 * collapsing every slot to null).
 */
export function areAdsEnabled(): boolean {
  return getPublisherId() !== undefined;
}

export type AdsConsent = "granted" | "denied" | "unknown";

/**
 * Ad serving mode. `personalized` = full consent, `npa` = user rejected
 * personalization but still sees non-personalized ads (Google NPA:
 * contextual only, `&npa=1` on the ad request), `none` = undecided, so no
 * SDK and no slots yet.
 */
export type AdMode = "personalized" | "npa" | "none";

/**
 * Industry-standard gate (Google EU consent policy + NPA support): the
 * AdSense SDK and ad units load with a publisher ID configured AND a
 * decided choice. Granted (or TCF Google-vendor consent) serves
 * personalized ads; an explicit reject serves non-personalized ads
 * globally instead of hiding all ads. Undecided renders nothing.
 */
export function resolveAdMode(
  publisherId: string | undefined,
  consent: AdsConsent,
  tcf: boolean | null,
): AdMode {
  if (publisherId === undefined || publisherId.trim() === "") {
    return "none";
  }
  if (tcf === true || consent === "granted") {
    return "personalized";
  }
  // Explicit reject (own banner) or explicit CMP deny (Funding Choices
  // answered without Google vendor consent): non-personalized ads.
  if (consent === "denied" || tcf === false) {
    return "npa";
  }
  return "none";
}

export function shouldLoadAds(publisherId: string | undefined, consent: AdsConsent): boolean {
  return publisherId !== undefined && publisherId.trim() !== "" && consent === "granted";
}

/** SDK/slots may render non-personalized ads for an explicit reject. */
export function shouldShowNpaAds(publisherId: string | undefined, consent: AdsConsent): boolean {
  return publisherId !== undefined && publisherId.trim() !== "" && consent === "denied";
}

export function adsenseSdkUrl(publisherId: string): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
}
