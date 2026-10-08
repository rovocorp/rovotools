"use client";

import Script from "next/script";
import { useAdsConsent } from "@/lib/analytics";
import { adsenseSdkUrl, getPublisherId, resolveAdMode } from "@/lib/ads";
import { useTCFAdvertising } from "@/lib/tcf";

/**
 * Loads the AdSense SDK exactly once per page view once the visitor decided:
 * personalized ads on accept (or TCF Google vendor consent via the certified
 * CMP Google Funding Choices), non-personalized ads (NPA) on reject.
 * This single `?client=` loader is all Auto ads needs ("Manage ads for your
 * site" / Auto ads formats + experiments are controlled dashboard-side) —
 * manual `data-ad-slot` units are optional anchors on top of it.
 * Undecided renders nothing — slots keep their reserved boxes until a choice
 * is made. The NPA signal itself is set before the first ad request in AdSlot.
 */
export default function AdSenseScript(): React.ReactElement | null {
  const consent = useAdsConsent();
  const tcf = useTCFAdvertising();
  const publisherId = getPublisherId();
  if (resolveAdMode(publisherId, consent, tcf) === "none") {
    return null;
  }
  return (
    <Script
      id="adsense-sdk"
      src={adsenseSdkUrl(publisherId as string)}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
