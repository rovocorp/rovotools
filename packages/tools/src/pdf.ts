// Pure, Node-safe PDF helpers for the browser-only PDF tools.
// pdf-lib is pure JavaScript: merge, split, re-save and creation run in
// Node (unit-tested here), in browsers and in React Native. Anything
// needing DOM/canvas (pdf.js page rendering, image downscaling, file
// pickers) lives in the per-app custom components; everything here is
// environment-agnostic and unit-tested in Node.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const MAX_PDF_FILES = 20;
export const MAX_PDF_BYTES = 100 * 1024 * 1024;

export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function isPdfBytes(data: Uint8Array): boolean {
  return (
    data.length > 4 &&
    data[0] === 0x25 && // %
    data[1] === 0x50 && // P
    data[2] === 0x44 && // D
    data[3] === 0x46 && // F
    data[4] === 0x2d // -
  );
}

export type SupportedImageType = "jpg" | "png";

export function detectImageType(data: Uint8Array): SupportedImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "jpg";
  }
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return "png";
  }
  return null;
}

/**
 * Parse a 1-based page-range expression like "1-3,5,8-6" into sorted,
 * unique 0-based page indices. Throws RangeError on syntax errors or
 * pages outside 1..pageCount.
 */
export function parsePageRanges(raw: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new RangeError("pageCount must be a positive integer.");
  }
  const cleaned = raw.trim();
  if (cleaned === "") {
    throw new RangeError('Enter page ranges like "1-3,5".');
  }
  const selected = new Set<number>();
  for (const part of cleaned.split(",")) {
    const token = part.trim();
    if (token === "") {
      throw new RangeError(`Invalid page range "${raw}". Use forms like "1-3,5".`);
    }
    const dash = token.indexOf("-");
    if (dash === -1) {
      const page = Number(token);
      if (!Number.isInteger(page)) {
        throw new RangeError(`"${token}" is not a page number. Use forms like "1-3,5".`);
      }
      assertPageInRange(page, pageCount);
      selected.add(page - 1);
      continue;
    }
    const start = Number(token.slice(0, dash).trim());
    const end = Number(token.slice(dash + 1).trim());
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new RangeError(`"${token}" is not a valid range. Use forms like "1-3,5".`);
    }
    assertPageInRange(start, pageCount);
    assertPageInRange(end, pageCount);
    const [from, to] = start <= end ? [start, end] : [end, start];
    for (let page = from; page <= to; page += 1) {
      selected.add(page - 1);
    }
  }
  if (selected.size === 0) {
    throw new RangeError('Enter page ranges like "1-3,5".');
  }
  return [...selected].sort((a, b) => a - b);
}

