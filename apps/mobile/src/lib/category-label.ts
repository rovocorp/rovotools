import { getAllCategoryMetadata } from "@rovotools/tools";

/**
 * Display label for a tool category slug.
 * Raw slugs ("seo", "qr") read badly on their own, so every category
 * badge must go through this helper, which returns the curated title
 * ("SEO Tools", "QR & Barcode Tools", ...). Unknown slugs fall back
 * to the raw value instead of throwing.
 */
const TITLES: ReadonlyMap<string, string> = new Map(
  getAllCategoryMetadata().map((meta) => [meta.category, meta.title]),
);

export function getCategoryLabel(category: string): string {
  return TITLES.get(category) ?? category;
}
