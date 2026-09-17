// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetConsentMemory, setConsent } from "@/lib/analytics";
import AdRail from "../ads/AdRail";

const PUBLISHER_ENV = "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.localStorage.clear();
  resetConsentMemory();
});

describe("AdRail", () => {
  it("renders a labeled, desktop-only sticky aside placeholder without a publisher ID", () => {
    vi.stubEnv(PUBLISHER_ENV, "");
    const { container } = render(<AdRail placement="tool-rail-right" slotId="test-slot" />);
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside?.getAttribute("aria-label")).toBeTruthy();
    // Desktop xl+ only: never a fixed overlay, never visible on mobile.
    expect(aside?.className).toContain("hidden");
    expect(aside?.className).toContain("xl:block");
    expect(aside?.className).not.toContain("fixed");
    expect(aside?.querySelector(".sticky")).not.toBeNull();
  });

  it("renders the real rail unit with consent and collapses without it", () => {
    vi.stubEnv(PUBLISHER_ENV, "ca-pub-123456789");
    setConsent("granted");
    const { container, unmount } = render(<AdRail placement="tool-rail-right" slotId="test-slot" />);
    expect(container.querySelector("aside ins.adsbygoogle")).not.toBeNull();
    unmount();
    cleanup();
    window.localStorage.clear();
    resetConsentMemory();
    setConsent("denied");
    const denied = render(<AdRail placement="tool-rail-right" slotId="test-slot" />);
    expect(denied.container.querySelector("aside")).toBeNull();
  });
});
