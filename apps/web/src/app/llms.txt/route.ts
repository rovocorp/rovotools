import { BRAND_NAME, WEB_URL } from "@/shared/config";
import { getAllCategoryMetadata } from "@/shared/tools/categories";
import { BLOG_POSTS } from "@/lib/blog";
import { getToolRegistry } from "@/lib/registry";

// Generated at build time like the sitemap and RSS feed.
export const dynamic = "force-static";

export function GET(): Response {
  const categories = getAllCategoryMetadata();
  const toolCount = getToolRegistry().getAll().length;
  const posts = BLOG_POSTS.filter((post) => post.noIndex !== true)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const lines = [
    `# ${BRAND_NAME}`,
    "",
    `> ${BRAND_NAME} (${WEB_URL}) is a free online tools site with ${toolCount}+ browser-based utilities for PDFs, images, developer tasks, calculators, finance, text, security and SEO. Tools run locally in the browser; no sign-up required.`,
    "",
    "## Key pages",
    `- [All tools](${WEB_URL}/tools/): Browse the full catalog of free tools.`,
    `- [Blog](${WEB_URL}/blog/): Guides explaining how the tools compute results.`,
    `- [About](${WEB_URL}/about/): Who builds ${BRAND_NAME}.`,
    `- [Contact](${WEB_URL}/contact/): Support and business enquiries.`,
    `- [Security](${WEB_URL}/security/): How files and data are handled.`,
    `- [Privacy](${WEB_URL}/privacy/): Privacy policy.`,
    `- [Terms](${WEB_URL}/terms/): Terms of use.`,
    "",
    "## Tool categories",
    ...categories.map(
      (category) => `- [${category.title}](${WEB_URL}${category.path}/): ${category.description}`,
    ),
    "",
    "## Recent blog posts",
    ...posts.map(
      (post) => `- [${post.title}](${WEB_URL}/blog/${post.slug}/): ${post.excerpt}`,
    ),
    "",
    "## Machine-readable resources",
    `- [llms.txt](${WEB_URL}/llms.txt)`,
    `- [Homepage Markdown](${WEB_URL}/home.md)`,
    `- [RSS feed](${WEB_URL}/feed.xml)`,
    `- [Sitemap](${WEB_URL}/sitemap.xml)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
