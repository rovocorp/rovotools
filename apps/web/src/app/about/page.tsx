import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME, COMPANY_NAME, SITE_LAST_REVIEWED, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about RovoTools — free online tools for everyday work, built by RovoCorp LTD.",
  alternates: { canonical: "/about" },
  openGraph: {
    siteName: BRAND_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RovoTools \u2014 Free Online Tools for Everyday Work",
      },
    ],
    title: "About Us | RovoTools",
    description: "Learn about RovoTools — free online tools for everyday work, built by RovoCorp LTD.",
    type: "website",
    url: `${WEB_URL}/about`,
  },
};

export default function AboutPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">About Us</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Last reviewed: {SITE_LAST_REVIEWED}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          <strong>{BRAND_NAME}</strong> is a free collection of practical online tools for everyday
          digital tasks. Instead of installing an app or handing your file to a service you do not
          know, you open a page, get the job done, and close the tab. The catalogue covers PDFs,
          images, developer utilities, text, security, SEO, calculators and finance, and every tool
          page explains what it does and how to use it.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Who it is for</h2>
        <p>
          Students checking a calculation, developers formatting a payload, creators preparing a file
          for upload, and anyone who needs a quick conversion without creating an account. Tools are
          designed to work on a phone as well as a desktop, and they are free to use without a sign-up
          or API key.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Privacy-first by default
        </h2>
        <p>
          Tools run in your browser wherever technically possible: files and inputs are processed on
          your device and are not uploaded, logged or stored. When a task genuinely needs the network
          — for example, fetching a public resource or converting between currencies at live rates —
          the tool page says so and only the data required for that step leaves your device. You can
          read the details on our{" "}
          <Link href="/security" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Security
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Privacy
          </Link>{" "}
          pages.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          How the tools are built and checked
        </h2>
        <p>
          Tools share audited calculation engines rather than reimplementing the same maths on every
          page, so a correction reaches every tool that relies on it. Each engine is covered by
          automated tests with worked examples, and tools are checked on phone, tablet and desktop. A
          tool is published with a plain-language explanation, a how-to, a worked example and its
          limitations — not just a form. You can read the full process on{" "}
          <Link href="/editorial" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            how we build and maintain our tools
          </Link>
          .
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Keeping pages current
        </h2>
        <p>
          We review the most-used tools on a rolling basis and whenever a problem is reported, and we
          update the copy, data and examples when something changes. Material changes are recorded on
          the{" "}
          <Link href="/changelog" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            changelog
          </Link>
          . Tools that stop being useful are improved or retired rather than left to go stale.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Independence and advertising
        </h2>
        <p>
          The site is free and supported by advertising. Ads do not influence which tools we publish,
          how they are ranked, or what the explanatory copy says, and we do not sell placement or
          reviews. Advertising is kept separate from tool controls so it is never mistaken for part
          of a tool.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Who we are</h2>
        <p>
          {BRAND_NAME} is built and maintained by <strong>{COMPANY_NAME}</strong>. Questions, bug
          reports, corrections and partnership enquiries are welcome at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            {SUPPORT_EMAIL}
          </a>{" "}
          or through the{" "}
          <Link href="/contact" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
