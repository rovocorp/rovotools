import type { Metadata } from "next";
import { getAllCategoryMetadata } from "@rovotools/tools";
import { t, tx } from "@rovotools/localization";
import { WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/tools/CategoryNav";
import ToolCard from "@/components/tools/ToolCard";
import { getToolRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: t("en", "seo.toolsTitle"),
  description: t("en", "seo.toolsDescription"),
  alternates: { canonical: "/tools" },
  openGraph: {
    title: t("en", "seo.toolsTitle"),
    description: t("en", "seo.toolsDescription"),
    type: "website",
    url: `${WEB_URL}/tools`,
  },
};

const CATEGORIES = getAllCategoryMetadata().map((meta) => meta.category);

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const registry = getToolRegistry();
  const query = params.q?.trim() ?? "";
  const category = CATEGORIES.find((item) => item === params.category);

  const tools =
    query === ""
      ? registry.query({
          ...(category === undefined ? {} : { category }),
          platform: "WEB",
          sortBy: "name",
        })
      : registry.search(query, {
          ...(category === undefined ? {} : { category }),
          platform: "WEB",
          sortBy: "name",
        });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("en", "seo.toolsTitle"),
            description: t("en", "seo.toolsDescription"),
            url: `${WEB_URL}/tools`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: tools.length,
              itemListElement: tools.map((entry, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: entry.definition.name,
                url: `${WEB_URL}/tools/${entry.definition.slug}`,
              })),
            },
          }),
        }}
      />
      <Breadcrumbs
        crumbs={[
          { label: t("en", "navigation.home"), href: "/" },
          { label: t("en", "navigation.tools") },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("en", "navigation.tools")}</h1>
      <p className="mt-2 text-zinc-500">
        {tools.length === 1
          ? t("en", "tool.oneTool")
          : tx("en", "tool.manyTools", { count: tools.length })}
        {query !== "" ? ` — “${query}”` : ""}
      </p>

      <div className="mt-6 max-w-xl">
        <SearchBar initialQuery={query} />
      </div>
      <div className="mt-4">
        <CategoryNav
          facets={registry.categories()}
          {...(category === undefined ? {} : { active: category })}
          query={query}
        />
      </div>

      {tools.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          {t("en", "tool.noResults")}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((entry) => (
            <ToolCard key={entry.definition.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
