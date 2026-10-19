"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsentPreferences } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = process.env["NEXT_PUBLIC_GA_MEASUREMENT_ID"] ?? "";

/**
 * Loads GA4 only when both conditions hold: the visitor granted the
 * analytics purpose and a measurement ID is configured in the hosting env.
 * Without an ID this renders nothing (the analytics provider stays no-op),
 * so local and preview builds never send data.
 */
export default function AnalyticsScript(): React.ReactElement | null {
  const prefs = useConsentPreferences();
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const enabled = prefs?.analytics === true && MEASUREMENT_ID !== "";

  useEffect(() => {
    if (!enabled || lastPath.current === pathname) {
      return;
    }
    lastPath.current = pathname;
    // App Router navigations do not trigger a full page load. The first
    // page_view is sent by `gtag('config')`; subsequent SPA routes need an
    // explicit event.
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [enabled, pathname]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-sdk"
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${MEASUREMENT_ID}',{send_page_view:true});`}
      </Script>
    </>
  );
}
