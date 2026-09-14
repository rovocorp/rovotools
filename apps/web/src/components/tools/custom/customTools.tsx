"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Tools with enhanced browser UIs render a custom component instead of the
// generic ToolRunner: browser-only tools need file pickers, live previews and
// downloads, while adsense-earnings-calculator adds live FX rates. Each entry
// is dynamically imported so tool pages only load the code they need.
const customToolComponents: Record<string, ComponentType> = {
  "adsense-earnings-calculator": dynamic(() => import("./AdsenseCalculator"), { ssr: false }),
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
