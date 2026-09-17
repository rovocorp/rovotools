// Framework-free list of tools with bespoke browser UIs (rendered instead of
// the generic ToolRunner form). Imported by customTools.tsx (keeps the
// component map in sync at compile time) and by the E2E specs (which give
// bespoke tools dedicated tests instead of the generic sweep).
export const CUSTOM_TOOL_SLUGS = [
  "adsense-earnings-calculator",
  "image-converter",
  "image-resizer",
  "image-compressor",
  "favicon-generator",
  "color-picker-from-image",
  "image-cropper",
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "word-to-pdf",
  "pdf-creator",
  "sign-pdf",
  "pdf-to-word",
  "pdf-to-excel",
  "seo-checker",
  "open-graph-checker",
  "sitemap-checker",
  "tag-detector",
  "performance-analyzer",
] as const;

export type CustomToolSlug = (typeof CUSTOM_TOOL_SLUGS)[number];

// Bespoke UIs that render neither the generic runner form nor a file input:
// the generic input/flow sweeps cannot drive them, so they are excluded
// there and covered by dedicated spec tests.
export const BESPOKE_TOOL_SLUGS: ReadonlySet<string> = new Set([
  "adsense-earnings-calculator",
  "pdf-creator",
  "seo-checker",
  "open-graph-checker",
  "sitemap-checker",
  "tag-detector",
  "performance-analyzer",
]);
