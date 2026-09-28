"use client";

import type {
  KeyValueStorageAdapter,
  ShareAdapter,
  ShareResult,
} from "@rovotools/types";

function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export const webShare: ShareAdapter = {
  canShare(): boolean {
    return (
      canUseWebShare() ||
      (typeof navigator !== "undefined" &&
        typeof navigator.clipboard?.writeText === "function")
    );
  },
  async shareText(text: string, title?: string): Promise<ShareResult> {
    if (canUseWebShare()) {
      try {
        await navigator.share(title === undefined ? { text } : { text, title });
        return { completed: true, method: "sheet" };
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { completed: false, method: "sheet" };
        }
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      return { completed: true, method: "clipboard" };
    } catch {
      return { completed: false, method: "none" };
    }
  },
  async shareFile(uri: string, mimeType?: string): Promise<ShareResult> {
    if (
      canUseWebShare() &&
      typeof navigator.canShare === "function" &&
      mimeType !== undefined
    ) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], "rovotools-result", { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return { completed: true, method: "sheet" };
        }
      } catch {
        return { completed: false, method: "none" };
      }
    }
    return { completed: false, method: "none" };
  },
};

export const webStorage: KeyValueStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage is best-effort (private mode, quotas).
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage is best-effort.
    }
  },
};
