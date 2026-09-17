import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { t } from "@rovotools/localization";
import { WEB_URL, BRAND_NAME } from "@rovotools/config";
import ToolDetail from "@/components/tools/ToolDetail";
import { getToolRegistry } from "@/lib/registry";
import { getToolStaticParams } from "./generate";

export function generateStaticParams(): Array<{ toolId: string }> {
  return getToolStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ toolId: string }> }): Promise<Metadata> {
  const { toolId } = await params;
  const registry = getToolRegistry();
  const entry = registry.get(toolId);
  if (entry === undefined) {
    return { title: t("en", "errors.notFound") };
  }
  const page = registry.pageMetadata(toolId, WEB_URL);
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords.split(",").map((keyword) => keyword.trim()),
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
      title: page.title,
      description: page.description,
      type: page.openGraphType ?? "website",
      url: page.canonicalUrl ?? page.canonicalPath,
    },
    twitter: {
      card: page.twitterCard ?? "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ toolId: string }> }): Promise<React.ReactElement> {
  const { toolId } = await params;
  const registry = getToolRegistry();
  const entry = registry.get(toolId);
  if (entry === undefined) {
    notFound();
  }
  const tool = entry.definition;
  // PDF tools have dedicated nested landing pages (/tools/pdf/<slug>).
  // The flat /tools/<slug> URL permanently redirects there (see
  // next.config.ts) — this in-page redirect covers dev/preview where
  // config redirects may not run.
  const canonicalPath = tool.seo?.canonicalPath;
  if (canonicalPath !== undefined && canonicalPath !== `/tools/${tool.slug}`) {
    redirect(canonicalPath);
  }
  return <ToolDetail slug={tool.slug} />;
}
