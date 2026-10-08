"use client";

import { useEffect } from "react";
import type { AdPlacement } from "@rovotools/tools";
import { t } from "@rovotools/localization";
import { useAdSlotState } from "./useAdSlotState";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & { requestNonPersonalizedAds?: number };
  }
}

export type AdSlotVariant = "leaderboard" | "rail";

/**
 * Renders an industry-standard ad placeholder when no AdSense publisher ID is
 * configured (i.e. development / testing environment). The placeholder
 * reserves a standard slot size so tool pages do not shift when real ads
 * load, is explicitly non-interactive so it can never cover page content,
 * and is clearly labeled as advertising.
 */
function renderDummyAdSlot(
  publisherId: string | undefined,
  slotId: string | undefined,
  variant: AdSlotVariant,
): React.ReactElement | null {
  // Show dummy only when no publisher ID is configured
  // (local dev, CI, or tests). Do NOT render dummy when publisherId is set
  // — real ads will take over once the SDK loads.
  if (publisherId !== undefined && publisherId.trim() !== "") {
    return null; // real AdSense will render
  }

  const isRail = variant === "rail";
  // Render a stable placeholder so layout isn't broken in dev.
  // NOTE: the slot container must stay `relative` and the overlay label
  // `pointer-events-none` — otherwise the absolutely-positioned label
  // escapes to the viewport and silently swallows all clicks on the page.
  return (
    <section
      aria-label={t("en", "ads.label")}
      className={isRail ? "w-full" : "mx-auto my-8 max-w-7xl px-4 sm:px-6 lg:px-8"}
    >
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t("en", "ads.label")}
      </p>
      <div
        className={
          isRail
            ? "relative mx-auto min-h-[600px] w-full max-w-[300px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
            : "relative mx-auto min-h-[90px] w-full max-w-[728px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
        }
      >
        <ins
          className="adsbygoogle block"
          style={{ display: "block", width: "100%", height: isRail ? "600px" : "90px" }}
          data-ad-client={publisherId ?? ""}
          data-ad-slot={slotId ?? ""}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-600 dark:text-zinc-400"
        >
          {isRail ? "Ads by Google (rail)" : "Ads by Google"}
        </div>
      </div>
    </section>
  );
}

function renderRealAdUnit(
  publisherId: string | undefined,
  slotId: string | undefined,
  variant: AdSlotVariant,
): React.ReactElement {
  const isRail = variant === "rail";
  // Real ad unit: same reserved layout as the dev placeholder so the page
  // never shifts when the creative loads. No overlay label — the creative
  // carries its own "AdChoices"/"Sponsored" marking per AdSense policy.
  // data-ad-slot is optional: when a manual slot ID is configured it is
  // attached, otherwise the unit renders publisher-only and AdSense Auto
  // ads fill it (prevents site-wide blank when only publisher is set).
  const trimmedSlot = slotId?.trim() ?? "";
  return (
    <section
      aria-label={t("en", "ads.label")}
      className={isRail ? "w-full" : "mx-auto my-8 max-w-7xl px-4 sm:px-6 lg:px-8"}
    >
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t("en", "ads.label")}
      </p>
      <div
        className={
          isRail
            ? "relative mx-auto min-h-[600px] w-full max-w-[300px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
            : "relative mx-auto min-h-[90px] w-full max-w-[728px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
        }
      >
        <ins
          className="adsbygoogle block"
          style={{ display: "block", width: "100%", height: isRail ? "600px" : "90px" }}
          data-ad-client={publisherId ?? ""}
          {...(trimmedSlot !== "" ? { "data-ad-slot": trimmedSlot } : {})}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}

function renderReservedAdBox(variant: AdSlotVariant): React.ReactElement {
  const isRail = variant === "rail";
  // Production placeholder when the publisher is configured but no ad can be
  // requested yet (visitor undecided — no SDK, no ad request per EU consent
  // policy). Neutral reserved layout only: same dimensions as the real unit
  // so pages never collapse or shift, no fake creative, no ad request.
  return (
    <section
      aria-label={t("en", "ads.label")}
      className={isRail ? "w-full" : "mx-auto my-8 max-w-7xl px-4 sm:px-6 lg:px-8"}
    >
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t("en", "ads.label")}
      </p>
      <div
        aria-hidden="true"
        className={
          isRail
            ? "mx-auto flex min-h-[600px] w-full max-w-[300px] items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            : "mx-auto flex min-h-[90px] w-full max-w-[728px] items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
        }
      >
        {t("en", "ads.label")}
      </div>
    </section>
  );
}

export default function AdSlot({
  placement,
  slotId,
  variant = "leaderboard",
}: {
  placement: AdPlacement;
  slotId: string | undefined;
  variant?: AdSlotVariant;
}): React.ReactElement | null {
  // Ads render once the placement is on the non-intrusive allowlist,
  // a provider + publisher are configured, AND the visitor decided:
  // personalized on accept, NPA (non-personalized, `&npa=1`) on reject.
  // Slot IDs are optional (Auto ads fallback). Undecided renders a neutral
  // reserved box in production so placeholders stay visible and layout
  // never collapses; no ad request is made until a choice exists.
  const { publisherId, hasPublisher, enabled, mode, showDev } = useAdSlotState(placement, slotId);

  useEffect(() => {
    if (!enabled || publisherId === undefined) {
      return;
    }
    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      if (mode === "npa") {
        // Google NPA API: must be set before the first ad request so the
        // request carries `&npa=1` (contextual only, no personalization).
        // Set even with no manual slot so pure Auto ads serves NPA too.
        window.adsbygoogle.requestNonPersonalizedAds = 1;
      }
      // Pure Auto ads mode (no manual slot ID): the SDK loaded by
      // AdSenseScript handles placement automatically once consent exists —
      // pushing a slot-less <ins> would only log an invalid-request error,
      // so skip the push and let Auto ads fill.
      if (slotId === undefined || slotId.trim() === "") {
        return;
      }
      window.adsbygoogle.push({});
    } catch {
      // Ad rendering is best-effort and must never break tool pages.
    }
  }, [enabled, mode, publisherId, slotId]);

  if (enabled) {
    return renderRealAdUnit(publisherId, slotId, variant);
  }

  // Render dummy placeholder when no publisher ID is set (dev/testing).
  if (showDev) {
    return renderDummyAdSlot(publisherId, slotId, variant);
  }
  // Production with publisher configured but undecided consent: keep a
  // visible reserved placeholder instead of collapsing to null.
  if (hasPublisher) {
    return renderReservedAdBox(variant);
  }
  return null;
}
