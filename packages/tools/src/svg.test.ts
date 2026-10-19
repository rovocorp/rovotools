import { describe, expect, it } from "vitest";

import {
  analyzeSvgComplexity,
  applyFillToTracedSvg,
  computeRasterTarget,
  computeTraceScale,
  intrinsicSvgSize,
  normalizeRasterScale,
  normalizeRasterWidth,
  normalizeSvgSource,
  normalizeTraceThreshold,
  normalizeTurdSize,
  parseSvgDimensions,
  svgOutputName,
  svgToBase64,
  svgToBase64DataUri,
  svgToCssBackground,
  svgToEncodedDataUri,
} from "./svg";

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">' +
  '<rect width="120" height="80" fill="#eee"/>' +
  '<path d="M10 10h40v40H10z" fill="black"/></svg>';

describe("svg helpers", () => {
  it("parses width, height and viewBox", () => {
    const dims = parseSvgDimensions(SAMPLE_SVG);
    expect(dims.width).toBe(120);
    expect(dims.height).toBe(80);
    expect(dims.viewBox).toEqual({ minX: 0, minY: 0, width: 120, height: 80 });
  });

  it("returns nulls for percent dimensions and missing viewBox", () => {
    const dims = parseSvgDimensions('<svg width="100%" height="50%"><rect/></svg>');
    expect(dims.width).toBeNull();
    expect(dims.height).toBeNull();
    expect(dims.viewBox).toBeNull();
  });

  it("falls back to viewBox size when width/height are missing", () => {
    const dims = parseSvgDimensions('<svg viewBox="0 0 64 32"><rect/></svg>');
    expect(intrinsicSvgSize(dims)).toEqual({ width: 64, height: 32 });
  });

  it("falls back to 512 when nothing is set", () => {
    expect(intrinsicSvgSize(parseSvgDimensions("<svg><rect/></svg>"))).toEqual({
      width: 512,
      height: 512,
    });
  });

  it("computes raster targets from scale and exact width", () => {
    expect(computeRasterTarget({ width: 100, height: 50 }, { scale: 2 })).toEqual({
      width: 200,
      height: 100,
    });
    expect(computeRasterTarget({ width: 100, height: 50 }, { targetWidth: 400 })).toEqual({
      width: 400,
      height: 200,
    });
  });

  it("normalizes scale, width, threshold and turdsize", () => {
    expect(normalizeRasterScale("")).toBe(1);
    expect(normalizeRasterScale("4")).toBe(4);
    expect(() => normalizeRasterScale("0")).toThrow(RangeError);
    expect(normalizeRasterWidth("")).toBeUndefined();
    expect(normalizeRasterWidth("800")).toBe(800);
    expect(() => normalizeRasterWidth("99999")).toThrow(RangeError);
    expect(normalizeTraceThreshold("")).toBe(-1);
    expect(normalizeTraceThreshold("auto")).toBe(-1);
    expect(normalizeTraceThreshold("180")).toBe(180);
    expect(() => normalizeTraceThreshold("300")).toThrow(RangeError);
    expect(normalizeTurdSize("")).toBe(2);
    expect(normalizeTurdSize("10")).toBe(10);
    expect(() => normalizeTurdSize("200")).toThrow(RangeError);
  });

  it("computes trace downscale so long edge stays under the cap", () => {
    expect(computeTraceScale(2000, 1000)).toBeCloseTo(1024 / 2000);
    expect(computeTraceScale(512, 256)).toBe(1);
  });

  it("injects fill colour into traced SVG", () => {
    const traced = '<svg width="10" height="10"><path d="M0 0h10v10H0z" stroke="none" fill="black" fill-rule="evenodd"/></svg>';
    const colored = applyFillToTracedSvg(traced, "#4f46e5");
    expect(colored).toContain('fill="#4f46e5"');
    expect(colored).not.toContain('fill="black"');
    expect(applyFillToTracedSvg(traced, "black")).toBe(traced);
  });

  it("encodes Base64 and data URIs", () => {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg'><text>Hi</text></svg>";
    const b64 = svgToBase64(svg);
    expect(b64).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(svgToBase64DataUri(svg)).toBe(`data:image/svg+xml;base64,${b64}`);
    expect(svgToEncodedDataUri(svg).startsWith("data:image/svg+xml,")).toBe(true);
    expect(svgToCssBackground(svg).startsWith("background-image: url(")).toBe(true);
    // Round-trip: decode Base64 back to source.
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    expect(decoded).toBe(svg);
  });

  it("produces .svg download names", () => {
    expect(svgOutputName("logo.png")).toBe("logo.svg");
    expect(svgOutputName("logo")).toBe("logo.svg");
    expect(svgOutputName("")).toBe("image.svg");
  });

  it("analyzes complexity", () => {
    const stats = analyzeSvgComplexity(SAMPLE_SVG);
    expect(stats.pathCount).toBe(1);
    expect(stats.elementCount).toBeGreaterThanOrEqual(3);
    expect(stats.hasXmlns).toBe(true);
  });

  it("strips BOM and trims source", () => {
    expect(normalizeSvgSource("\uFEFF  <svg></svg>  ")).toBe("<svg></svg>");
  });
});
