import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { buildCustomSchemeUrl, getToolDisplay } from "@rovotools/tools";
import { t } from "@rovotools/localization";
import { WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/ads/AdSlot";
import FeedbackWidget from "@/components/FeedbackWidget";
import ToolCard from "@/components/tools/ToolCard";
import ToolRunnerLoader from "@/components/tools/ToolRunnerLoader";
import { Badge } from "@/components/ui/badge";
import { getAdSlotId } from "@/lib/ads";
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
  const display = getToolDisplay("en", tool);
  const related = registry.related(tool.id, 3);
  const matrix = registry.capabilityMatrix(tool.id);
  const runsLocally = tool.processingMode === "LOCAL" && !tool.requiresNetwork;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: display.name,
    description: display.description,
    url: `${WEB_URL}/tools/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: tool.supportedPlatforms.join(", "),
    offers: { "@type": "Offer", price: "0" },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        crumbs={[
          { label: t("en", "navigation.home"), href: "/" },
          { label: t("en", "navigation.tools"), href: "/tools" },
          { label: display.name },
        ]}
      />
      <Link
        href="/tools"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("en", "tool.allTools")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={`/tools/category/${tool.category}`}>
          <Badge variant="secondary" className="capitalize hover:bg-indigo-100 dark:hover:bg-indigo-950">
            {tool.category}
          </Badge>
        </Link>
        {tool.popular ? <Badge>{t("en", "tool.popular")}</Badge> : null}
        {tool.processingMode === "LOCAL" && !tool.requiresNetwork ? (
          <Badge variant="success" className="inline-flex items-center gap-1">
            <WifiOff className="h-3 w-3" aria-hidden="true" />
            {t("en", "tool.offlineReady")}
          </Badge>
        ) : (
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <Wifi className="h-3 w-3" aria-hidden="true" />
            {t("en", "tool.requiresInternet")}
          </Badge>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{display.name}</h1>
      <p className="mt-2 max-w-2xl text-zinc-500">{display.description}</p>
      <p className="mt-3 text-sm">
        <a
          href={buildCustomSchemeUrl({ kind: "tool", slug: tool.slug }) ?? `/tools/${tool.slug}`}
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {t("en", "tool.openInApp")} →
        </a>
      </p>

      <div className="mt-8">
        <ToolRunnerLoader slug={tool.slug} />
      </div>

      <div className="mt-8 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {runsLocally ? (
          <p>
            <strong>🔒 Your file is processed locally in your browser whenever supported.</strong>{" "}
            This tool runs entirely on your device — nothing you type or upload is sent to a server, logged, or stored.
          </p>
        ) : (
          <p>
            <strong>🔒 Privacy-conscious by design.</strong>{" "}
            This tool needs an internet connection for part of its work (for example, fetching a public resource).
            Only the data required for that step leaves your device — nothing is logged or stored, and everything else runs locally.
          </p>
        )}
      </div>

      <section aria-labelledby="how-to-use-heading" className="mt-12 max-w-3xl">
        <h2 id="how-to-use-heading" className="text-xl font-bold sm:text-2xl">
          How to use {display.name}
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Enter your details in the {t("en", "tool.inputs").toLowerCase()} panel above.</li>
          <li>Press {t("en", "tool.execute")} to compute the result instantly on your device.</li>
          <li>Copy, download or share the result — or reset to start over.</li>
        </ol>
        <h3 className="mt-6 font-semibold">What this tool does</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{display.description}</p>
        <h3 className="mt-6 font-semibold">Tips</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Double-check units and number formats before calculating.</li>
          <li>Bookmark this page or save the tool to your favourites for quick access.</li>
          <li>Everything works offline once the page has loaded.</li>
        </ul>
      </section>

      <FeedbackWidget toolId={tool.id} />

      <section aria-labelledby="capabilities-heading" className="mt-12">
        <h2 id="capabilities-heading" className="text-xl font-bold sm:text-2xl">
          {t("en", "matrix.title")}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
                <th scope="col" className="px-4 py-3">{t("en", "matrix.platform")}</th>
                <th scope="col" className="px-4 py-3">{t("en", "matrix.supported")}</th>
                <th scope="col" className="px-4 py-3">{t("en", "matrix.offline")}</th>
                <th scope="col" className="px-4 py-3">{t("en", "matrix.local")}</th>
                <th scope="col" className="px-4 py-3">{t("en", "matrix.server")}</th>
                <th scope="col" className="px-4 py-3">{t("en", "matrix.network")}</th>
              </tr>
            </thead>
            <tbody>
              {matrix.platforms.map((platform) => (
                <tr key={platform.platform} className="border-t border-zinc-200 dark:border-zinc-800">
                  <th scope="row" className="px-4 py-3 font-semibold">{platform.platform}</th>
                  <td className="px-4 py-3">{platform.supported ? t("en", "matrix.yes") : t("en", "matrix.no")}</td>
                  <td className="px-4 py-3">{platform.offlineCapable ? t("en", "matrix.yes") : t("en", "matrix.no")}</td>
                  <td className="px-4 py-3">{platform.localProcessing ? t("en", "matrix.yes") : t("en", "matrix.no")}</td>
                  <td className="px-4 py-3">{platform.serverProcessing ? t("en", "matrix.yes") : t("en", "matrix.no")}</td>
                  <td className="px-4 py-3">{platform.requiresNetwork ? t("en", "matrix.required") : t("en", "matrix.notRequired")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{t("en", "matrix.fileSystem")}: {matrix.requiresFileSystem ? t("en", "matrix.required").toLowerCase() : t("en", "matrix.notRequired").toLowerCase()}</Badge>
          <Badge variant="outline">{t("en", "matrix.camera")}: {matrix.requiresCamera ? t("en", "matrix.required").toLowerCase() : t("en", "matrix.notRequired").toLowerCase()}</Badge>
          <Badge variant="outline">{t("en", "matrix.share")}: {matrix.shareable ? t("en", "matrix.yes") : t("en", "matrix.no")}</Badge>
          <Badge variant="outline">{t("en", "matrix.storage")}: {matrix.storage.web} / {matrix.storage.mobile}</Badge>
        </div>
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-12">
          <h2 id="related-heading" className="text-xl font-bold sm:text-2xl">
            Related tools
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedEntry) => (
              <ToolCard key={relatedEntry.definition.id} entry={relatedEntry} />
            ))}
          </div>
        </section>
      ) : null}
      <AdSlot placement="tool-footer" slotId={getAdSlotId("tool-footer")} />
    </div>
  );
}
