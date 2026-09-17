import Link from "next/link";
import { ArrowRight, Braces, FileText, Image as ImageIcon, Lock, Palette, QrCode, Calculator, type LucideIcon } from "lucide-react";
import { getToolDisplay } from "@rovotools/tools";
import type { ToolRegistryEntry } from "@rovotools/types";
import { t } from "@rovotools/localization";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryStyle } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  developer: Braces,
  security: Lock,
  design: Palette,
  color: Palette,
  image: ImageIcon,
  qr: QrCode,
  calculator: Calculator,
  finance: Calculator,
  text: FileText,
};

export default function ToolCard({ entry }: { entry: ToolRegistryEntry }): React.ReactElement {
  const tool = entry.definition;
  const display = getToolDisplay("en", tool);
  const style = getCategoryStyle(tool.category);
  const Icon = CATEGORY_ICONS[tool.category] ?? Braces;
  // PDF tools live at nested landing pages (e.g. /tools/pdf/merge-pdf);
  // every other tool keeps its flat /tools/<slug> route.
  const href = tool.seo?.canonicalPath ?? `/tools/${tool.slug}`;
  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      aria-label={`${display.name}: ${display.description}`}
    >
      <Card className="relative h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-indigo-500/10">
        <span
          aria-hidden="true"
          className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", style.gradient)}
        />
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize", style.soft, style.text, style.border)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
              {tool.category}
            </span>
            {tool.popular ? (
              <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                {t("en", "tool.popular")}
              </Badge>
            ) : null}
          </div>
          <div className="mt-3 flex items-start gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", style.gradient, style.glow)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <CardTitle className="mt-1 group-hover:text-[#7C3AED] dark:group-hover:text-[#C4B5FD]">
              {display.name}
            </CardTitle>
          </div>
          <CardDescription className="line-clamp-2">{display.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0066FF] transition-colors group-hover:text-[#7C3AED] dark:text-[#8AB8FF] dark:group-hover:text-[#C4B5FD]">
            {t("en", "tool.openTool")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
