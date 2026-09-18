import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategoryMetadata, getCategoryMetadata } from "@rovotools/tools";
import { t, tx } from "@rovotools/localization";
import { WEB_URL, BRAND_NAME } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolCard from "@/components/tools/ToolCard";
import { getToolRegistry } from "@/lib/registry";

const CATEGORIES = getAllCategoryMetadata().map((meta) => meta.category);

export function generateStaticParams(): Array<{ category: string }> {
  return getAllCategoryMetadata().map((meta) => ({ category: meta.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = CATEGORIES.find((item) => item === slug);
  if (category === undefined) {
    return { title: t("en", "errors.notFound") };
  }
  const meta = getCategoryMetadata(category);
  return {
    title: `${meta.title} | RovoTools`,
    description: meta.description,
    keywords: [...meta.keywords],
    alternates: { canonical: meta.path },
    openGraph: {
      siteName: BRAND_NAME,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "RovoTools \u2014 Free Online Tools for Everyday Work",
        },
      ],
      title: `${meta.title} | RovoTools`,
      description: meta.description,
      type: "website",
      url: `${WEB_URL}${meta.path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | RovoTools`,
      description: meta.description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }): Promise<React.ReactElement> {
  const { category: slug } = await params;
  const category = CATEGORIES.find((item) => item === slug);
  if (category === undefined) {
    notFound();
  }
  const meta = getCategoryMetadata(category);
  const registry = getToolRegistry();
  // Popular tools lead; Array.sort is stable so alphabetical order
  // survives inside each popularity group.
  const tools = registry
    .query({ category, platform: "WEB", sortBy: "name" })
    .slice()
    .sort((a, b) => Number(b.definition.popular) - Number(a.definition.popular));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.title,
    description: meta.description,
    url: `${WEB_URL}${meta.path}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.definition.name,
        url: `${WEB_URL}${entry.definition.seo?.canonicalPath ?? `/tools/${entry.definition.slug}`}`,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        crumbs={[
          { label: t("en", "navigation.home"), href: "/" },
          { label: t("en", "navigation.tools"), href: "/tools" },
          { label: meta.title },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{meta.title}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{meta.description}</p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {tools.length === 1
          ? t("en", "tool.oneTool")
          : tx("en", "tool.manyTools", { count: tools.length })}
      </p>
      {tools.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:text-zinc-400 dark:border-zinc-700">
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
