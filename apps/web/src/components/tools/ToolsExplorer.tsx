"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getAllCategoryMetadata } from "@/shared/tools";
import { tx } from "@/shared/localization";
import { t } from "@/shared/localization";
import SearchBar from "@/components/SearchBar";
import CategoryNav from "@/components/tools/CategoryNav";
import ToolCard from "@/components/tools/ToolCard";
import { getToolRegistry } from "@/lib/registry";

const CATEGORIES = getAllCategoryMetadata().map((meta) => meta.category);

export default function ToolsExplorer(): React.ReactElement {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const categoryParam = searchParams.get("category");
  const category = CATEGORIES.find((item) => item === categoryParam);

  const ordered = useMemo(() => {
    const registry = getToolRegistry();
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
    // Browse mode (no search): popular tools lead; search keeps relevance
    // order. Array.sort is stable, so alphabetical order survives inside
    // each popularity group.
    return query === "" ? [...tools].sort((a, b) => Number(b.definition.popular) - Number(a.definition.popular)) : tools;
  }, [query, category]);

  const facets = useMemo(() => getToolRegistry().categories(), []);

  return (
    <>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {ordered.length === 1
          ? t("en", "tool.oneTool")
          : tx("en", "tool.manyTools", { count: ordered.length })}
        {query !== "" ? ` â€” â€œ${query}â€` : ""}
      </p>

      <div className="mt-6 max-w-xl">
        <SearchBar key={query} initialQuery={query} />
      </div>
      <div className="mt-4">
        <CategoryNav facets={facets} {...(category === undefined ? {} : { active: category })} query={query} />
      </div>

      {ordered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:text-zinc-400 dark:border-zinc-700">
          {t("en", "tool.noResults")}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((entry) => (
            <ToolCard key={entry.definition.id} entry={entry} />
          ))}
        </div>
      )}
    </>
  );
}
