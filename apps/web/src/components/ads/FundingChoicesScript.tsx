"use client";

import Script from "next/script";

/**
 * Google Funding Choices (certified TCF v2.2 CMP) loader.
 *
 * Setup (in your AdSense account, not code):
 *  1. AdSense → Privacy & messaging → Create message (EU/UK) for rovotools.com.
 *  2. Copy the provided message script URL.
 *  3. Set it as NEXT_PUBLIC_FUNDING_CHOICES_SRC in the hosting environment.
 *
 * Until the variable is set this renders nothing and the built-in
 * CookieBanner remains the consent surface. When set, Funding Choices
 * becomes the CMP in scope regions; our banner defers (see CookieBanner)
 * and ad gating additionally honours the TCF signal (see lib/tcf.ts).
 */
export default function FundingChoicesScript(): React.ReactElement | null {
  const src = process.env["NEXT_PUBLIC_FUNDING_CHOICES_SRC"];
  if (src === undefined || src.trim() === "") {
    return null;
  }
  return <Script id="funding-choices" src={src.trim()} strategy="afterInteractive" />;
}
