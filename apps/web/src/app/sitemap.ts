import type { MetadataRoute } from "next";
import { WEB_URL } from "@rovotools/config";
import { getAllCategoryMetadata } from "@rovotools/tools";
import { BLOG_POSTS } from "@/lib/blog";
import { getToolRegistry } from "@/lib/registry";

// Static export: prerender sitemap at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const registry = getToolRegistry();
  // Stable date on purpose: `new Date()` on every build made ALL ~129 URLs
  // look "changed", triggering a full recrawl burst right after each deploy
  // and tripping shared-hosting 429s. Bump this only when page content
  // actually changes. Blog posts keep their own per-post dates below.
  const stableLastModified = new Date("2026-10-01T00:00:00.000Z");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: WEB_URL, lastModified: stableLastModified, changeFrequency: "daily", priority: 1 },
    { url: `${WEB_URL}/tools`, lastModified: stableLastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${WEB_URL}/blog`, lastModified: stableLastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${WEB_URL}/about`, lastModified: stableLastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${WEB_URL}/contact`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${WEB_URL}/security`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${WEB_URL}/accessibility`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/cookie-policy`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/disclaimer`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/privacy`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/terms`, lastModified: stableLastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = registry
    .sitemap(WEB_URL)
    .filter((entry) => entry.noIndex !== true && entry.url !== undefined)
    .map((entry) => ({
      url: entry.url as string,
      lastModified: stableLastModified,
      changeFrequency: entry.changeFrequency ?? "weekly",
      priority: entry.priority ?? 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = getAllCategoryMetadata().map((meta) => ({
    url: `${WEB_URL}${meta.path}`,
    lastModified: stableLastModified,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${WEB_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...blogRoutes];
}
