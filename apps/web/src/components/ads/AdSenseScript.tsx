"use client";

import Script from "next/script";
import { useConsent } from "@/lib/analytics";
import { adsenseSdkUrl, getPublisherId, shouldLoadAds } from "@/lib/ads";

/**
 * Loads the AdSense SDK exactly once, and only after the visitor grants
 * cookie consent (Google EU consent policy). Without a publisher ID or
 * consent this renders nothing — ad slots fall back to the dev placeholder
 * (no publisher) or stay empty (consent denied/pending).
 */
export default function AdSenseScript(): React.ReactElement | null {
  const consent = useConsent();
  const publisherId = getPublisherId();
  if (!shouldLoadAds(publisherId, consent)) {
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
