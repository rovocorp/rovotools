import type { Metadata } from "next";
import { BRAND_NAME, COMPANY_NAME, WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us | RovoTools",
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
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          <strong>{BRAND_NAME}</strong> is a collection of practical online tools designed to make
          everyday digital tasks faster and easier. The platform brings together utilities for PDFs,
          images, developers, calculators, finance, text, security, conversions and more.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Who it is for
        </h2>
        <p>
          Students, developers, creators, professionals and everyday users — anyone who needs a
          quick calculation, conversion or file task done without installing software or creating
          an account.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Privacy-first approach
        </h2>
        <p>
          Tools run client-side wherever technically possible: your files and inputs are processed
          directly in your browser and never uploaded, logged or stored. Tools that genuinely need
          the network say so on their page. No signup is required and no API key is needed.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          How the tools are built
        </h2>
        <p>
          Every tool shares the same audited calculation engines and works across phone, tablet
          and desktop. We keep adding practical utilities and improving the ones people use most.
        </p>
        <p>
          {BRAND_NAME} is powered by <strong>{COMPANY_NAME}</strong>.
        </p>
      </div>
    </div>
  );
}
