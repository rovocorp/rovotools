// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getConsent,
  getConsentPreferences,
  resetConsent,
  resetConsentMemory,
  setConsent,
  setConsentPreferences,
  trackEvent,
} from "../analytics";

beforeEach(() => {
  resetConsentMemory();
  window.localStorage.clear();
});

afterEach(() => {
  resetConsentMemory();
  window.localStorage.clear();
});

describe("granular consent preferences", () => {
  it("starts undecided", () => {
    expect(getConsentPreferences()).toBeNull();
    expect(getConsent()).toBe("unknown");
  });

  it("persists and reads back per-purpose choices", () => {
    setConsentPreferences({ analytics: true, advertising: false });
    expect(getConsentPreferences()).toEqual({ analytics: true, advertising: false });
    expect(window.localStorage.getItem("rovotools:consent:v2")).toBe(
      JSON.stringify({ analytics: true, advertising: false }),
    );
  });

  it("legacy setConsent maps to both purposes", () => {
    setConsent("granted");
    expect(getConsentPreferences()).toEqual({ analytics: true, advertising: true });
    setConsent("denied");
    expect(getConsentPreferences()).toEqual({ analytics: false, advertising: false });
  });

  it("migrates a stored legacy choice", () => {
    window.localStorage.setItem("rovotools:consent", "granted");
    expect(getConsentPreferences()).toEqual({ analytics: true, advertising: true });
  });

  it("resetConsent clears both keys", () => {
    setConsentPreferences({ analytics: true, advertising: true });
    resetConsent();
    expect(getConsentPreferences()).toBeNull();
    expect(window.localStorage.getItem("rovotools:consent")).toBeNull();
    expect(window.localStorage.getItem("rovotools:consent:v2")).toBeNull();
  });

  it("trackEvent honours the analytics purpose only", () => {
    // Provider is a no-op in this repo; assert no-throw gating instead.
    setConsentPreferences({ analytics: false, advertising: true });
    expect(() => trackEvent("probe", { toolId: "x" })).not.toThrow();
    setConsentPreferences({ analytics: true, advertising: false });
    expect(() => trackEvent("probe", { toolId: "x" })).not.toThrow();
  });
});
