export type AdPlacement =
  | "tool-footer"
  | "listing-inline"
  | "blog-footer"
  | "home-inline"
  // Sticky sidebar rails (desktop xl+ only, hidden on smaller screens) and
  // in-flow bottom units. Rails sit at the content's right in LTR layouts,
  // position:sticky inside the content column — never fixed overlays — per
  // AdSense sticky-ad rules; bottom units are static in-flow blocks.
  // Max 1 rail + 1 in-flow unit per page.
  | "tool-rail-right"
  | "blog-rail-right"
  | "content-bottom";

export const ALLOWED_PLACEMENTS: ReadonlyArray<AdPlacement> = [
  "tool-footer",
  "listing-inline",
  "blog-footer",
  "home-inline",
  "tool-rail-right",
  "blog-rail-right",
  "content-bottom",
];

export type MonetizationProvider = "adsense" | "admob" | "custom" | "none";

export interface MonetizationPolicy {
  readonly provider: MonetizationProvider;
  readonly publisherId?: string;
  readonly adsEnabled: boolean;
}

export interface PolicyInput {
  readonly provider: MonetizationProvider;
  readonly publisherId?: string;
}

function hasPublisherId(publisherId?: string): boolean {
  return publisherId !== undefined && publisherId.trim() !== "";
}

export function createPolicy(input: PolicyInput): MonetizationPolicy {
  const enabled = input.provider !== "none" && hasPublisherId(input.publisherId);
  return {
    provider: input.provider,
    ...(input.publisherId === undefined ? {} : { publisherId: input.publisherId }),
    adsEnabled: enabled,
  };
}

export function isPlacementAllowed(placement: string): placement is AdPlacement {
  return (ALLOWED_PLACEMENTS as ReadonlyArray<string>).includes(placement);
}

export function resolvePlacementsForPage(
  page: "tool" | "listing" | "blog" | "home",
): ReadonlyArray<AdPlacement> {
  switch (page) {
    case "tool":
      return ["tool-footer", "tool-rail-right"];
    case "listing":
      return ["listing-inline"];
    case "blog":
      return ["blog-footer", "blog-rail-right"];
    case "home":
      return ["home-inline", "content-bottom"];
  }
}

export function toolExecutionIndependentOfAds(): boolean {
  return true;
}
