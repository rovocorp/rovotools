// Pure, Node-safe helpers for the SVG tool family (SVG↔image conversion,
// viewer, Base64/data-URI). Anything needing canvas, File or DOM APIs lives
// in the per-app custom components; everything here is unit-tested in Node.

export interface SvgViewBox {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

export interface SvgDimensions {
  /** Width attribute in px (null when absent or not a plain number). */
  readonly width: number | null;
  /** Height attribute in px (null when absent or not a plain number). */
  readonly height: number | null;
  readonly viewBox: SvgViewBox | null;
}

const SVG_DIMENSION_FALLBACK = 512;

/** Parse width/height attributes and viewBox from an SVG source string. */
export function parseSvgDimensions(svgText: string): SvgDimensions {
  const head = svgText.slice(0, 4096);
  const width = parsePositiveNumberAttr(head, "width");
  const height = parsePositiveNumberAttr(head, "height");
  const viewBoxMatch = /viewBox\s*=\s*["']([^"']+)["']/i.exec(head);
  let viewBox: SvgViewBox | null = null;
  if (viewBoxMatch?.[1] !== undefined) {
    const parts = viewBoxMatch[1]
      .trim()
      .split(/[\s,]+/)
      .map((part) => Number(part));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [minX, minY, vbWidth, vbHeight] = parts as [number, number, number, number];
      if (vbWidth > 0 && vbHeight > 0) {
        viewBox = { minX, minY, width: vbWidth, height: vbHeight };
      }
    }
  }
  return { width, height, viewBox };
}

