// Pure, Node-safe helpers for the browser-only image tools (steps 8-13).
// Anything needing canvas, File or DOM APIs lives in the per-app custom
// components; everything here is unit-tested in Node.

export type WebImageFormat = "webp" | "jpeg" | "png";

export interface ImageFormatInfo {
  readonly format: WebImageFormat;
  readonly mime: string;
  readonly extension: string;
  readonly supportsQuality: boolean;
  readonly supportsAlpha: boolean;
  readonly label: string;
}

export const IMAGE_FORMATS: Record<WebImageFormat, ImageFormatInfo> = {
  webp: {
    format: "webp",
    mime: "image/webp",
    extension: "webp",
    supportsQuality: true,
    supportsAlpha: true,
    label: "WebP (small, keeps transparency)",
  },
  jpeg: {
    format: "jpeg",
    mime: "image/jpeg",
    extension: "jpg",
    supportsQuality: true,
    supportsAlpha: false,
    label: "JPEG (smallest, no transparency)",
  },
  png: {
    format: "png",
    mime: "image/png",
    extension: "png",
    supportsQuality: false,
    supportsAlpha: true,
    label: "PNG (lossless, keeps transparency)",
  },
};

export function normalizeImageFormat(raw: string): WebImageFormat {
  const key = raw.trim().toLowerCase();
  if (key === "webp") {
    return "webp";
  }
  if (key === "jpeg" || key === "jpg") {
    return "jpeg";
  }
  if (key === "png") {
    return "png";
  }
  throw new RangeError(`Unsupported image format "${raw}". Use webp, jpeg or png.`);
}

export function normalizeImageQuality(raw: string, fallback = 85): number {
  if (raw.trim() === "") {
    return fallback;
  }
  const n = Math.floor(Number(raw));
  if (Number.isNaN(n) || n < 1 || n > 100) {
    throw new RangeError("Quality must be a whole number between 1 and 100.");
  }
  return n;
}

export function imageQualityToRatio(quality: number): number {
  return Math.min(1, Math.max(0.01, quality / 100));
}

export interface FitDimensions {
  readonly width: number;
  readonly height: number;
}

// Aspect-fit inside maxW×maxH. Never upscales: smaller sources keep native size.
export function computeFitDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
): FitDimensions {
  if (![srcWidth, srcHeight, maxWidth, maxHeight].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("Dimensions must be positive numbers.");
  }
  const scale = Math.min(1, maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.max(1, Math.round(srcWidth * scale)),
    height: Math.max(1, Math.round(srcHeight * scale)),
  };
}

export function conversionOutputName(filename: string, format: WebImageFormat): string {
  const base = filename.includes(".") ? filename.slice(0, filename.lastIndexOf(".")) : filename;
  return `${base.trim() === "" ? "image" : base.trim()}.${IMAGE_FORMATS[format].extension}`;
}
export const MAX_IMAGE_BATCH = 20;

export function assertImageBatchSize(count: number): void {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("Select at least one image.");
  }
  if (count > MAX_IMAGE_BATCH) {
    throw new RangeError(`Convert up to ${MAX_IMAGE_BATCH} images at once.`);
  }
}

// Scale dimensions by a percentage. Values above 100 upscale (soft result);
// the caller warns about that — browsers cannot invent detail.
export function scaleDimensions(srcWidth: number, srcHeight: number, percent: number): FitDimensions {
  if (![srcWidth, srcHeight].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("Source dimensions must be positive numbers.");
  }
  if (!Number.isFinite(percent) || percent <= 0 || percent > 800) {
    throw new RangeError("Scale must be between 1 and 800 percent.");
  }
  return {
    width: Math.max(1, Math.round((srcWidth * percent) / 100)),
    height: Math.max(1, Math.round((srcHeight * percent) / 100)),
  };
}

export interface ResizePreset {
  readonly label: string;
  readonly width: number;
  readonly height: number | null;
}

export const IMAGE_RESIZE_PRESETS: ReadonlyArray<ResizePreset> = [
  { label: "1920×1080 Full HD", width: 1920, height: 1080 },
  { label: "1280×720 YouTube", width: 1280, height: 720 },
  { label: "1080×1080 Instagram", width: 1080, height: 1080 },
  { label: "1200×630 Open Graph", width: 1200, height: 630 },
  { label: "800px wide blog", width: 800, height: null },
];

export interface CropRatio {
  readonly key: string;
  readonly label: string;
  readonly w: number | null;
  readonly h: number | null;
  readonly exportWidth?: number;
  readonly exportHeight?: number;
}

export const IMAGE_CROP_RATIOS: ReadonlyArray<CropRatio> = [
  { key: "free", label: "Free", w: null, h: null },
  { key: "1:1", label: "1:1 square", w: 1, h: 1 },
  { key: "4:5", label: "4:5 portrait", w: 4, h: 5 },
  { key: "16:9", label: "16:9 widescreen", w: 16, h: 9 },
  { key: "4:3", label: "4:3 classic", w: 4, h: 3 },
  { key: "youtube", label: "YouTube 1280×720", w: 16, h: 9, exportWidth: 1280, exportHeight: 720 },
];

