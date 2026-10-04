"use client";

import { createPolicy, isPlacementAllowed, type AdPlacement } from "@rovotools/tools";
import { useAdvertisingConsent } from "@/lib/analytics";
import { getPublisherId } from "@/lib/ads";
import { useTCFAdvertising } from "@/lib/tcf";

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
 *
 * Consent sources: our per-purpose advertising flag, or a certified CMP
 * (Funding Choices) via the TCF v2 Google vendor signal.
 */
export function useAdSlotState(placement: AdPlacement, slotId: string | undefined): AdSlotState {
  const publisherId = getPublisherId();
  const advertising = useAdvertisingConsent();
  const tcf = useTCFAdvertising();
  const policy = createPolicy({
    provider: "adsense",
    ...(publisherId === undefined ? {} : { publisherId }),
  });
  const hasPublisher = publisherId !== undefined && publisherId.trim() !== "";
  const consented = advertising || tcf === true;
  const enabled =
    policy.adsEnabled && isPlacementAllowed(placement) && slotId !== undefined && consented;
  return { publisherId, enabled, showDev: !hasPublisher };
}
