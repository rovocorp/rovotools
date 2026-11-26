import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME, COMPANY_NAME, SITE_LAST_REVIEWED, SITE_LAST_REVIEWED_ISO, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "How We Build and Maintain Our Tools",
  description:
    "How RovoTools chooses, builds, tests, reviews and updates every tool, plus our corrections policy and editorial standards.",
  alternates: { canonical: "/editorial" },
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
    title: "How We Build and Maintain Our Tools | RovoTools",
    description:
      "How RovoTools chooses, builds, tests, reviews and updates every tool, plus our corrections policy and editorial standards.",
    type: "website",
    url: `${WEB_URL}/editorial`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "How We Build and Maintain Our Tools",
  url: `${WEB_URL}/editorial`,
  dateModified: SITE_LAST_REVIEWED_ISO,
  isPartOf: { "@type": "WebSite", name: BRAND_NAME, url: WEB_URL },
  publisher: { "@type": "Organization", name: COMPANY_NAME, url: WEB_URL },
};

export default function EditorialPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "How we build tools" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">How We Build and Maintain Our Tools</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Last reviewed: {SITE_LAST_REVIEWED}</p>

      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} publishes free, browser-based tools that solve specific everyday tasks — merging
          a PDF, checking a hash, working out a loan repayment, formatting JSON. This page explains how a
          tool gets from an idea to the page you use, how we check that it is correct, and how we keep it
          up to date. It is the reference we hold ourselves to when deciding what to publish and what to
          change.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">What we publish</h2>
        <p>
          A tool is only added when it performs a clear, useful job that is hard to do accurately by hand.
          We avoid near-duplicate pages: if two tools would do the same thing with the same inputs, we keep
          one and improve it instead of publishing both. Each tool lives in a category (PDF, image,
          developer, text, security, SEO, calculator, finance, and so on) so related tools are easy to find.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          How a tool is built
        </h2>
        <p>Every tool follows the same path before it is published:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong>Define the job.</strong> We write down the inputs, the expected output, the edge cases
            (empty fields, invalid units, very large files) and which platforms it must support.
          </li>
          <li>
            <strong>Implement the calculation once.</strong> Tools share audited calculation engines rather
            than copying maths into each page, so a fix in one place reaches every tool that uses it.
          </li>
          <li>
            <strong>Test it.</strong> Each engine has automated tests with worked examples and known
            reference values, plus manual checks across phone, tablet and desktop.
          </li>
          <li>
            <strong>Write the page.</strong> The page explains what the tool does, who it is for, how to use
            it, a worked example, what the result means, and its limits — written for that tool, not reused
            boilerplate.
          </li>
        </ol>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          How we check accuracy
        </h2>
        <p>
          Calculation tools are checked against published formulas and hand-worked examples. Where a tool
          depends on changing data — for example tax rates — the source date is shown on the page and the
          data is reviewed when it changes. File tools are tested with representative real files, including
          awkward ones (password-protected PDFs, very large images, unusual encodings) to make sure they
          fail clearly rather than silently producing a broken result.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Review and upkeep
        </h2>
        <p>
          We review the most-used tools on a rolling basis and whenever a user reports a problem. Reviews
          cover correctness, clarity of the explanation, mobile behaviour and accessibility. When a page
          changes materially we record it on the{" "}
          <Link href="/changelog" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            changelog
          </Link>
          , and the date shown on editorial and legal pages is updated to match. Pages that are no longer
          useful are improved, consolidated or removed rather than left to go stale.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Corrections
        </h2>
        <p>
          If a tool gives a wrong result, an explanation is unclear, or you spot a page that has fallen out
          of date, please email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            {SUPPORT_EMAIL}
          </a>{" "}
          with the tool name and, where possible, the inputs you used. Corrections to factual errors are
          prioritised over cosmetic changes.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Advertising and independence
        </h2>
        <p>
          The site is free and supported by advertising. Ads never decide which tools we publish, how tools
          are ranked, or what the explanatory copy says, and we do not sell placement or reviews. Advertising
          is kept separate from tool controls so it cannot be mistaken for part of a tool. Read more in our{" "}
          <Link href="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/security" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Security
          </Link>{" "}
          pages.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Ownership</h2>
        <p>
          {BRAND_NAME} is built and maintained by <strong>{COMPANY_NAME}</strong>. You can read more on the{" "}
          <Link href="/about" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            About page
          </Link>{" "}
          or get in touch through{" "}
          <Link href="/contact" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