function assertPageInRange(page: number, pageCount: number): void {
  if (page < 1 || page > pageCount) {
    throw new RangeError(`Page ${page} is out of range (document has ${pageCount} page(s)).`);
  }
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function replaceExtension(filename: string, extension: string): string {
  const cleanExt = extension.replace(/^\./, "");
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.${cleanExt}`;
}

export function withSuffix(filename: string, suffix: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot > 0) {
    return `${filename.slice(0, dot)}-${suffix}${filename.slice(dot)}`;
  }
  return `${filename}-${suffix}`;
}

/** Manual base64 encode (no btoa/atob dependency, React Native safe). */
export function bytesToBase64(data: Uint8Array): string {
  let output = "";
  let i = 0;
  for (; i + 2 < data.length; i += 3) {
    const triple = ((data[i] as number) << 16) | ((data[i + 1] as number) << 8) | (data[i + 2] as number);
    output +=
      BASE64_ALPHABET.charAt((triple >> 18) & 63) +
      BASE64_ALPHABET.charAt((triple >> 12) & 63) +
      BASE64_ALPHABET.charAt((triple >> 6) & 63) +
      BASE64_ALPHABET.charAt(triple & 63);
  }
  const remaining = data.length - i;
  if (remaining === 1) {
    const triple = (data[i] as number) << 16;
    output += BASE64_ALPHABET.charAt((triple >> 18) & 63) + BASE64_ALPHABET.charAt((triple >> 12) & 63) + "==";
  } else if (remaining === 2) {
    const triple = ((data[i] as number) << 16) | ((data[i + 1] as number) << 8);
    output +=
      BASE64_ALPHABET.charAt((triple >> 18) & 63) +
      BASE64_ALPHABET.charAt((triple >> 12) & 63) +
      BASE64_ALPHABET.charAt((triple >> 6) & 63) +
      "=";
  }
  return output;
}

/** Manual base64 decode (no btoa/atob dependency, React Native safe). */
export function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/\s+/g, "");
  if (clean.length % 4 !== 0) {
    throw new RangeError("Invalid base64 input.");
  }
  const lookup = new Map<string, number>();
  for (let i = 0; i < BASE64_ALPHABET.length; i += 1) {
    lookup.set(BASE64_ALPHABET[i] as string, i);
  }
  let padding = 0;
  if (clean.endsWith("==")) {
    padding = 2;
  } else if (clean.endsWith("=")) {
    padding = 1;
  }
  const length = (clean.length / 4) * 3 - padding;
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup.get(clean[i] as string);
    const b = lookup.get(clean[i + 1] as string);
    const c = clean[i + 2] === "=" ? 0 : lookup.get(clean[i + 2] as string);
    const d = clean[i + 3] === "=" ? 0 : lookup.get(clean[i + 3] as string);
    if (a === undefined || b === undefined || c === undefined || d === undefined) {
      throw new RangeError("Invalid base64 input.");
    }
    const triple = (a << 18) | (b << 12) | (c << 6) | d;
    if (offset < length) {
      bytes[offset] = (triple >> 16) & 255;
      offset += 1;
    }
    if (offset < length) {
      bytes[offset] = (triple >> 8) & 255;
      offset += 1;
    }
    if (offset < length) {
      bytes[offset] = triple & 255;
      offset += 1;
    }
  }
  return bytes;
}

export function assertPdfBytes(data: Uint8Array, label = "file"): void {
  if (!(data instanceof Uint8Array) || data.length === 0) {
    throw new RangeError(`Choose a PDF ${label}.`);
  }
  if (data.length > MAX_PDF_BYTES) {
    throw new RangeError(`PDF ${label} exceeds the 100 MB limit.`);
  }
  if (!isPdfBytes(data)) {
    throw new RangeError(`The ${label} is not a valid PDF (missing %PDF- header).`);
  }
}

async function loadPdf(data: Uint8Array, label = "file"): Promise<PDFDocument> {
  assertPdfBytes(data, label);
  try {
    return await PDFDocument.load(data);
  } catch (error) {
    if (error instanceof RangeError) {
      throw error;
    }
    throw new RangeError(
      `Could not read the PDF ${label} (it may be encrypted or corrupted).${error instanceof Error ? ` ${error.message}` : ""}`,
    );
  }
}

export async function countPdfPages(data: Uint8Array): Promise<number> {
  const document = await loadPdf(data);
  return document.getPageCount();
}

/** Merge several PDFs into one, preserving page order. */
export async function mergePdfs(documents: ReadonlyArray<Uint8Array>): Promise<Uint8Array> {
  if (documents.length < 2) {
    throw new RangeError("Merging needs at least two PDF files.");
  }
  if (documents.length > MAX_PDF_FILES) {
    throw new RangeError(`Merging supports up to ${MAX_PDF_FILES} files at once.`);
  }
  const merged = await PDFDocument.create();
  for (let index = 0; index < documents.length; index += 1) {
    const source = await loadPdf(documents[index] as Uint8Array, `#${index + 1}`);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }
  return merged.save({ useObjectStreams: true });
}

/** Extract the given 0-based pages into a new single PDF. */
export async function splitPdfDocument(data: Uint8Array, pages: ReadonlyArray<number>): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new RangeError('Enter page ranges like "1-3,5".');
  }
  const source = await loadPdf(data);
  const pageCount = source.getPageCount();
  for (const page of pages) {
    if (!Number.isInteger(page) || page < 0 || page >= pageCount) {
      throw new RangeError(`Page ${page + 1} is out of range (document has ${pageCount} page(s)).`);
    }
  }
  const extracted = await PDFDocument.create();
  const copied = await extracted.copyPages(source, [...pages]);
  for (const page of copied) {
    extracted.addPage(page);
  }
  return extracted.save({ useObjectStreams: true });
}

/** Re-save a PDF with object streams (lossless size trim, drops dead objects). */
export async function resavePdf(data: Uint8Array): Promise<Uint8Array> {
  const document = await loadPdf(data);
  return document.save({ useObjectStreams: true });
}

export interface TextPdfOptions {
  readonly title?: string;
  readonly fontSize?: number;
}

