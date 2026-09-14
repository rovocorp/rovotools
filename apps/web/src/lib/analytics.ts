/**
 * Analytics abstraction layer. Never hard-code a provider in components —
 * use these helpers so the implementation can be swapped without touching
 * every call site. Sensitive tool inputs are NEVER tracked.
 */
"use client";

import { useSyncExternalStore } from "react";

export type AnalyticsConsent = "granted" | "denied" | "unknown";

const CONSENT_KEY = "rovotools:consent";

// In-memory fallback: when localStorage throws (private mode, disabled
// cookies/storage), the banner would otherwise stay stuck — clicks appear
// dead because the re-read snapshot still says "unknown". Memory keeps the
// choice working for the tab even when persistence fails.
let memoryConsent: AnalyticsConsent = "unknown";

export function getConsent(): AnalyticsConsent {
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

export function setConsent(value: Exclude<AnalyticsConsent, "unknown">): void {
  memoryConsent = value;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Consent storage is best-effort.
  }
  // useSyncExternalStore does not re-render for writes made in this tab
  // (the storage event only fires in *other* tabs), so notify locally.
  window.dispatchEvent(new CustomEvent("rovotools:consent-change"));
}

/** Testing only: clears the in-memory fallback between test cases. */
export function resetConsentMemory(): void {
  memoryConsent = "unknown";
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

/** True once the user accepted or rejected cookies. Useful for queuing
 *  non-essential dialogs (install prompts, update prompts) behind consent
 *  so floating cards never stack on top of each other. */
export function useConsentDecided(): boolean {
  return useConsent() !== "unknown";
}

interface AnalyticsProvider {
  trackPage: (path: string) => void;
  trackEvent: (name: string, properties?: Record<string, string | number | boolean>) => void;
}

/** Default provider: privacy-safe no-op that only counts anonymous page views when consented. */
const defaultProvider: AnalyticsProvider = {
  trackPage: () => {},
  trackEvent: () => {},
};

let provider: AnalyticsProvider = defaultProvider;

export function setAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
}

export function trackPage(path: string): void {
  if (getConsent() !== "granted") {
    return;
  }
  provider.trackPage(path);
}

/**
 * Track a UI event. Callers must only pass anonymous, non-sensitive
 * properties (e.g. tool id, category) — never input values, file names,
 * passwords, tokens or document contents.
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
  if (getConsent() !== "granted") {
    return;
  }
  provider.trackEvent(name, properties);
}
