"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { t } from "@rovotools/localization";
import { getToolRegistry } from "@/lib/registry";

interface PublicTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  path: string;
}

function loadRecent(): ReadonlyArray<PublicTool> {
  let ids: Array<string> = [];
  try {
    ids = JSON.parse(window.localStorage.getItem("rovotools:recents") ?? "[]") as Array<string>;
  } catch {
    return [];
  }
  if (ids.length === 0) {
    return [];
  }
  try {
    const entries = getToolRegistry().query({ platform: "WEB", sortBy: "name", limit: 100 });
    const tools: Array<PublicTool> = entries.map((entry) => ({
      id: entry.definition.id,
      slug: entry.definition.slug,
      name: entry.definition.name,
      description: entry.definition.description,
      path: `/tools/${entry.definition.slug}`,
    }));
    const byId = new Map(tools.map((tool) => [tool.id, tool]));
    return ids.map((id) => byId.get(id)).filter((tool): tool is PublicTool => tool !== undefined).slice(0, 4);
  } catch {
    return [];
  }
}

export default function RecentTools(): React.ReactElement {
  const [recent, setRecent] = useState<ReadonlyArray<PublicTool>>([]);

  // Local registry + localStorage read on mount (no network). Queued as a
  // microtask so the effect subscribes first and sets state in a callback.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setRecent(loadRecent());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (recent.length === 0) {
    return <></>;
  }

  return (
    <section aria-labelledby="recent-heading" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h2 id="recent-heading" className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25">
          <History className="h-5 w-5" aria-hidden="true" />
        </span>
        {t("en", "home.recentTitle")}
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((tool) => (
          <Link
            key={tool.id}
            prefetch={false}
            href={tool.path}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-slate-900/70"
          >
            <p className="font-bold text-slate-900 group-hover:text-[#7C3AED] dark:text-white dark:group-hover:text-violet-300">{tool.name}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
