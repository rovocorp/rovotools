import { describe, expect, it } from "vitest";

import {
  base64ToBytes,
  bytesToBase64,
  countPdfPages,
  createTextPdf,
  detectImageType,
  formatBytes,
  imagesToPdf,
  isPdfBytes,
  mergePdfs,
  parsePageRanges,
  replaceExtension,
  resavePdf,
  splitPdfDocument,
  stampSignatureOnPdf,
  withSuffix,
} from "./pdf";

// 1x1 transparent PNG.
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("page-range parser", () => {
  it("parses singles, ranges and reversed ranges", () => {
    expect(parsePageRanges("1-3,5", 10)).toEqual([0, 1, 2, 4]);
    expect(parsePageRanges("8-6", 10)).toEqual([5, 6, 7]);
    expect(parsePageRanges("3,3,2", 10)).toEqual([1, 2]);
  });

  it("rejects syntax errors and out-of-range pages", () => {
    expect(() => parsePageRanges("", 5)).toThrow(RangeError);
    expect(() => parsePageRanges("0", 5)).toThrow(RangeError);
    expect(() => parsePageRanges("6", 5)).toThrow(RangeError);
    expect(() => parsePageRanges("1-x", 5)).toThrow(RangeError);
    expect(() => parsePageRanges("1-", 5)).toThrow(RangeError);
  });
});

describe("base64 bridge", () => {
  it("round-trips arbitrary bytes without btoa/atob", () => {
    const original = Uint8Array.from([0, 1, 2, 250, 251, 252, 253, 254, 255, 72, 101, 108, 108, 111]);
    expect(base64ToBytes(bytesToBase64(original))).toEqual(original);
  });

  it("rejects invalid input", () => {
    expect(() => base64ToBytes("!!!")).toThrow(RangeError);
    expect(() => base64ToBytes("abc")).toThrow(RangeError);
  });
});

describe("filename helpers", () => {
  it("formats bytes, replaces extensions and adds suffixes", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(replaceExtension("scan.JPG", "pdf")).toBe("scan.pdf");
    expect(replaceExtension("noext", "pdf")).toBe("noext.pdf");
    expect(withSuffix("a.pdf", "merged")).toBe("a-merged.pdf");
  });

  it("detects image types by magic bytes", () => {
    expect(detectImageType(base64ToBytes(TINY_PNG_BASE64))).toBe("png");
    expect(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]))).toBe("jpg");
    expect(detectImageType(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]))).toBeNull();
  });
});

describe("pdf-lib round trips", () => {
  it("creates a multi-page text PDF", async () => {
    const bytes = await createTextPdf(`${"Lorem ipsum dolor sit amet. ".repeat(60)}\n`.repeat(8), {
      title: "Hello",
    });
    expect(isPdfBytes(bytes)).toBe(true);
    expect(await countPdfPages(bytes)).toBeGreaterThan(1);
    await expect(createTextPdf("   ")).rejects.toThrow(RangeError);
  });

  it("merges and splits PDFs", async () => {
    const first = await createTextPdf("First document.");
    const second = await createTextPdf("Second document.");
    const merged = await mergePdfs([first, second]);
    expect(await countPdfPages(merged)).toBe(2);
    const split = await splitPdfDocument(merged, [1]);
    expect(await countPdfPages(split)).toBe(1);
    await expect(mergePdfs([first])).rejects.toThrow(RangeError);
    await expect(splitPdfDocument(merged, [9])).rejects.toThrow(RangeError);
    await expect(splitPdfDocument(Uint8Array.from([1, 2, 3]), [0])).rejects.toThrow(RangeError);
  });

  it("re-saves and stamps signatures", async () => {
    const original = await createTextPdf("Please sign here.");
    const resaved = await resavePdf(original);
    expect(isPdfBytes(resaved)).toBe(true);
    expect(await countPdfPages(resaved)).toBe(1);
    const signature = base64ToBytes(TINY_PNG_BASE64);
    const signed = await stampSignatureOnPdf(original, signature, {
      pageIndex: 0,
      xPct: 60,
      yPct: 10,
      widthPct: 30,
    });
    expect(await countPdfPages(signed)).toBe(1);
    await expect(
      stampSignatureOnPdf(original, signature, { pageIndex: 4, xPct: 10, yPct: 10, widthPct: 30 }),
    ).rejects.toThrow(RangeError);
  });

  it("builds a PDF from images", async () => {
    const png = base64ToBytes(TINY_PNG_BASE64);
    const bytes = await imagesToPdf([{ data: png, name: "dot.png" }], { orientation: "fit" });
    expect(await countPdfPages(bytes)).toBe(1);
    await expect(imagesToPdf([])).rejects.toThrow(RangeError);
    await expect(
      imagesToPdf([{ data: Uint8Array.from([1, 2, 3]), name: "evil.txt" }]),
    ).rejects.toThrow(RangeError);
  });
});
