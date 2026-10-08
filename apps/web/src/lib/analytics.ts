/**
 * Analytics abstraction layer. Never hard-code a provider in components —
 * use these helpers so the implementation can be swapped without touching
 * every call site. Sensitive tool inputs are NEVER tracked.
 */
"use client";

import { useSyncExternalStore } from "react";

import type { AdsConsent } from "./ads";

export type AnalyticsConsent = "granted" | "denied" | "unknown";

const CONSENT_KEY = "rovotools:consent";
const PREFS_KEY = "rovotools:consent:v2";

export interface ConsentPreferences {
  readonly analytics: boolean;
  readonly advertising: boolean;
}

// In-memory fallback: when localStorage throws (private mode, disabled
// cookies/storage), the banner would otherwise stay stuck — clicks appear
// dead because the re-read snapshot still says "unknown". Memory keeps the
// choice working for the tab even when persistence fails.
let memoryConsent: AnalyticsConsent = "unknown";
let memoryPrefs: ConsentPreferences | null = null;

function readLegacy(): AnalyticsConsent {
  if (typeof window === "undefined") {
    return "unknown";
  }
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "granted" || stored === "denied") {
      memoryConsent = stored;
      return stored;
    }
  } catch {
    // Storage unreadable — fall through to the in-memory choice.
  }
  return memoryConsent;
}

function notifyConsentChange(): void {
  // useSyncExternalStore does not re-render for writes made in this tab
  // (the storage event only fires in *other* tabs), so notify locally.
  window.dispatchEvent(new CustomEvent("rovotools:consent-change"));
}

/**
 * Granular per-purpose preferences. Migrates the legacy binary choice:
 * granted -> both true, denied -> both false. Null = undecided.
 */
export function getConsentPreferences(): ConsentPreferences | null {
  if (memoryPrefs !== null) {
    return memoryPrefs;
  }
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(PREFS_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
        if (typeof parsed.analytics === "boolean" && typeof parsed.advertising === "boolean") {
          memoryPrefs = { analytics: parsed.analytics, advertising: parsed.advertising };
          return memoryPrefs;
        }
      }
    } catch {
      // Corrupt/unreadable storage — fall through to legacy migration.
    }
    const legacy = readLegacy();
    if (legacy === "granted") {
      // Cache the migrated result: getSnapshot must return a stable
      // reference or useSyncExternalStore loops infinitely.
      memoryPrefs = { analytics: true, advertising: true };
      return memoryPrefs;
    }
    if (legacy === "denied") {
      memoryPrefs = { analytics: false, advertising: false };
      return memoryPrefs;
    }
  }
  return null;
}

export function setConsentPreferences(prefs: ConsentPreferences): void {
  memoryPrefs = { ...prefs };
  memoryConsent = prefs.analytics && prefs.advertising ? "granted" : "denied";
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(memoryPrefs));
    window.localStorage.setItem(CONSENT_KEY, memoryConsent);
  } catch {
    // Consent storage is best-effort.
  }
  notifyConsentChange();
}

export function getConsent(): AnalyticsConsent {
  const prefs = getConsentPreferences();
  if (prefs !== null) {
    return prefs.analytics && prefs.advertising ? "granted" : "denied";
  }
  return readLegacy();
}

export function setConsent(value: Exclude<AnalyticsConsent, "unknown">): void {
  setConsentPreferences(
    value === "granted" ? { analytics: true, advertising: true } : { analytics: false, advertising: false },
  );
}

/** Testing only: clears the in-memory fallback between test cases. */
export function resetConsentMemory(): void {
  memoryConsent = "unknown";
  memoryPrefs = null;
}

/**
 * Withdraws a previous choice and re-opens the consent banner.
 * Used by the footer "Cookie Settings" link (GDPR + Google EU consent
 * policy require consent to be as easy to withdraw as it was to give).
 */
export function resetConsent(): void {
  memoryConsent = "unknown";
  memoryPrefs = null;
  try {
    window.localStorage.removeItem(CONSENT_KEY);
    window.localStorage.removeItem(PREFS_KEY);
  } catch {
    // Storage may be unavailable — in-memory reset still re-opens the banner.
  }
  window.dispatchEvent(new CustomEvent("rovotools:consent-change"));
}

function subscribeConsent(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener("rovotools:consent-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("rovotools:consent-change", callback);
  };
}

function getConsentSnapshot(): AnalyticsConsent {
  return getConsent();
}

function getConsentServerSnapshot(): AnalyticsConsent {
  return "unknown";
}

/** Reactive consent state for components. Server snapshot is "unknown". */
export function useConsent(): AnalyticsConsent {
  return useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);
}

/** Reactive per-purpose preferences. Null server-side / while undecided. */
export function useConsentPreferences(): ConsentPreferences | null {
  return useSyncExternalStore(subscribeConsent, getConsentPreferences, () => null);
}

/** Reactive advertising purpose flag. False until explicitly enabled. */
export function useAdvertisingConsent(): boolean {
  return useConsentPreferences()?.advertising ?? getConsent() === "granted";
}

/**
 * Tri-state advertising consent for ad gating. `granted` serves
 * personalized ads, `denied` serves non-personalized ads (NPA),
 * `unknown` renders nothing until the visitor decides.
 */
export function useAdsConsent(): AdsConsent {
  const prefs = useConsentPreferences();
  const legacy = useConsent();
  if (prefs !== null) {
    return prefs.advertising ? "granted" : "denied";
  }
  return legacy;
}

/** True once the user made a choice. Useful for queuing
 *  non-essential dialogs (install prompts, update prompts) behind consent
 *  so floating cards never stack on top of each other. */
export function useConsentDecided(): boolean {
  return useConsent() !== "unknown";
}

interface AnalyticsProvider {
  trackEvent: (name: string, properties?: Record<string, string | number | boolean>) => void;
}

/** Default provider: privacy-safe no-op. */
const defaultProvider: AnalyticsProvider = {
  trackEvent: () => {},
};

const provider: AnalyticsProvider = defaultProvider;

/**
 * Track a UI event. Callers must only pass anonymous, non-sensitive
 * properties (e.g. tool id, category) — never input values, file names,
 * passwords, tokens or document contents.
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
  const prefs = getConsentPreferences();
  if (prefs !== null ? !prefs.analytics : getConsent() !== "granted") {
    return;
  }
  provider.trackEvent(name, properties);
}
