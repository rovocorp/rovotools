// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetConsentMemory } from "@/lib/analytics";
import CookieBanner from "../CookieBanner";

beforeEach(() => {
  resetConsentMemory();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("CookieBanner", () => {
  it("shows until a choice is made, then persists accept", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("dialog", { name: "Cookie consent" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(window.localStorage.getItem("rovotools:consent")).toBe("granted");
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
  });

  it("persists reject", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(window.localStorage.getItem("rovotools:consent")).toBe("denied");
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
  });

  it("stays hidden when consent was already stored", () => {
    window.localStorage.setItem("rovotools:consent", "granted");
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
  });

  it("still dismisses when localStorage throws (private mode)", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    try {
      render(<CookieBanner />);
      fireEvent.click(screen.getByRole("button", { name: "Accept" }));
      expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
      cleanup();
      // The in-memory choice survives re-mounts within the tab.
      render(<CookieBanner />);
      expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
    } finally {
      setItem.mockRestore();
      getItem.mockRestore();
    }
  });
});