/** Build a multi-page A4 PDF from plain text with word wrapping. */
export async function createTextPdf(text: string, options: TextPdfOptions = {}): Promise<Uint8Array> {
  const content = text.replace(/\r\n/g, "\n");
  if (content.trim() === "") {
    throw new RangeError("Enter some text to put in the PDF.");
  }
  const fontSize = options.fontSize ?? 11;
  if (!Number.isFinite(fontSize) || fontSize < 6 || fontSize > 48) {
    throw new RangeError("Font size must be between 6 and 48.");
  }
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const margin = 56.7;
  const lineHeight = fontSize * 1.35;
  const maxWidth = A4_WIDTH_PT - margin * 2;

  const paragraphs = content.split("\n");
  let page = document.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
  let cursorY = A4_HEIGHT_PT - margin;

  if (options.title !== undefined && options.title.trim() !== "") {
    page.drawText(options.title.trim().slice(0, 120), {
      x: margin,
      y: cursorY - fontSize,
      size: Math.min(20, fontSize + 6),
      font: bold,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= Math.min(20, fontSize + 6) + lineHeight;
  }

  const drawLine = (line: string): void => {
    if (cursorY < margin + lineHeight) {
      page = document.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
      cursorY = A4_HEIGHT_PT - margin;
    }
    page.drawText(line === "" ? " " : line, { x: margin, y: cursorY - fontSize, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    cursorY -= lineHeight;
  };

  for (const paragraph of paragraphs) {
    const words = (paragraph as string).split(/\s+/).filter((word) => word !== "");
    if (words.length === 0) {
      drawLine("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line === "" ? word : `${line} ${word}`;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        line = candidate;
      } else {
        if (line !== "") {
          drawLine(line);
        }
        // A single over-long word is hard-split so nothing is lost.
        let rest = word;
        line = "";
        while (font.widthOfTextAtSize(rest, fontSize) > maxWidth && rest.length > 1) {
          let cut = rest.length - 1;
          while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), fontSize) > maxWidth) {
            cut -= 1;
          }
          drawLine(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        line = rest;
      }
    }
    drawLine(line);
  }
  return document.save({ useObjectStreams: true });
}

export interface PdfImageInput {
  readonly data: Uint8Array;
  readonly name?: string;
}

export interface ImagesToPdfOptions {
  readonly orientation?: "portrait" | "landscape" | "fit";
}

/**
 * Build a PDF with one page per image. "fit" sizes each page to the
 * image; otherwise images are contained on A4 portrait/landscape pages.
 */
export async function imagesToPdf(
  images: ReadonlyArray<PdfImageInput>,
  options: ImagesToPdfOptions = {},
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new RangeError("Choose at least one image.");
  }
  if (images.length > MAX_PDF_FILES) {
    throw new RangeError(`One PDF supports up to ${MAX_PDF_FILES} images at once.`);
  }
  const orientation = options.orientation ?? "portrait";
  const document = await PDFDocument.create();
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index] as PdfImageInput;
    const kind = detectImageType(image.data);
    if (kind === null) {
      throw new RangeError(`"${image.name ?? `image #${index + 1}`}" is not a JPG or PNG file.`);
    }
    const embedded = kind === "jpg" ? await document.embedJpg(image.data) : await document.embedPng(image.data);
    const { width, height } = embedded.scale(1);
    if (orientation === "fit") {
      const page = document.addPage([width, height]);
      page.drawImage(embedded, { x: 0, y: 0, width, height });
      continue;
    }
    const landscape = orientation === "landscape";
    const pageWidth = landscape ? A4_HEIGHT_PT : A4_WIDTH_PT;
    const pageHeight = landscape ? A4_WIDTH_PT : A4_HEIGHT_PT;
    const margin = 36;
    const scale = Math.min((pageWidth - margin * 2) / width, (pageHeight - margin * 2) / height, 1);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    const page = document.addPage([pageWidth, pageHeight]);
    page.drawImage(embedded, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }
  return document.save({ useObjectStreams: true });
}

export interface SignatureStampOptions {
  /** 0-based page index. */
  readonly pageIndex: number;
  /** Horizontal position as 0-100 (% of page width from the left). */
  readonly xPct: number;
  /** Vertical position as 0-100 (% of page height from the bottom). */
  readonly yPct: number;
  /** Signature width as 0-100 (% of page width). */
  readonly widthPct: number;
}

/** Overlay a PNG signature onto a page of an existing PDF. */
export async function stampSignatureOnPdf(
  data: Uint8Array,
  signaturePng: Uint8Array,
  options: SignatureStampOptions,
): Promise<Uint8Array> {
  const document = await loadPdf(data);
  const pageCount = document.getPageCount();
  if (!Number.isInteger(options.pageIndex) || options.pageIndex < 0 || options.pageIndex >= pageCount) {
    throw new RangeError(`Page ${options.pageIndex + 1} is out of range (document has ${pageCount} page(s)).`);
  }
  for (const [key, value] of [["xPct", options.xPct], ["yPct", options.yPct], ["widthPct", options.widthPct]] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new RangeError(`${key} must be between 0 and 100.`);
    }
  }
  if (options.widthPct === 0) {
    throw new RangeError("Signature width must be greater than 0.");
  }
  if (detectImageType(signaturePng) !== "png") {
    throw new RangeError("The signature must be a PNG image (drawn or uploaded with transparency).");
  }
  const page = document.getPage(options.pageIndex);
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const signature = await document.embedPng(signaturePng);
  const { width, height } = signature.scale(1);
  const drawWidth = (options.widthPct / 100) * pageWidth;
  const drawHeight = height === 0 ? drawWidth : (drawWidth * height) / width;
  page.drawImage(signature, {
    x: (options.xPct / 100) * pageWidth,
    y: (options.yPct / 100) * pageHeight,
    width: drawWidth,
    height: drawHeight,
  });
  return document.save({ useObjectStreams: true });
}
