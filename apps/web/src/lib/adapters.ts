"use client";

import type {
  CameraAdapter,
  FilePickerAdapter,
  KeyValueStorageAdapter,
  PickedFile,
  ShareAdapter,
  ShareResult,
} from "@rovotools/types";
import { validateFileMeta } from "@rovotools/core";

let lastObjectUrl: string | null = null;

function trackObjectUrl(url: string): string {
  if (lastObjectUrl !== null) {
    try {
      URL.revokeObjectURL(lastObjectUrl);
    } catch {
      // Revocation is best-effort.
    }
  }
  lastObjectUrl = url;
  return url;
}

function readFileMeta(file: File): PickedFile | null {
  const meta = validateFileMeta({ name: file.name, mimeType: file.type, size: file.size });
  if (!meta.valid) {
    return null;
  }
  return {
    uri: trackObjectUrl(URL.createObjectURL(file)),
    name: file.name,
    ...(file.type === "" ? {} : { mimeType: file.type }),
    ...(Number.isFinite(file.size) ? { size: file.size } : {}),
  };
}

function openFileDialog(accept: string, capture?: "environment" | "user"): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    if (capture !== undefined) {
      input.setAttribute("capture", capture);
    }
    input.onchange = () => {
      resolve(input.files?.[0] ?? null);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export const webFilePicker: FilePickerAdapter = {
  async pickDocument(): Promise<PickedFile | null> {
    const file = await openFileDialog("*/*");
    return file === null ? null : readFileMeta(file);
  },
  async pickImage(): Promise<PickedFile | null> {
    const file = await openFileDialog("image/*");
    return file === null ? null : readFileMeta(file);
  },
};

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

export const webCamera: CameraAdapter = {
  async isAvailable(): Promise<boolean> {
    if (typeof navigator === "undefined" || navigator.mediaDevices === undefined) {
      return false;
    }
    return typeof navigator.mediaDevices.getUserMedia === "function";
  },
  async captureImage(): Promise<PickedFile | null> {
    if (typeof document === "undefined") {
      return null;
    }
    const file = await openFileDialog("image/*", "environment");
    return file === null ? null : readFileMeta(file);
  },
};
