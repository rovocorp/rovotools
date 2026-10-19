import { BLOG_POSTS } from "@/lib/blog";
import { BRAND_NAME, WEB_URL } from "@/shared/config";

// Blog posts are compiled into the app, so the feed can be prerendered once
// per deployment like the sitemap.
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET(): Response {
  const posts = BLOG_POSTS.filter((post) => post.noIndex !== true).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const items = posts
    .map((post) => {
      const url = `${WEB_URL}/blog/${post.slug}/`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        `      <category>${escapeXml(post.category)}</category>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(BRAND_NAME)} Blog</title>`,
    `    <link>${WEB_URL}/blog/</link>`,
    `    <description>Guides that explain what our tools compute — and why.</description>`,
    "    <language>en</language>",
    `    <atom:link href="${WEB_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
