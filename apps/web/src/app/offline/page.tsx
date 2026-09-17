import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { t } from "@rovotools/localization";
import ToolCard from "@/components/tools/ToolCard";
import { getToolRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: t("en", "seo.offlineTitle"),
  description: t("en", "seo.offlineDescription"),
  robots: { index: false, follow: false },
};

export default function OfflinePage(): React.ReactElement {
  const registry = getToolRegistry();
  const offlineTools = registry.query({ platform: "PWA", offlineCapable: true, sortBy: "name" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <WifiOff className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-semibold uppercase tracking-wider">{t("en", "common.offline")}</p>
      </div>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t("en", "seo.offlineTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        {t("en", "help.offlineNote")}
      </p>

      {offlineTools.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("en", "errors.networkUnavailable")}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offlineTools.map((entry) => (
            <ToolCard key={entry.definition.id} entry={entry} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400">
          ← {t("en", "common.back")}
        </Link>
      </div>
    </div>
  );
}
