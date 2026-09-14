import type { ComponentType } from "react";

// Mobile mirror of the web custom-tool map: browser-only tools (image APIs)
// render a custom native component instead of the generic ToolRunner.
// Entries are added in steps 8-13, e.g.:
//
//   import ImageConverter from "./ImageConverter";
//   "image-converter": ImageConverter,
const customToolComponents: Record<string, ComponentType> = {};

export function getCustomMobileToolComponent(slug: string): ComponentType | undefined {
  return customToolComponents[slug];
}
