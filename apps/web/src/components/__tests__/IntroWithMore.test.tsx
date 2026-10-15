// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import IntroWithMore, { splitFirstSentence } from "../tools/IntroWithMore";

afterEach(() => {
  cleanup();
});

const LONG_INTRO =
  "Rasterize SVG files to PNG, JPG or WebP directly in your browser. " +
  "Drop in one SVG or twenty, choose the output format, set a scale factor " +
  "or exact pixel width, and download crisp raster images - no account, " +
  "no server round-trip, nothing leaves your device. Ideal for exporting " +
  "logos, icons and illustrations for social media and documents.";

const SHORT_INTRO = "Pretty-print and validate JSON with clear error messages.";

describe("splitFirstSentence", () => {
  it("returns null for short intros", () => {
    expect(splitFirstSentence(SHORT_INTRO)).toBeNull();
  });

  it("splits long multi-sentence intros at the first sentence", () => {
    const split = splitFirstSentence(LONG_INTRO);
    expect(split).not.toBeNull();
    const lead = split?.lead ?? "";
    const rest = split?.rest ?? "";
    expect(lead).toBe("Rasterize SVG files to PNG, JPG or WebP directly in your browser.");
    expect(rest.startsWith("Drop in one SVG")).toBe(true);
    expect(lead.length + rest.length).toBeLessThanOrEqual(LONG_INTRO.length);
  });

  it("returns null when there is no sentence boundary", () => {
    const noBoundary = "x".repeat(300);
    expect(splitFirstSentence(noBoundary)).toBeNull();
  });

  it("returns null when the remainder is too small to hide", () => {
    const tiny = `${"a".repeat(200)}. short tail.`;
    expect(splitFirstSentence(tiny)).toBeNull();
  });
});

describe("IntroWithMore", () => {
  it("renders short intros without a toggle button", () => {
    render(<IntroWithMore text={SHORT_INTRO} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(SHORT_INTRO)).toBeDefined();
  });

  it("shows only the lead sentence collapsed, then expands full text", () => {
    render(<IntroWithMore text={LONG_INTRO} />);
    const button = screen.getByRole("button", { name: /More/ });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText(/Rasterize SVG files/)).toBeDefined();
    const restId = button.getAttribute("aria-controls");
    const restCollapsed = restId ? document.getElementById(restId) : null;
    expect(restCollapsed?.hasAttribute("hidden")).toBe(true);

    fireEvent.click(button);
    const less = screen.getByRole("button", { name: /Less/ });
    expect(less.getAttribute("aria-expanded")).toBe("true");
    const restExpanded = less.getAttribute("aria-controls")
      ? document.getElementById(less.getAttribute("aria-controls") ?? "")
      : null;
    expect(restExpanded?.hasAttribute("hidden")).toBe(false);

    fireEvent.click(less);
    expect(screen.getByRole("button", { name: /More/ }).getAttribute("aria-expanded")).toBe("false");
    const restRecollapsed = restId ? document.getElementById(restId) : null;
    expect(restRecollapsed?.hasAttribute("hidden")).toBe(true);
  });
});
