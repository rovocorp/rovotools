import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { WEB_URL } from "@rovotools/config";

export interface Crumb {
  readonly label: string;
  readonly href?: string;
}

export function breadcrumbJsonLd(crumbs: ReadonlyArray<Crumb>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href === undefined ? {} : { item: `${WEB_URL}${crumb.href}` }),
    })),
  };
}

export default function Breadcrumbs({ crumbs }: { crumbs: ReadonlyArray<Crumb> }): React.ReactElement {
  const jsonLd = breadcrumbJsonLd(crumbs);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                ) : null}
                {crumb.href === undefined || isLast ? (
                  <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-zinc-800 dark:text-zinc-200" : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-indigo-600 hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
