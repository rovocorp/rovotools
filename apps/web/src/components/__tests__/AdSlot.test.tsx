// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetConsentMemory, setConsent } from "@/lib/analytics";
import AdSlot from "../ads/AdSlot";

const PUBLISHER_ENV = "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.localStorage.clear();
  resetConsentMemory();
});

describe("AdSlot dev placeholder", () => {
  it("renders a confined, non-interactive placeholder when no publisher ID is set", () => {
    vi.stubEnv(PUBLISHER_ENV, "");
    const { container } = render(<AdSlot placement="tool-footer" slotId="test-slot" />);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();

    // The overlay must be trapped inside a positioned slot container —
    // otherwise `absolute inset-0` escapes to the viewport and swallows
    // every click on the page (regression: dead tool inputs).
    const slot = overlay!.parentElement!;
    expect(slot.className).toMatch(/(^|\s)relative(\s|$)/);
    expect(overlay!.className).toMatch(/(^|\s)pointer-events-none(\s|$)/);

    // The slot reserves layout space so real ads do not shift the page.
    expect(slot.className).toMatch(/min-h-\[90px\]/);
  });

  it("renders a real ad unit once a publisher ID is configured and consent is granted", () => {
    vi.stubEnv(PUBLISHER_ENV, "ca-pub-123456789");
    setConsent("granted");
    const { container } = render(<AdSlot placement="tool-footer" slotId="test-slot" />);
    const unit = container.querySelector("ins.adsbygoogle");
    expect(unit).not.toBeNull();
    expect(unit?.getAttribute("data-ad-client")).toBe("ca-pub-123456789");
    expect(unit?.getAttribute("data-ad-slot")).toBe("test-slot");
    // No dev overlay on the real path.
    expect(container.textContent).not.toContain("dev mock");
  });

  it("renders nothing with a publisher ID but denied consent", () => {
    vi.stubEnv(PUBLISHER_ENV, "ca-pub-123456789");
    setConsent("denied");
    const { container } = render(<AdSlot placement="tool-footer" slotId="test-slot" />);
    expect(container.querySelector("section")).toBeNull();
    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
  });

  it("renders nothing with a publisher ID but undecided consent", () => {
    vi.stubEnv(PUBLISHER_ENV, "ca-pub-123456789");
    const { container } = render(<AdSlot placement="tool-footer" slotId="test-slot" />);
    expect(container.querySelector("section")).toBeNull();
    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
  });

  it("rail variant reserves a 300px vertical slot", () => {
    vi.stubEnv(PUBLISHER_ENV, "");
    const { container } = render(<AdSlot placement="tool-rail-left" slotId="test-slot" variant="rail" />);
    const unit = container.querySelector("ins.adsbygoogle");
    expect(unit).not.toBeNull();
    expect(unit?.getAttribute("data-ad-slot")).toBe("test-slot");
    const box = unit!.parentElement!;
    expect(box.className).toContain("max-w-[300px]");
    expect(box.className).toContain("min-h-[600px]");
  });
});
