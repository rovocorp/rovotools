// Browser helpers shared by the PDF custom tools. Heavy engines are loaded
// lazily so each tool page only downloads the code it needs; the pdf.js
// worker is served from /pdf.worker.min.mjs (copied at build/dev time by
// scripts/copy-pdf-worker.mjs) so rendering works fully offline.

import type { PDFDocumentProxy } from "pdfjs-dist";
import { assertBytesWithinLimit } from "@rovotools/core";

/** Matches the "up to 100 MB" promise shown on the upload UI. */
export const WEB_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export async function fileToBytes(file: Blob, maxBytes = WEB_MAX_UPLOAD_BYTES): Promise<Uint8Array> {
  // Fail before arrayBuffer(): an uncapped read lets a multi-GB drop
  // exhaust the tab's memory before any parser gets a say.
  assertBytesWithinLimit(file.size, maxBytes, "File");
  return new Uint8Array(await file.arrayBuffer());
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime: string): void {
  const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name);
}

/**
 * Transcode any browser-decodable image (WebP, GIF, BMP, …) to PNG bytes
 * so it can be embedded into a PDF with pdf-lib (which only embeds
 * JPG/PNG). JPG/PNG inputs should bypass this and embed losslessly.
 */
export async function imageBlobToPngBytes(blob: Blob): Promise<Uint8Array> {
  const bitmap = await decodeImageBitmap(blob);
  try {
    const canvas = globalThis.document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("Your browser would not give this image a canvas to draw on.");
    }
    context.drawImage(bitmap, 0, 0);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result === null) {
          reject(new Error("Could not re-encode that image as PNG."));
        } else {
          resolve(result);
        }
      }, "image/png");
    });
    return new Uint8Array(await png.arrayBuffer());
  } finally {
    bitmap.close();
  }
}

async function decodeImageBitmap(blob: Blob): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob);
  }
  // Fallback for browsers without createImageBitmap: decode via <img>.
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = globalThis.document.createElement("img");
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read that image file (it may be corrupted)."));
      element.src = url;
    });
    const canvas = globalThis.document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("Your browser would not give this image a canvas to draw on.");
    }
    context.drawImage(image, 0, 0);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result === null) {
          reject(new Error("Could not re-encode that image as PNG."));
        } else {
          resolve(result);
        }
      }, "image/png");
    });
    const bytes = new Uint8Array(await png.arrayBuffer());
    // Re-decode the PNG through the available path so callers always get
    // an ImageBitmap they must close.
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(new Blob([bytes.slice().buffer as ArrayBuffer], { type: "image/png" }));
    }
    throw new Error("Your browser cannot decode that image format.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

type PdfJsApi = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJsApi> | null = null;

export function loadPdfjs(): Promise<PdfJsApi> {
  if (pdfjsPromise === null) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export interface RenderedPage {
  readonly blob: Blob;
  readonly url: string;
  readonly width: number;
  readonly height: number;
}

export async function renderPdfPageToJpeg(
  pdfBytes: Uint8Array,
  pageIndex: number,
  scale: number,
  quality = 0.85,
): Promise<RenderedPage> {
  if (!Number.isInteger(pageIndex) || pageIndex < 0) {
    throw new RangeError("Page index must be a non-negative integer.");
  }
  if (!(scale >= 1 && scale <= 3)) {
    throw new RangeError("Render scale must be between 1 and 3.");
  }
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice() });
  const document: PDFDocumentProxy = await loadingTask.promise;
  try {
    if (pageIndex >= document.numPages) {
      throw new RangeError(`Page ${pageIndex + 1} is out of range (document has ${document.numPages} page(s)).`);
    }
    const page = await document.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });
    const target = globalThis.document.createElement("canvas");
    target.width = Math.ceil(viewport.width);
    target.height = Math.ceil(viewport.height);
    const context = target.getContext("2d", { alpha: false });
    if (context === null) {
      throw new Error("Your browser would not give this page a canvas to draw on.");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, target.width, target.height);
    await page.render({ canvas: target, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      target.toBlob((result) => {
        if (result === null) {
          reject(new Error("Could not encode the page as JPEG."));
        } else {
          resolve(result);
        }
      }, "image/jpeg", quality);
    });
    return { blob, url: URL.createObjectURL(blob), width: target.width, height: target.height };
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Extract text lines per page (one array entry per page, one string per
 * visual line). Scanned image-only PDFs yield empty arrays.
 */
export async function extractPdfTextPages(pdfBytes: Uint8Array): Promise<string[][]> {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice() });
  const document: PDFDocumentProxy = await loadingTask.promise;
  try {
    const pages: string[][] = [];
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let current = "";
      for (const raw of content.items) {
        const item = raw as { str?: unknown; hasEOL?: unknown };
        const text = typeof item.str === "string" ? item.str : "";
        current += text;
        if (item.hasEOL === true) {
          if (current.trim() !== "") {
            lines.push(current.trim());
          }
          current = "";
        } else if (text === "") {
          current += " ";
        }
      }
      if (current.trim() !== "") {
        lines.push(current.trim());
      }
      pages.push(lines);
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
}
