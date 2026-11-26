import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME, COMPANY_NAME, SITE_LAST_REVIEWED_ISO, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Notable changes to RovoTools: new and improved tools, security updates, accessibility fixes and editorial changes.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    siteName: BRAND_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RovoTools — Free Online Tools for Everyday Work",
      },
    ],
    title: "Changelog | RovoTools",
    description:
      "Notable changes to RovoTools: new and improved tools, security updates, accessibility fixes and editorial changes.",
    type: "website",
    url: `${WEB_URL}/changelog`,
  },
};

interface ChangelogEntry {
  readonly date: string;
  readonly title: string;
  readonly items: ReadonlyArray<string>;
}

const ENTRIES: ReadonlyArray<ChangelogEntry> = [
  {
    date: "26 November 2026",
    title: "Deeper tool guides and expanded articles",
    items: [
      "Added worked examples, common use cases and limitations to every tool page so readers know what a result means and where a tool stops.",
      "Linked tools to relevant blog guides and added cross-links between tool categories.",
      "Expanded every blog article to full length and made the previously hidden articles indexable.",
      "Gave the remaining tools complete hand-written explanations and removed their noindex flags.",
      "Published editorial and changelog pages describing how tools are built, tested and maintained.",
    ],
  },
  {
    date: "25 November 2026",
    title: "Agent and machine-readable improvements",
    items: [
      "Published /llms.txt and a Markdown version of the homepage so AI agents can read the site without parsing HTML.",
      "Added RFC 8288 Link headers and an MCP server card at /.well-known/mcp/server-card.json.",
      "Registered an in-browser WebMCP search tool for compatible agents.",
      "Verified the site with Google Search Console.",
    ],
  },
  {
    date: "25 November 2026",
    title: "Security maintenance",
    items: [
      "Upgraded the framework and dependencies with known advisories, including Next.js 16.4.6 and the validation library.",
      "Re-ran the dependency audit against the targeted modules; no remaining advisories for them.",
    ],
  },
  {
    date: "1 October 2026",
    title: "Better tool explanations and search data",
    items: [
      "Expanded the explanations, how-to steps and FAQs on high-demand tool pages.",
      "Added HowTo and FAQ structured data to pages with hand-written copy.",
      "Published an RSS feed and made sitemap URLs use canonical trailing-slash forms.",
      "Refined robots.txt so crawlers and AI clients see consistent signals.",
    ],
  },
  {
    date: "1 September 2026",
    title: "First public release",
    items: [
      "Launched with PDF, image, developer, text, security, SEO, calculator and finance tools.",
      "Local-first processing: files and inputs are handled in the browser wherever technically possible.",
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "RovoTools Changelog",
  url: `${WEB_URL}/changelog`,
  dateModified: SITE_LAST_REVIEWED_ISO,
  isPartOf: { "@type": "WebSite", name: BRAND_NAME, url: WEB_URL },
  publisher: { "@type": "Organization", name: COMPANY_NAME, url: WEB_URL },
};

export default function ChangelogPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Changelog" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Changelog</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Notable changes to {BRAND_NAME}, newest first. For a deeper look at how tools are built and
        reviewed, see{" "}
        <Link href="/editorial" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
          how we build and maintain our tools
        </Link>
        .
      </p>

      <ol className="mt-8 space-y-8">
        {ENTRIES.map((entry) => (
          <li key={`${entry.date}-${entry.title}`}>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{entry.date}</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{entry.title}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-zinc-600 dark:text-zinc-400">
        Spotted something that should be fixed? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
