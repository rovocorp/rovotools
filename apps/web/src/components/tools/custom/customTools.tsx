"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Browser-only tools (canvas/file APIs) render a custom component instead of
// the generic ToolRunner, which cannot do file pickers, live previews or
// image downloads. Each entry is dynamically imported so tool pages only load
// the code they need.
const customToolComponents: Record<string, ComponentType> = {
  "image-converter": dynamic(() => import("./ImageConverter"), { ssr: false }),
  "image-resizer": dynamic(() => import("./ImageResizer"), { ssr: false }),
  "image-compressor": dynamic(() => import("./ImageCompressor"), { ssr: false }),
  "favicon-generator": dynamic(() => import("./FaviconGenerator"), { ssr: false }),
  "color-picker-from-image": dynamic(() => import("./ColorPickerFromImage"), { ssr: false }),
  "image-cropper": dynamic(() => import("./ImageCropper"), { ssr: false }),
};

export function getCustomToolComponent(slug: string): ComponentType | undefined {
  return customToolComponents[slug];
}
