'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { CUSTOM_TOOL_SLUGS, type CustomToolSlug } from './customToolSlugs';

// Tools with enhanced browser UIs render a custom component instead of the
// generic ToolRunner: browser-only tools need file pickers, live previews and
// downloads, while adsense-earnings-calculator adds live FX rates. Each entry
// is dynamically imported so tool pages only load the code they need. The
// Record key is the shared slug list, so adding a slug without a component
// (or vice versa) fails the typecheck.
const customToolComponents: Record<CustomToolSlug, ComponentType> = {
  'adsense-earnings-calculator': dynamic(() => import('./AdsenseCalculator'), { ssr: false }),
  'image-converter': dynamic(() => import('./ImageConverter'), { ssr: false }),
  'image-resizer': dynamic(() => import('./ImageResizer'), { ssr: false }),
  'image-compressor': dynamic(() => import('./ImageCompressor'), { ssr: false }),
  'favicon-generator': dynamic(() => import('./FaviconGenerator'), { ssr: false }),
  'color-picker-from-image': dynamic(() => import('./ColorPickerFromImage'), { ssr: false }),
  'image-cropper': dynamic(() => import('./ImageCropper'), { ssr: false }),
  'merge-pdf': dynamic(() => import('./MergePdf'), { ssr: false }),
  'split-pdf': dynamic(() => import('./SplitPdf'), { ssr: false }),
  'compress-pdf': dynamic(() => import('./CompressPdf'), { ssr: false }),
  'jpg-to-pdf': dynamic(() => import('./JpgToPdf'), { ssr: false }),
  'pdf-to-jpg': dynamic(() => import('./PdfToJpg'), { ssr: false }),
  'word-to-pdf': dynamic(() => import('./WordToPdf'), { ssr: false }),
  'pdf-creator': dynamic(() => import('./PdfCreator'), { ssr: false }),
  'sign-pdf': dynamic(() => import('./SignPdf'), { ssr: false }),
  'pdf-to-word': dynamic(() => import('./PdfToWord'), { ssr: false }),
  'pdf-to-excel': dynamic(() => import('./PdfToExcel'), { ssr: false }),
  'seo-checker': dynamic(() => import('./SeoCheckers').then((m) => ({ default: m.SeoChecker })), { ssr: false }),
  'open-graph-checker': dynamic(() => import('./SeoCheckers').then((m) => ({ default: m.OpenGraphChecker })), { ssr: false }),
  'sitemap-checker': dynamic(() => import('./SeoCheckers').then((m) => ({ default: m.SitemapChecker })), { ssr: false }),
  'tag-detector': dynamic(() => import('./SeoCheckers').then((m) => ({ default: m.TagDetector })), { ssr: false }),
  'performance-analyzer': dynamic(() => import('./SeoCheckers').then((m) => ({ default: m.PerformanceAnalyzer })), { ssr: false }),
  'color-picker': dynamic(() => import('./ColorPicker'), { ssr: false }),
  'tax-calculator': dynamic(() => import('./TaxCalculator'), { ssr: false }),
};

export function getCustomToolComponent(slug: string): ComponentType | undefined {
  if (!(CUSTOM_TOOL_SLUGS as ReadonlyArray<string>).includes(slug)) {
    return undefined;
  }
  return customToolComponents[slug as CustomToolSlug];
}
