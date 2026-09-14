// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdSlot from "../ads/AdSlot";

const PUBLISHER_ENV = "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
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

  it("renders nothing once a publisher ID is configured (real AdSense path)", () => {
    vi.stubEnv(PUBLISHER_ENV, "ca-pub-123456789");
    const { container } = render(<AdSlot placement="tool-footer" slotId="test-slot" />);
    expect(container.querySelector("section")).toBeNull();
  });
});
