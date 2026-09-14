import type { MetadataRoute } from "next";
import { WEB_URL } from "@rovotools/config";
import { getAllCategoryMetadata } from "@rovotools/tools";
import { BLOG_POSTS } from "@/lib/blog";
import { getToolRegistry } from "@/lib/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const registry = getToolRegistry();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: WEB_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${WEB_URL}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${WEB_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${WEB_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${WEB_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${WEB_URL}/security`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${WEB_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = registry
    .sitemap(WEB_URL)
    .filter((entry) => entry.noIndex !== true && entry.url !== undefined)
    .map((entry) => ({
      url: entry.url as string,
      lastModified: now,
      changeFrequency: entry.changeFrequency ?? "weekly",
      priority: entry.priority ?? 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = getAllCategoryMetadata().map((meta) => ({
    url: `${WEB_URL}${meta.path}`,
    lastModified: now,
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
