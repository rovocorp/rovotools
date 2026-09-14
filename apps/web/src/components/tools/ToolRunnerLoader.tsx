"use client";

import { createElement } from "react";
import dynamic from "next/dynamic";
import { t } from "@rovotools/localization";
import { getCustomToolComponent } from "@/components/tools/custom/customTools";

const ToolRunner = dynamic(() => import("@/components/tools/ToolRunner"), {
  ssr: false,
  loading: () => (
    <div
      aria-busy="true"
      aria-label={t("en", "common.loading")}
      className="animate-pulse rounded-xl border border-border bg-card p-6"
    >
      <div className="h-10 rounded-lg bg-muted" />
      <div className="mt-3 h-10 rounded-lg bg-muted" />
      <div className="mt-3 h-10 w-1/3 rounded-lg bg-muted" />
    </div>
  ),
});

export default function ToolRunnerLoader({ slug }: { slug: string }): React.ReactElement {
  const CustomTool = getCustomToolComponent(slug);
  // createElement (not JSX): the component reference is module-stable, so its
  // state persists across renders of this loader.
  if (CustomTool !== undefined) {
    return createElement(CustomTool);
  }
  return <ToolRunner slug={slug} />;
}
