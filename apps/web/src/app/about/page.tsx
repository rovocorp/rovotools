import type { Metadata } from "next";
import { BRAND_NAME, COMPANY_NAME, WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us | RovoTools",
  description: "Learn about RovoTools — free online tools for everyday work, built by RovoCorp LTD.",
  alternates: { canonical: "/about" },
  openGraph: {
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
          <strong>{BRAND_NAME}</strong> is a collection of free online tools for everyday work —
          PDF utilities, image helpers, developer tools, text tools, security tools, design aids,
          calculators and more.
        </p>
        <p>
          {BRAND_NAME} is built and operated by <strong>{COMPANY_NAME}</strong>. Our principles are
          simple: tools should be fast, free, private and simple. No signup is required, no API key
          is needed, and your files and data are processed directly in your browser whenever
          technically possible.
        </p>
        <p>
          Every tool runs client-side where practical, works across phone, tablet and desktop, and
          respects your privacy by design.
        </p>
      </div>
    </div>
  );
}
