import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { t } from "@/shared/localization";
import { WEB_URL, BRAND_NAME } from "@/shared/config";
import ToolDetail from "@/components/tools/ToolDetail";
import { getToolPageMetadata } from "@/shared/tools/seo";
import { getToolRegistry } from "@/lib/registry";
import { getPdfToolStaticParams } from "./generate";

export function generateStaticParams(): Array<{ toolId: string }> {
  return getPdfToolStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ toolId: string }> }): Promise<Metadata> {
  const { toolId } = await params;
  const registry = getToolRegistry();
  const entry = registry.get(toolId);
  if (entry === undefined || entry.definition.seo?.canonicalPath !== `/tools/pdf/${entry.definition.slug}`) {
    return { title: t("en", "errors.notFound") };
  }
  const page = getToolPageMetadata(entry, WEB_URL);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.canonicalPath },
    robots: page.noIndex === true ? { index: false, follow: false } : undefined,
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
      title: `${page.title} | ${BRAND_NAME}`,
      description: page.description,
      type: page.openGraphType ?? "website",
      url: page.canonicalUrl ?? page.canonicalPath,
    },
    twitter: {
      card: page.twitterCard ?? "summary_large_image",
      title: `${page.title} | ${BRAND_NAME}`,
      description: page.description,
    },
  };
}

// Individual landing page for one high-demand PDF task, e.g.
// /tools/pdf/merge-pdf. Full in-browser processing renders below the
// SEO copy via ToolDetail (no single combined /pdf-tools page).
export default async function PdfToolPage({ params }: { params: Promise<{ toolId: string }> }): Promise<React.ReactElement> {
  const { toolId } = await params;
  const registry = getToolRegistry();
  const entry = registry.get(toolId);
  if (entry === undefined || entry.definition.seo?.canonicalPath !== `/tools/pdf/${entry.definition.slug}`) {
    notFound();
  }
  return <ToolDetail slug={entry.definition.slug} />;
}
