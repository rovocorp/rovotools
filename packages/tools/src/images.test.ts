import { describe, expect, it } from "vitest";

import {
  FAVICON_SIZES,
  assertImageBatchSize,
  buildFaviconHtml,
  centerSquareCrop,
  clampCropBox,
  computeFitDimensions,
  conversionOutputName,
  extractDominantColors,
  findQualityForTarget,
  fitCropBox,
  imageQualityToRatio,
  normalizeImageFormat,
  normalizeImageQuality,
  rgbToHex,
  samplePixel,
  scaleDimensions,
} from "./images";

describe("image helpers", () => {
  it("normalizes formats", () => {
    expect(normalizeImageFormat("WebP")).toBe("webp");
    expect(normalizeImageFormat("jpg")).toBe("jpeg");
    expect(normalizeImageFormat("PNG")).toBe("png");
    expect(() => normalizeImageFormat("heic")).toThrow();
  });

  it("normalizes quality", () => {
    expect(normalizeImageQuality("", 85)).toBe(85);
    expect(normalizeImageQuality("72")).toBe(72);
    expect(() => normalizeImageQuality("0")).toThrow();
    expect(() => normalizeImageQuality("101")).toThrow();
    expect(imageQualityToRatio(85)).toBeCloseTo(0.85);
  });

  it("fits dimensions without upscaling", () => {
    expect(computeFitDimensions(4000, 3000, 1920, 1920)).toEqual({ width: 1920, height: 1440 });
    expect(computeFitDimensions(800, 600, 1920, 1920)).toEqual({ width: 800, height: 600 });
    expect(() => computeFitDimensions(0, 600, 100, 100)).toThrow();
  });

  it("names converted files", () => {
    expect(conversionOutputName("photo.PNG", "webp")).toBe("photo.webp");
    expect(conversionOutputName("noext", "jpeg")).toBe("noext.jpg");
  });

  it("guards batch size", () => {
    expect(() => assertImageBatchSize(0)).toThrow();
    expect(() => assertImageBatchSize(21)).toThrow();
    expect(() => assertImageBatchSize(20)).not.toThrow();
  });

  it("scales dimensions by percent", () => {
    expect(scaleDimensions(4000, 3000, 50)).toEqual({ width: 2000, height: 1500 });
    expect(() => scaleDimensions(800, 600, 0)).toThrow();
    expect(() => scaleDimensions(800, 600, 801)).toThrow();
  });

  it("binary-searches the best quality under a target", async () => {
    const measure = async (q: number): Promise<number> => q * 10;
    expect(await findQualityForTarget(measure, 500)).toBe(50);
    expect(await findQualityForTarget(measure, 5)).toBe(1);
    await expect(findQualityForTarget(measure, 0)).rejects.toThrow();
  });

  it("describes six favicon files plus install HTML", () => {
    expect(FAVICON_SIZES).toHaveLength(6);
    expect(FAVICON_SIZES.map((s) => s.size)).toEqual([16, 32, 48, 180, 192, 512]);
    expect(buildFaviconHtml()).toContain('rel="apple-touch-icon"');
  });

  it("crops the centered square", () => {
    expect(centerSquareCrop(800, 600)).toEqual({ x: 100, y: 0, size: 600 });
    expect(centerSquareCrop(600, 800)).toEqual({ x: 0, y: 100, size: 600 });
    expect(() => centerSquareCrop(0, 10)).toThrow();
  });

  it("samples pixels and converts to hex", () => {
    // 2×1 image: red, then green.
    const pixels = [255, 0, 0, 255, 0, 255, 0, 255];
    expect(samplePixel(pixels, 2, 1, 0, 0)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    expect(() => samplePixel(pixels, 2, 1, 5, 0)).toThrow();
  });

  it("extracts dominant colors, skipping transparency", () => {
    // 3 red pixels, 1 blue, 1 transparent green (ignored).
    const pixels = [200, 0, 0, 255, 210, 0, 0, 255, 205, 0, 0, 255, 0, 0, 255, 255, 0, 255, 0, 0];
    const top = extractDominantColors(pixels, 6);
    expect(top).toEqual(["#cb0000", "#d20000", "#0000ff"]);
    expect(() => extractDominantColors(pixels, 0)).toThrow();
  });

  it("fits and clamps crop boxes", () => {
    expect(fitCropBox(800, 600, null, null)).toEqual({ x: 0, y: 0, width: 800, height: 600 });
    // 800×600 at 16:9 → 800×450, vertically centered.
    expect(fitCropBox(800, 600, 16, 9)).toEqual({ x: 0, y: 75, width: 800, height: 450 });
    // 600×800 at 16:9 → width-constrained.
    expect(fitCropBox(600, 800, 16, 9)).toEqual({ x: 0, y: 231, width: 600, height: 337 });
    expect(clampCropBox({ x: -50, y: 10, width: 2000, height: 20 }, 800, 600)).toEqual({
      x: 0,
      y: 10,
      width: 800,
      height: 20,
    });
    expect(() => fitCropBox(800, 600, 0, 9)).toThrow();
  });
});
