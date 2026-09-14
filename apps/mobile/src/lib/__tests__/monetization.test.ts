import { isSponsoredPlacementAllowed, resolveMobileAdsProvider, resolveMobilePolicy } from "@/lib/monetization";

describe("mobile monetization", () => {
  it("stays disabled by default and never uses web AdSense", () => {
    const provider = resolveMobileAdsProvider();
    expect(provider.provider).not.toBe("adsense");
    expect(provider.isEnabled()).toBe(false);
    expect(resolveMobilePolicy().adsEnabled).toBe(false);
  });

  it("blocks every sponsored placement while disabled", () => {
    expect(isSponsoredPlacementAllowed("tool-footer")).toBe(false);
    expect(isSponsoredPlacementAllowed("listing-inline")).toBe(false);
  });
});
