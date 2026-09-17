"use client";

// Small browser-only helpers shared by the custom image tool components
// (steps 8-13). Pure calculation helpers live in @rovotools/tools so they can
// be unit-tested in Node; everything here needs DOM/canvas APIs.

import { assertImageFileSize } from "@rovotools/tools";

export function loadImageElement(file: Blob): Promise<HTMLImageElement> {
  // Every image tool funnels through here: reject oversized drops on
  // metadata alone, before the browser decodes a single pixel into memory.
  assertImageFileSize(file.size);
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image. Try a JPG, PNG or WebP file."));
    };
    img.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error("The browser could not encode that image."));
        } else {
          resolve(blob);
        }
      },
      type,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click so slow browsers still complete the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function replaceExtension(filename: string, extension: string): string {
  const base = filename.includes(".") ? filename.slice(0, filename.lastIndexOf(".")) : filename;
  return `${base || "image"}.${extension}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
