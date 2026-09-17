// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { adsenseSdkUrl, areAdsEnabled, getAdSlotId, getPublisherId, shouldLoadAds } from "../ads";

const PUBLISHER_ENV = "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID";
const SLOT_ENV = "NEXT_PUBLIC_ADSENSE_SLOT_ID";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("shouldLoadAds", () => {
  it("requires both a publisher ID and granted consent", () => {
    expect(shouldLoadAds("ca-pub-1", "granted")).toBe(true);
    expect(shouldLoadAds("ca-pub-1", "denied")).toBe(false);
    expect(shouldLoadAds("ca-pub-1", "unknown")).toBe(false);
    expect(shouldLoadAds(undefined, "granted")).toBe(false);
    expect(shouldLoadAds("   ", "granted")).toBe(false);
  });
});

describe("adsenseSdkUrl", () => {
  it("points at the official AdSense SDK with the client ID", () => {
    expect(adsenseSdkUrl("ca-pub-1")).toBe(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1",
    );
  });
});

describe("env plumbing", () => {
  it("trims IDs and treats blanks as unset", () => {
    vi.stubEnv(PUBLISHER_ENV, "  ca-pub-1  ");
    vi.stubEnv(SLOT_ENV, "  123  ");
    expect(getPublisherId()).toBe("ca-pub-1");
    expect(getAdSlotId("tool-footer")).toBe("123");
    expect(areAdsEnabled()).toBe(true);
  });

  it("disables ads without a publisher or slot", () => {
    vi.stubEnv(PUBLISHER_ENV, "");
    expect(getPublisherId()).toBeUndefined();
    expect(areAdsEnabled()).toBe(false);
  });
});
