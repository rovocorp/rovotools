import type { Metadata } from "next";
import { Suspense } from "react";
import { t } from "@rovotools/localization";
import { WEB_URL, BRAND_NAME } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdRail from "@/components/ads/AdRail";
import AdSlot from "@/components/ads/AdSlot";
import ToolsExplorer from "@/components/tools/ToolsExplorer";
import { getAdSlotId } from "@/lib/ads";
import { getToolRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: t("en", "seo.toolsTitle"),
  description: t("en", "seo.toolsDescription"),
  alternates: { canonical: "/tools" },
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
    title: t("en", "seo.toolsTitle"),
    description: t("en", "seo.toolsDescription"),
    type: "website",
    url: `${WEB_URL}/tools`,
  },
};

// Static export: prerendered once at build time; live query/category
// filtering runs client-side in <ToolsExplorer /> via useSearchParams.
export const dynamic = "force-static";

function ToolsJsonLd(): React.ReactElement {
  const registry = getToolRegistry();
  const entries = registry.query({ platform: "WEB", sortBy: "name", limit: 100 });
  return (
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
            numberOfItems: entries.length,
            itemListElement: entries.map((entry, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: entry.definition.name,
              url: `${WEB_URL}${entry.definition.seo?.canonicalPath ?? `/tools/${entry.definition.slug}`}`,
            })),
          },
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function ToolsPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ToolsJsonLd />
      <Breadcrumbs
        crumbs={[
          { label: t("en", "navigation.home"), href: "/" },
          { label: t("en", "navigation.tools") },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("en", "navigation.tools")}</h1>
      {/* Sticky right rail (xl+ only) + listing column; rail collapses when ads are off. */}
      <div className="xl:flex xl:items-start xl:gap-8">
        <div className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <ToolsExplorer />
          </Suspense>
          <AdSlot placement="content-bottom" slotId={getAdSlotId("content-bottom")} />
        </div>
        <AdRail placement="listing-rail-right" slotId={getAdSlotId("listing-rail-right")} />
      </div>
    </div>
  );
}