function parsePositiveNumberAttr(head: string, name: string): number | null {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(head);
  if (match?.[1] === undefined) {
    return null;
  }
  const raw = match[1].trim().replace(/px$/i, "");
  if (raw === "" || !/^\d+(\.\d+)?$/.test(raw)) {
    // Percent / em / unit-bearing values are not reliable pixel sizes.
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Intrinsic pixel size used when rasterizing: width/height, else viewBox, else fallback. */
export function intrinsicSvgSize(dims: SvgDimensions): { width: number; height: number } {
  if (dims.width !== null && dims.height !== null) {
    return { width: dims.width, height: dims.height };
  }
  if (dims.viewBox !== null) {
    return {
      width: Math.max(1, Math.round(dims.viewBox.width)),
      height: Math.max(1, Math.round(dims.viewBox.height)),
    };
  }
  if (dims.width !== null) {
    const height = Math.max(1, Math.round((dims.width * 1) / 1));
    return { width: dims.width, height };
  }
  if (dims.height !== null) {
    return { width: dims.height, height: dims.height };
  }
  return { width: SVG_DIMENSION_FALLBACK, height: SVG_DIMENSION_FALLBACK };
}

export interface RasterTargetOptions {
  /** Integer scale factor (1, 2, 3, 4…). Ignored when targetWidth is set. */
  readonly scale?: number;
  /** Exact output width in px; height follows aspect ratio. */
  readonly targetWidth?: number;
}

export interface RasterTarget {
  readonly width: number;
  readonly height: number;
}

/** Compute raster output size from intrinsic SVG size + scale or exact width. */
export function computeRasterTarget(
  intrinsic: { width: number; height: number },
  options: RasterTargetOptions = {},
): RasterTarget {
  const aspect = intrinsic.height / intrinsic.width;
  const requestedWidth =
    options.targetWidth !== undefined && options.targetWidth > 0
      ? Math.floor(options.targetWidth)
      : Math.max(1, Math.round(intrinsic.width * (options.scale ?? 1)));
  const width = Math.min(8192, Math.max(1, requestedWidth));
  const height = Math.min(8192, Math.max(1, Math.round(width * aspect)));
  return { width, height };
}

export function normalizeRasterScale(raw: string): number {
  if (raw.trim() === "") {
    return 1;
  }
  const n = Math.floor(Number(raw));
  if (Number.isNaN(n) || n < 1 || n > 8) {
    throw new RangeError("Scale must be a whole number between 1 and 8 (for example 2 for 2×).");
  }
  return n;
}

export function normalizeRasterWidth(raw: string): number | undefined {
  if (raw.trim() === "") {
    return undefined;
  }
  const n = Math.floor(Number(raw));
  if (Number.isNaN(n) || n < 1 || n > 8192) {
    throw new RangeError("Width must be a whole number between 1 and 8192 pixels.");
  }
  return n;
}

/** Downscale large sources before tracing so WASM/memory stays stable. */
export const TRACE_MAX_DIMENSION = 1024;

export function computeTraceScale(srcWidth: number, srcHeight: number, maxDim = TRACE_MAX_DIMENSION): number {
  if (![srcWidth, srcHeight].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("Source dimensions must be positive numbers.");
  }
  return Math.min(1, maxDim / Math.max(srcWidth, srcHeight));
}

/** Clamp a threshold string: empty or "auto" → -1 (Otsu), else 0–255. */
export function normalizeTraceThreshold(raw: string): number {
  const key = raw.trim().toLowerCase();
  if (key === "" || key === "auto") {
    return -1;
  }
  const n = Math.floor(Number(key));
  if (Number.isNaN(n) || n < 0 || n > 255) {
    throw new RangeError("Threshold must be “auto” or a whole number between 0 and 255.");
  }
  return n;
}

/** Clamp despeckle size (turdsize) to a sane range. */
export function normalizeTurdSize(raw: string, fallback = 2): number {
  if (raw.trim() === "") {
    return fallback;
  }
  const n = Math.floor(Number(raw));
  if (Number.isNaN(n) || n < 0 || n > 100) {
    throw new RangeError("Despeckle must be a whole number between 0 and 100.");
  }
  return n;
}

/**
 * Inject a fill colour into the SVG produced by potrace's getSVG (which
 * always emits fill="black" on the traced path). Leaves other fills alone.
 */
export function applyFillToTracedSvg(svg: string, fill: string): string {
  const safe = fill.trim();
  if (safe === "" || safe.toLowerCase() === "black") {
    return svg;
  }
  return svg.replace(/fill="black"/g, `fill="${safe.replace(/"/g, "&quot;")}"`);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  // btoa is global in Node 16+ and every supported browser.
  return btoa(binary);
}

/** Raw Base64 of the UTF-8 SVG source (no data: prefix). */
export function svgToBase64(svgText: string): string {
  return bytesToBase64(new TextEncoder().encode(svgText));
}

/** data:image/svg+xml;base64,… — safe for CSS url() and <img src>. */
export function svgToBase64DataUri(svgText: string): string {
  return `data:image/svg+xml;base64,${svgToBase64(svgText)}`;
}

/** URL-encoded data URI — often smaller than Base64 for text-heavy SVGs. */
export function svgToEncodedDataUri(svgText: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svgText)}`;
}

/** Ready-to-paste CSS background-image declaration. */
export function svgToCssBackground(svgText: string): string {
  return `background-image: url("${svgToEncodedDataUri(svgText)}");`;
}

/** Ensure a download filename ends with .svg. */
export function svgOutputName(filename: string): string {
  const trimmed = filename.trim();
  const base = trimmed.includes(".") ? trimmed.slice(0, trimmed.lastIndexOf(".")) : trimmed;
  return `${base === "" ? "image" : base}.svg`;
}

/** Cheap structural stats for the viewer (regex counts — Node-safe). */
export interface SvgComplexity {
  readonly pathCount: number;
  readonly elementCount: number;
  readonly hasXmlns: boolean;
}

const SVG_ELEMENT_RE = /<([a-zA-Z][\w:-]*)\b[^>]*\/?>/g;

export function analyzeSvgComplexity(svgText: string): SvgComplexity {
  let pathCount = 0;
  let elementCount = 0;
  SVG_ELEMENT_RE.lastIndex = 0;
  let match = SVG_ELEMENT_RE.exec(svgText);
  while (match !== null) {
    elementCount += 1;
    if (match[1]?.toLowerCase() === "path") {
      pathCount += 1;
    }
    match = SVG_ELEMENT_RE.exec(svgText);
  }
  return {
    pathCount,
    elementCount,
    hasXmlns: /xmlns\s*=/.test(svgText.slice(0, 2048)),
  };
}

/** Strip a UTF-8 BOM and trim leading whitespace so parsing stays predictable. */
export function normalizeSvgSource(svgText: string): string {
  return svgText.replace(/^\uFEFF/, "").trim();
}
