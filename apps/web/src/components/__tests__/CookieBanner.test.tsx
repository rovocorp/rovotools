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
  it("shows until a choice is made, then persists accept-all", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("dialog", { name: "Cookie consent" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(window.localStorage.getItem("rovotools:consent")).toBe("granted");
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull();
  });

  it("offers Customize instead of a one-click Reject", () => {
    render(<CookieBanner />);
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    expect(screen.getByRole("dialog", { name: "Cookie settings" })).toBeDefined();
  });

  it("persists reject-all from inside settings", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject all" }));
    expect(window.localStorage.getItem("rovotools:consent")).toBe("denied");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("persists a custom selection from inside settings", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.click(screen.getByRole("switch", { name: "Anonymous analytics" }));
    fireEvent.click(screen.getByRole("button", { name: "Save selection" }));
    expect(window.localStorage.getItem("rovotools:consent:v2")).toBe(
      JSON.stringify({ analytics: true, advertising: false }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
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
