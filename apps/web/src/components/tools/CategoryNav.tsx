import Link from "next/link";
import type { ToolCategory, ToolCategoryFacet } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { Badge } from "@/components/ui/badge";
import { getCategoryStyle } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

export default function CategoryNav({
  facets,
  active,
  query,
}: {
  facets: ReadonlyArray<ToolCategoryFacet>;
  active?: ToolCategory;
  query?: string;
}): React.ReactElement {
  const href = (category?: string): string => {
    const params = new URLSearchParams();
    if (query !== undefined && query !== "") {
      params.set("q", query);
    }
    if (category !== undefined) {
      params.set("category", category);
    }
    const suffix = params.toString();
    return suffix === "" ? "/tools" : `/tools?${suffix}`;
  };

  return (
    <nav aria-label={t("en", "navigation.categories")} className="flex flex-wrap gap-2">
      <Link
        href={href()}
        aria-current={active === undefined ? "page" : undefined}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-bold transition-all",
          active === undefined
            ? "bg-gradient-to-r from-[#0066FF] via-[#7C3AED] to-[#D946EF] text-white shadow-lg shadow-indigo-500/25"
            : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500",
        )}
      >
        {t("en", "common.all")}
      </Link>
      {facets.map((facet) => {
        const style = getCategoryStyle(facet.category);
        const isActive = active === facet.category;
        return (
          <Link
            key={facet.category}
            href={href(facet.category)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all",
              isActive
                ? cn("bg-gradient-to-r text-white shadow-lg", style.gradient, style.glow)
                : cn(
                    "border bg-white hover:-translate-y-px hover:shadow-md dark:bg-slate-900",
                    style.border,
                  ),
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-white" : style.dot)} aria-hidden="true" />
            <span className={cn(!isActive && "text-slate-700 dark:text-slate-300")}>{facet.category}</span>
            <Badge variant="outline" className={cn("ml-0 border-0 px-1.5", isActive ? "bg-white/20 text-white" : cn(style.soft, style.text))}>
              {facet.count}
            </Badge>
          </Link>
        );
      })}
    </nav>
  );
}
