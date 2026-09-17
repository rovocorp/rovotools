"use client";

import { useEffect } from "react";
import { createPolicy, isPlacementAllowed, type AdPlacement } from "@rovotools/tools";
import { t } from "@rovotools/localization";
import { useConsent } from "@/lib/analytics";
import { shouldLoadAds } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * Renders an industry-standard ad placeholder when no AdSense publisher ID is
 * configured (i.e. development / testing environment). The placeholder
 * reserves a standard slot size so tool pages do not shift when real ads
 * load, is explicitly non-interactive so it can never cover page content,
 * and is clearly labeled as advertising.
 */
function renderDummyAdSlot(publisherId: string | undefined, slotId: string | undefined): React.ReactElement | null {
  // Show dummy only when no publisher ID is configured
  // (local dev, CI, or tests). Do NOT render dummy when publisherId is set
  // — real ads will take over once the SDK loads.
  if (publisherId !== undefined && publisherId.trim() !== "") {
    return null; // real AdSense will render
  }

  // Render a stable placeholder so layout isn't broken in dev.
  // NOTE: the slot container must stay `relative` and the overlay label
  // `pointer-events-none` — otherwise the absolutely-positioned label
  // escapes to the viewport and silently swallows all clicks on the page.
  return (
    <section
      aria-label={t("en", "ads.label")}
      className="mx-auto my-8 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t("en", "ads.label")}
      </p>
      <div className="relative mx-auto min-h-[90px] w-full max-w-[728px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
        <ins
          className="adsbygoogle block"
          style={{ display: "block", width: "100%", height: "90px" }}
          data-ad-client={publisherId ?? ""}
          data-ad-slot={slotId ?? ""}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-600 dark:text-zinc-400"
        >
          Ads by Google (dev mock)
        </div>
      </div>
    </section>
  );
}

export default function AdSlot({
  placement,
  slotId,
}: {
  placement: AdPlacement;
  slotId: string | undefined;
}): React.ReactElement | null {
  // Ads render only when the placement is on the non-intrusive allowlist,
  // a provider + publisher are configured, a concrete ad-unit slot id is
  // supplied, AND the visitor granted cookie consent (Google EU consent
  // policy). Otherwise nothing renders and layout is untouched.
  const publisherId = process.env["NEXT_PUBLIC_ADSENSE_PUBLISHER_ID"];
  const consent = useConsent();
  const policy = createPolicy({
    provider: "adsense",
    ...(publisherId === undefined ? {} : { publisherId }),
  });
  const enabled =
    policy.adsEnabled &&
    isPlacementAllowed(placement) &&
    slotId !== undefined &&
    shouldLoadAds(publisherId, consent);

  useEffect(() => {
    if (!enabled || publisherId === undefined) {
      return;
    }
    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch {
      // Ad rendering is best-effort and must never break tool pages.
    }
  }, [enabled, publisherId, slotId]);

  if (enabled) {
    // Real ad unit: same reserved layout as the dev placeholder so the page
    // never shifts when the creative loads. No overlay label — the creative
    // carries its own "AdChoices"/"Sponsored" marking per AdSense policy.
    return (
      <section
        aria-label={t("en", "ads.label")}
        className="mx-auto my-8 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
          {t("en", "ads.label")}
        </p>
        <div className="relative mx-auto min-h-[90px] w-full max-w-[728px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <ins
            className="adsbygoogle block"
            style={{ display: "block", width: "100%", height: "90px" }}
            data-ad-client={publisherId ?? ""}
            data-ad-slot={slotId ?? ""}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>
      </section>
    );
  }

  // Render dummy placeholder when no publisher ID is set (dev/testing).
  return renderDummyAdSlot(publisherId, slotId);
}