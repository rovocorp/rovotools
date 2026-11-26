import type { MetadataRoute } from "next";
import { SITE_LAST_REVIEWED_ISO, WEB_URL } from "@/shared/config";
import { getAllCategoryMetadata } from "@/shared/tools/categories";
import { toSitemapEntries } from "@/shared/tools/seo";
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
  // Static/editorial pages share the last-review date so it matches the date
  // shown on the page. Bump SITE_LAST_REVIEWED_ISO when those pages change.
  const staticReviewDate = new Date(`${SITE_LAST_REVIEWED_ISO}T00:00:00.000Z`);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: WEB_URL, lastModified: stableLastModified, changeFrequency: "daily", priority: 1 },
    { url: `${WEB_URL}/tools`, lastModified: stableLastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${WEB_URL}/blog`, lastModified: stableLastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${WEB_URL}/about`, lastModified: staticReviewDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${WEB_URL}/editorial`, lastModified: staticReviewDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${WEB_URL}/changelog`, lastModified: staticReviewDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${WEB_URL}/contact`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.4 },
    { url: `${WEB_URL}/security`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.4 },
    { url: `${WEB_URL}/accessibility`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/cookie-policy`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/disclaimer`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/privacy`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${WEB_URL}/terms`, lastModified: staticReviewDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = toSitemapEntries(registry.getAll(), WEB_URL)
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

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.filter((post) => post.noIndex !== true).map((post) => ({
    url: `${WEB_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...blogRoutes].map((entry) => ({
    ...entry,
    // trailingSlash: true — every page canonicalizes to the slash form and
    // the server 308-redirects the non-slash URL. Sitemap entries must be
    // the final canonical URLs so crawlers never hit a redirect from a
    // submitted sitemap URL.
    url: entry.url.endsWith("/") ? entry.url : `${entry.url}/`,
  }));
}
