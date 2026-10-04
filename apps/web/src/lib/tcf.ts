"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: unknown, success: boolean) => void,
      parameter?: unknown,
    ) => void;
  }
}

interface TCData {
  readonly purpose?: { readonly consents?: Record<string, boolean> };
  readonly vendor?: { readonly consents?: Record<string, boolean> };
}

/** IAB GVL vendor ID for Google Advertising Products. */
export const GOOGLE_VENDOR_ID = "755";

/**
 * Reads TCF v2 consent (e.g. from Google Funding Choices, a certified CMP).
 * Resolves true only when purpose 1 (store/access) and Google vendor consent
 * are both present; false when the CMP answered but consent is absent;
 * null when no CMP / timeout / error.
 */
export function getTCFAdvertisingConsent(timeoutMs = 1500): Promise<boolean | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.__tcfapi !== "function") {
      resolve(null);
      return;
    }
    let settled = false;
    const done = (value: boolean | null): void => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    const timer = window.setTimeout(() => done(null), timeoutMs);
    try {
      window.__tcfapi("getTCData", 2, (data: unknown, success: boolean) => {
        window.clearTimeout(timer);
        if (!success || typeof data !== "object" || data === null) {
          done(null);
          return;
        }
        const tc = data as TCData;
        const purpose1 = tc.purpose?.consents?.["1"] === true;
        const vendor = tc.vendor?.consents?.[GOOGLE_VENDOR_ID] === true;
        done(purpose1 && vendor);
      });
    } catch {
      window.clearTimeout(timer);
      done(null);
    }
  });
}

/** Reactive TCF advertising signal. Null while unknown/absent. */
export function useTCFAdvertising(): boolean | null {
  const [value, setValue] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    getTCFAdvertisingConsent().then((result) => {
      if (live) {
        setValue(result);
      }
    });
    return () => {
      live = false;
    };
  }, []);
  return value;
}
