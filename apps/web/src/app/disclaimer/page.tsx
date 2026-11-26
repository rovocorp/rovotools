import type { Metadata } from "next";
import { BRAND_NAME, SITE_LAST_REVIEWED, WEB_URL } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Limitations of liability and accuracy for RovoTools free online utilities.",
  alternates: { canonical: "/disclaimer" },
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
    title: "Disclaimer | RovoTools",
    description: "Limitations of liability and accuracy for RovoTools free online utilities.",
    type: "website",
    url: `${WEB_URL}/disclaimer`,
  },
};

export default function DisclaimerPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Disclaimer" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Disclaimer</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Last reviewed: {SITE_LAST_REVIEWED}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} tools are provided “as is” for general information and everyday tasks. While
          we test our calculation engines and explanations, results may contain errors or may not fit
          your specific circumstances. Always verify critical figures before relying on them.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Financial, health and legal topics
        </h2>
        <p>
          Calculators for loans, interest, tax, BMI and similar topics give estimates only. They are
          not financial, medical, legal or tax advice. Rates, thresholds and rules vary by lender,
          country and year, and personal circumstances matter. Consult a qualified professional or an
          authoritative source before making a decision.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Calculations and conversions
        </h2>
        <p>
          Rounding, units and assumptions affect results. Where a tool depends on changing data — such
          as tax rates or exchange rates — the page notes the source and date. Check that the
          assumptions match your situation and re-run the calculation if the underlying data has
          changed.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Security-related tools
        </h2>
        <p>
          Password, hash and token tools run locally in your browser, but no online guidance can
          guarantee security. Use unique, randomly generated secrets and a reputable password manager,
          and do not paste real secrets into a page you do not trust.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Files, QR codes and generated output
        </h2>
        <p>
          Converted files, QR payloads and generated code should be checked by opening or scanning
          them before you rely on them. Keep a copy of the original file until you have confirmed the
          output is correct.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          External links and advertising
        </h2>
        <p>
          The site may link to third-party sites and display advertising. We do not control that
          content and are not responsible for it. See our{" "}
          <a href="/terms" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Terms of Service
          </a>{" "}
          for the full limitations of liability.
        </p>
      </div>
    </div>
  );
}
