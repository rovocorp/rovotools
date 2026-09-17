import type { ToolCategory } from "@rovotools/types";

export interface CategoryStyle {
  readonly gradient: string;
  readonly soft: string;
  readonly text: string;
  readonly border: string;
  readonly dot: string;
  readonly glow: string;
}

/**
 * Vibrant per-category color system.
 * Gives every part of the site (hero chips, cards, nav pills)
 * authentic color variation while staying accessible in both themes.
 */
export const CATEGORY_STYLES: Record<ToolCategory, CategoryStyle> = {
  pdf: {
    gradient: "from-rose-500 to-orange-500",
    soft: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-900/60",
    dot: "bg-rose-500",
    glow: "shadow-rose-500/25",
  },
  image: {
    gradient: "from-fuchsia-500 to-pink-500",
    soft: "bg-fuchsia-50 dark:bg-fuchsia-950/50",
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    border: "border-fuchsia-200 dark:border-fuchsia-900/60",
    dot: "bg-fuchsia-500",
    glow: "shadow-fuchsia-500/25",
  },
  developer: {
    gradient: "from-indigo-600 to-blue-500",
    soft: "bg-indigo-50 dark:bg-indigo-950/50",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-900/60",
    dot: "bg-indigo-500",
    glow: "shadow-indigo-500/25",
  },
  text: {
    gradient: "from-emerald-500 to-teal-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-900/60",
    dot: "bg-emerald-500",
    glow: "shadow-emerald-500/25",
  },
  security: {
    gradient: "from-lime-500 to-emerald-600",
    soft: "bg-lime-50 dark:bg-lime-950/40",
    text: "text-lime-700 dark:text-lime-400",
    border: "border-lime-200 dark:border-lime-900/60",
    dot: "bg-lime-500",
    glow: "shadow-lime-500/25",
  },
  design: {
    gradient: "from-violet-600 to-fuchsia-500",
    soft: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-900/60",
    dot: "bg-violet-500",
    glow: "shadow-violet-500/25",
  },
  color: {
    gradient: "from-orange-400 via-pink-500 to-violet-600",
    soft: "bg-pink-50 dark:bg-pink-950/50",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-900/60",
    dot: "bg-pink-500",
    glow: "shadow-pink-500/25",
  },
  qr: {
    gradient: "from-cyan-500 to-blue-600",
    soft: "bg-cyan-50 dark:bg-cyan-950/50",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-900/60",
    dot: "bg-cyan-500",
    glow: "shadow-cyan-500/25",
  },
  calculator: {
    gradient: "from-sky-500 to-indigo-600",
    soft: "bg-sky-50 dark:bg-sky-950/50",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-900/60",
    dot: "bg-sky-500",
    glow: "shadow-sky-500/25",
  },
  finance: {
    gradient: "from-green-500 to-emerald-600",
    soft: "bg-green-50 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-900/60",
    dot: "bg-green-600",
    glow: "shadow-green-500/25",
  },
  seo: {
    gradient: "from-teal-500 to-green-500",
    soft: "bg-teal-50 dark:bg-teal-950/50",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-900/60",
    dot: "bg-teal-500",
    glow: "shadow-teal-500/25",
  },
  validator: {
    gradient: "from-emerald-600 to-cyan-600",
    soft: "bg-emerald-50 dark:bg-teal-950/50",
    text: "text-emerald-700 dark:text-teal-300",
    border: "border-emerald-200 dark:border-teal-900/60",
    dot: "bg-emerald-600",
    glow: "shadow-emerald-600/25",
  },
  formatter: {
    gradient: "from-purple-500 to-indigo-500",
    soft: "bg-purple-50 dark:bg-purple-950/50",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-900/60",
    dot: "bg-purple-500",
    glow: "shadow-purple-500/25",
  },
};

/** Neutral slate used when a slug has no curated style (unknown category). */
const FALLBACK_STYLE: CategoryStyle = {
  gradient: "from-slate-500 to-slate-700",
  soft: "bg-slate-100 dark:bg-slate-800/60",
  text: "text-slate-600 dark:text-slate-300",
  border: "border-slate-200 dark:border-slate-700",
  dot: "bg-slate-400",
  glow: "shadow-slate-500/20",
};

export function getCategoryStyle(category: string): CategoryStyle {
  return (
    (CATEGORY_STYLES as Record<string, CategoryStyle>)[category] ?? FALLBACK_STYLE
  );
}
