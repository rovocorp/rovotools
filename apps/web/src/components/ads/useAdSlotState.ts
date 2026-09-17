"use client";

import { createPolicy, isPlacementAllowed, type AdPlacement } from "@rovotools/tools";
import { useConsent } from "@/lib/analytics";

export interface AdSlotState {
  readonly publisherId: string | undefined;
  /** Real ad unit may render: allowlisted placement + slot + publisher + consent. */
  readonly enabled: boolean;
  /** Dev placeholder may render: no publisher configured (dev/CI/tests). */
  readonly showDev: boolean;
}

/**
 * Single source of truth for ad-slot gating, shared by AdSlot and AdRail so
 * both agree on when a unit, a placeholder, or nothing renders. Layouts rely
 * on this: grid columns collapse exactly when these return nothing.
 */
export function useAdSlotState(placement: AdPlacement, slotId: string | undefined): AdSlotState {
  const publisherId = process.env["NEXT_PUBLIC_ADSENSE_PUBLISHER_ID"];
  const consent = useConsent();
  const policy = createPolicy({
    provider: "adsense",
    ...(publisherId === undefined ? {} : { publisherId }),
  });
  const hasPublisher = publisherId !== undefined && publisherId.trim() !== "";
  const enabled =
    policy.adsEnabled && isPlacementAllowed(placement) && slotId !== undefined && consent === "granted";
  return { publisherId, enabled, showDev: !hasPublisher };
}
