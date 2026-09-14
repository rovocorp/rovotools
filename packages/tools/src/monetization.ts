export type AdPlacement =
  | "tool-footer"
  | "listing-inline"
  | "blog-footer"
  | "home-inline";

export const ALLOWED_PLACEMENTS: ReadonlyArray<AdPlacement> = [
  "tool-footer",
  "listing-inline",
  "blog-footer",
  "home-inline",
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
      return ["tool-footer"];
    case "listing":
      return ["listing-inline"];
    case "blog":
      return ["blog-footer"];
    case "home":
      return ["home-inline"];
  }
}

export function toolExecutionIndependentOfAds(): boolean {
  return true;
}
