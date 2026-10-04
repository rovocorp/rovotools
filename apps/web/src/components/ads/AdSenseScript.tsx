"use client";

import Script from "next/script";
import { useAdvertisingConsent } from "@/lib/analytics";
import { adsenseSdkUrl, getPublisherId, shouldLoadAds } from "@/lib/ads";
import { useTCFAdvertising } from "@/lib/tcf";

/**
 * Loads the AdSense SDK exactly once per page view when advertising is
 * allowed: either the visitor enabled advertising in our consent settings,
 * or a certified CMP (Google Funding Choices, via TCF v2) reports Google
 * vendor consent. Otherwise renders nothing — ad slots stay empty.
 */
export default function AdSenseScript(): React.ReactElement | null {
  const advertising = useAdvertisingConsent();
  const tcf = useTCFAdvertising();
  const publisherId = getPublisherId();
  const allowed = advertising || tcf === true;
  if (!shouldLoadAds(publisherId, allowed ? "granted" : "denied")) {
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
