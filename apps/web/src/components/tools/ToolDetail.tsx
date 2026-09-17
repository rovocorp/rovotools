import Link from "next/link";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { buildCustomSchemeUrl, getToolDisplay, getToolPageCopy } from "@rovotools/tools";
import { t } from "@rovotools/localization";
import { WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdRail from "@/components/ads/AdRail";
import AdSlot from "@/components/ads/AdSlot";
import FeedbackWidget from "@/components/FeedbackWidget";
import ToolCard from "@/components/tools/ToolCard";
import ToolRunnerLoader from "@/components/tools/ToolRunnerLoader";
import { Badge } from "@/components/ui/badge";
import { getAdSlotId } from "@/lib/ads";
import { getCategoryLabel } from "@/lib/category-label";
import { getToolRegistry } from "@/lib/registry";

// Shared renderer for individual tool landing pages. Both the flat
// /tools/<slug> route and the nested /tools/pdf/<slug> route render
// through here so every high-demand PDF task gets a full landing page
// (SEO copy + working in-browser processor) with no duplicated markup.
export default function ToolDetail({ slug }: { slug: string }): React.ReactElement {
  const registry = getToolRegistry();
  const entry = registry.require(slug);
  const tool = entry.definition;
  const display = getToolDisplay("en", tool);
  const copy = getToolPageCopy(tool);
  const related =
    copy.related.length > 0
      ? copy.related
          .map((id) => registry.get(id))
          .filter((relatedEntry) => relatedEntry !== undefined)
      : registry.related(tool.id, 3);
  const matrix = registry.capabilityMatrix(tool.id);
  const runsLocally = tool.processingMode === "LOCAL" && !tool.requiresNetwork;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: display.name,
    description: display.description,
    url: `${WEB_URL}${tool.seo?.canonicalPath ?? `/tools/${tool.slug}`}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: tool.supportedPlatforms.join(", "),
    offers: { "@type": "Offer", price: "0" },
  };

  const faqJsonLd =
    copy.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: copy.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${display.name}`,
    step: copy.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Sticky right rail (xl+ only) + main column. AdRail renders null
          unless ads are enabled, so the column collapses with no gap. */}
      <div className="xl:flex xl:items-start xl:gap-8">
      <div className="min-w-0 flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      {faqJsonLd !== null ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}
      <Breadcrumbs
        crumbs={[
          { label: t("en", "navigation.home"), href: "/" },
          { label: t("en", "navigation.tools"), href: "/tools" },
          { label: display.name },
        ]}
      />
      <Link
        href="/tools"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("en", "tool.allTools")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={`/tools/category/${tool.category}`}>
          <Badge variant="secondary" className="hover:bg-indigo-100 dark:hover:bg-indigo-950">
            {getCategoryLabel(tool.category)}
          </Badge>
        </Link>
        {tool.popular ? <Badge>{t("en", "tool.popular")}</Badge> : null}
        {tool.requiresNetwork ? (
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <Wifi className="h-3 w-3" aria-hidden="true" />
            {t("en", "tool.requiresInternet")}
          </Badge>
        ) : null}
      </div>

      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{display.name}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">{copy.intro}</p>
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

      <section aria-labelledby="benefits-heading" className="mt-8 max-w-3xl">
        <h2 id="benefits-heading" className="text-xl font-bold sm:text-2xl">
          Why use {display.name}?
        </h2>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {copy.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-to-use-heading" className="mt-12 max-w-3xl">
        <h2 id="how-to-use-heading" className="text-xl font-bold sm:text-2xl">
          How to use {display.name}
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {copy.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {tool.supportedFormats.length > 0 ? (
          <>
            <h3 className="mt-6 font-semibold">Supported inputs and formats</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Accepted formats: {tool.supportedFormats.join(", ")}.
            </p>
          </>
        ) : null}
      </section>

      {copy.faqs.length > 0 ? (
        <section aria-labelledby="faq-heading" className="mt-12 max-w-3xl">
          <h2 id="faq-heading" className="text-xl font-bold sm:text-2xl">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-4">
            {copy.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {copy.workflow !== undefined ? (
        <section aria-labelledby="workflow-heading" className="mt-12 max-w-3xl">
          <h2 id="workflow-heading" className="text-xl font-bold sm:text-2xl">
            Related workflow: {copy.workflow.title}
          </h2>
          <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {copy.workflow.steps.map((step, index) => (
              <li key={step.href} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="font-bold text-zinc-400">
                    →
                  </span>
                ) : null}
                <Link
                  href={step.href}
                  className="rounded-full border border-zinc-200 px-4 py-2 font-semibold text-indigo-600 hover:border-indigo-300 hover:underline dark:border-zinc-700 dark:text-indigo-400"
                >
                  {step.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <FeedbackWidget toolId={tool.id} />

      <section aria-labelledby="capabilities-heading" className="mt-12">
        <h2 id="capabilities-heading" className="text-xl font-bold sm:text-2xl">
          {t("en", "matrix.title")}
        </h2>
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="capabilities-heading"
          className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800"
        >
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 dark:bg-zinc-900">
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
      <AdRail placement="tool-rail-right" slotId={getAdSlotId("tool-rail-right")} />
      </div>
    </div>
  );
}
