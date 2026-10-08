"use client";

import { createPolicy, isPlacementAllowed, type AdPlacement } from "@rovotools/tools";
import { useAdsConsent } from "@/lib/analytics";
import { getPublisherId, resolveAdMode, type AdMode } from "@/lib/ads";
import { useTCFAdvertising } from "@/lib/tcf";

export interface AdSlotState {
  readonly publisherId: string | undefined;
  /** Publisher configured (production serves Auto ads even without manual slots). */
  readonly hasPublisher: boolean;
  /** Real ad unit may render: allowlisted placement + publisher + decided choice. Slot is optional (Auto ads fallback). */
  readonly enabled: boolean;
  /** `personalized` on accept, `npa` on reject, `none` while undecided. */
  readonly mode: AdMode;
  /** Dev placeholder may render: no publisher configured (dev/CI/tests). */
  readonly showDev: boolean;
}

/**
 * Single source of truth for ad-slot gating, shared by AdSlot and AdRail so
 * both agree on when a unit, a placeholder, or nothing renders. Layouts rely
 * on this: grid columns collapse exactly when these return nothing.
 *
 * Consent sources: our tri-state advertising flag (accept -> personalized,
 * reject -> non-personalized NPA, undecided -> nothing), or a certified CMP
 * (Funding Choices) via the TCF v2 Google vendor signal.
 */
export function useAdSlotState(placement: AdPlacement, slotId: string | undefined): AdSlotState {
  const publisherId = getPublisherId();
  const consent = useAdsConsent();
  const tcf = useTCFAdvertising();
  const policy = createPolicy({
    provider: "adsense",
    ...(publisherId === undefined ? {} : { publisherId }),
  });
  const hasPublisher = publisherId !== undefined && publisherId.trim() !== "";
  const mode = resolveAdMode(publisherId, consent, tcf);
  // Slot IDs are optional: a configured slot is attached as data-ad-slot,
  // otherwise the unit renders publisher-only and AdSense Auto ads fill it.
  // Requiring a slot here collapsed every production slot to null when only
  // the shared publisher ID was set.
  void slotId;
  const enabled = policy.adsEnabled && isPlacementAllowed(placement) && mode !== "none";
  return { publisherId, hasPublisher, enabled, mode, showDev: !hasPublisher };
}