export interface CropBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// Largest centered box with the given ratio inside srcW×srcH.
// A null ratio means the full image.
export function fitCropBox(srcWidth: number, srcHeight: number, ratioW: number | null, ratioH: number | null): CropBox {
  if (![srcWidth, srcHeight].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("Source dimensions must be positive numbers.");
  }
  if (ratioW === null || ratioH === null) {
    return { x: 0, y: 0, width: Math.floor(srcWidth), height: Math.floor(srcHeight) };
  }
  if (!(ratioW > 0 && ratioH > 0)) {
    throw new RangeError("Ratio parts must be positive numbers.");
  }
  const target = ratioW / ratioH;
  const current = srcWidth / srcHeight;
  let width: number;
  let height: number;
  if (current > target) {
    height = srcHeight;
    width = height * target;
  } else {
    width = srcWidth;
    height = width / target;
  }
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  return { x: Math.floor((srcWidth - w) / 2), y: Math.floor((srcHeight - h) / 2), width: w, height: h };
}

// Clamp a box inside the image and enforce a minimum size.
export function clampCropBox(box: CropBox, srcWidth: number, srcHeight: number, minSize = 8): CropBox {
  const width = Math.min(srcWidth, Math.max(minSize, Math.floor(box.width)));
  const height = Math.min(srcHeight, Math.max(minSize, Math.floor(box.height)));
  return {
    x: Math.min(Math.max(0, Math.floor(box.x)), Math.max(0, srcWidth - width)),
    y: Math.min(Math.max(0, Math.floor(box.y)), Math.max(0, srcHeight - height)),
    width,
    height,
  };
}

export interface FaviconSize {
  readonly filename: string;
  readonly size: number;
  readonly label: string;
}

export const FAVICON_SIZES: ReadonlyArray<FaviconSize> = [
  { filename: "favicon-16x16.png", size: 16, label: "Browser tab" },
  { filename: "favicon-32x32.png", size: 32, label: "Retina tab / shortcut" },
  { filename: "favicon-48x48.png", size: 48, label: "Windows tile" },
  { filename: "apple-touch-icon.png", size: 180, label: "iOS home screen" },
  { filename: "icon-192.png", size: 192, label: "Android / manifest" },
  { filename: "icon-512.png", size: 512, label: "Android splash / maskable" },
];

export function buildFaviconHtml(): string {
  return [
    '<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png">',
    '<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">',
    '<link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join("\n");
}

// Largest centered square inside srcW×srcH (favicons are square).
export function centerSquareCrop(srcWidth: number, srcHeight: number): { x: number; y: number; size: number } {
  if (![srcWidth, srcHeight].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("Source dimensions must be positive numbers.");
  }
  const size = Math.floor(Math.min(srcWidth, srcHeight));
  return { x: Math.floor((srcWidth - size) / 2), y: Math.floor((srcHeight - size) / 2), size };
}

export interface SampledPixel {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, "0")).join("")}`;
}

// Read one pixel from an RGBA buffer. Throws outside the image.
export function samplePixel(pixels: ArrayLike<number>, width: number, height: number, x: number, y: number): SampledPixel {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RangeError("Image dimensions must be positive numbers.");
  }
  if (px < 0 || py < 0 || px >= width || py >= height) {
    throw new RangeError("That point is outside the image.");
  }
  const i = (py * width + px) * 4;
  return { r: pixels[i] ?? 0, g: pixels[i + 1] ?? 0, b: pixels[i + 2] ?? 0, a: pixels[i + 3] ?? 255 };
}

// Six dominant opaque colors via 12-bit bucket counting (skips transparency).
export function extractDominantColors(pixels: ArrayLike<number>, count = 6): Array<string> {
  if (!Number.isInteger(count) || count < 1 || count > 24) {
    throw new RangeError("Count must be between 1 and 24.");
  }
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    const a = pixels[i + 3] ?? 0;
    if (a < 128) {
      continue;
    }
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const slot = buckets.get(key);
    if (slot === undefined) {
      buckets.set(key, { count: 1, r, g, b });
    } else {
      slot.count += 1;
      slot.r += r;
      slot.g += g;
      slot.b += b;
    }
  }
  return [...buckets.values()]
    .sort((x, y) => y.count - x.count)
    .slice(0, count)
    .map((slot) => rgbToHex(slot.r / slot.count, slot.g / slot.count, slot.b / slot.count));
}

// Highest quality (1-100) whose measured size fits under targetBytes.
// Assumes size grows with quality; probes at most `attempts` times.
export async function findQualityForTarget(  measureBytes: (quality: number) => Promise<number>,
  targetBytes: number,
  attempts = 9,
): Promise<number> {
  if (!Number.isFinite(targetBytes) || targetBytes <= 0) {
    throw new RangeError("Target size must be a positive number of bytes.");
  }
  let lo = 1;
  let hi = 100;
  let best = 1;
  for (let i = 0; i < attempts; i += 1) {
    const mid = Math.floor((lo + hi) / 2);
    const size = await measureBytes(mid);
    if (!Number.isFinite(size) || size < 0) {
      throw new RangeError("Could not measure the encoded size.");
    }
    if (size <= targetBytes) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
    if (lo > hi) {
      break;
    }
  }
  return best;
}
