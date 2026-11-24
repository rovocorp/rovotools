import { BRAND_NAME, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import { getAllCategoryMetadata } from "@/shared/tools/categories";
import { getToolRegistry } from "@/lib/registry";

// Markdown representation of the homepage, served when an agent sends
// `Accept: text/markdown` to `/` (see src/middleware.ts). Generated once per
// deployment like the sitemap.
export const dynamic = "force-static";

export function GET(): Response {
  const categories = getAllCategoryMetadata();
  const toolCount = getToolRegistry().getAll().length;

  const lines = [
    `# ${BRAND_NAME}`,
    "",
    `> ${BRAND_NAME} is a free online tools site with ${toolCount}+ browser-based utilities for PDFs, images, developer tasks, calculators, finance, text, security and SEO.`,
    "",
    `${BRAND_NAME} runs its tools locally in the browser: files are not uploaded to a server, and there is no sign-up. Use the links below to reach the catalog, guides and company pages.`,
    "",
    "## Key pages",
    `- [All tools](${WEB_URL}/tools/): Browse the full catalog of ${toolCount}+ free tools.`,
    `- [Blog](${WEB_URL}/blog/): Guides explaining how each tool computes its result.`,
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
    "## Contact",
    `- Email: [${SUPPORT_EMAIL}](mailto:${SUPPORT_EMAIL})`,
    `- Contact page: ${WEB_URL}/contact/`,
    "",
    "## Machine-readable resources",
    `- [llms.txt](${WEB_URL}/llms.txt)`,
    `- [RSS feed](${WEB_URL}/feed.xml)`,
    `- [Sitemap](${WEB_URL}/sitemap.xml)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
