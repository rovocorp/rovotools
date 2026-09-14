import type { AdPlacement } from "@rovotools/tools";

export function getPublisherId(): string | undefined {
  const id = process.env["NEXT_PUBLIC_ADSENSE_PUBLISHER_ID"];
  return id === undefined || id.trim() === "" ? undefined : id.trim();
}

export function getAdSlotId(placement: AdPlacement): string | undefined {
  const scoped = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${placement.toUpperCase().replace(/-/g, "_")}`];
  const shared = process.env["NEXT_PUBLIC_ADSENSE_SLOT_ID"];
  const id = scoped ?? shared;
  return id === undefined || id.trim() === "" ? undefined : id.trim();
}

export function areAdsEnabled(): boolean {
  return getPublisherId() !== undefined && getAdSlotId("tool-footer") !== undefined;
}
