"use client";

import { t } from "@/shared/localization";
import type { AdPlacement } from "@/shared/tools";
import AdSlot from "./AdSlot";
import { useAdSlotState } from "./useAdSlotState";

/**
 * Sticky right sidebar ad rail (desktop `xl` screens only, hidden below).
 * Position-sticky inside the content column â€” never a fixed overlay â€” per
 * AdSense sticky-ad rules: it cannot cover content and needs no close
 * button. It collapses only when no publisher is configured and no dev
 * placeholder applies; with a publisher set it always reserves its column
 * (real unit after consent, neutral reserved box while undecided) so the
 * rail never vanishes site-wide in production. The rail shows a sized dev
 * placeholder when no publisher ID is set, mirroring AdSlot.
 */
export default function AdRail({
  placement,
  slotId,
}: {
  placement: AdPlacement;
  slotId: string | undefined;
}): React.ReactElement | null {
  const { hasPublisher, enabled, showDev } = useAdSlotState(placement, slotId);
  if (!enabled && !showDev && !hasPublisher) {
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
