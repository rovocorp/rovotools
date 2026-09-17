"use client";

import { t } from "@rovotools/localization";
import type { AdPlacement } from "@rovotools/tools";
import AdSlot from "./AdSlot";
import { useAdSlotState } from "./useAdSlotState";

/**
 * Sticky left sidebar ad rail (desktop `xl` screens only, hidden below).
 * Position-sticky inside the content column — never a fixed overlay — per
 * AdSense sticky-ad rules: it cannot cover content, needs no close button,
 * and collapses entirely (rendering null) when ads are disabled, undecided,
 * or unconfigured, so the grid column disappears with it. The rail shows a
 * sized dev placeholder when no publisher ID is set, mirroring AdSlot.
 */
export default function AdRail({
  placement,
  slotId,
}: {
  placement: AdPlacement;
  slotId: string | undefined;
}): React.ReactElement | null {
  const { enabled, showDev } = useAdSlotState(placement, slotId);
  if (!enabled && !showDev) {
    return null;
  }
  return (
    <aside
      aria-label={t("en", "ads.label")}
      className="hidden w-[300px] shrink-0 xl:block"
    >
      <div className="sticky top-24">
        <AdSlot placement={placement} slotId={slotId} variant="rail" />
      </div>
    </aside>
  );
}
