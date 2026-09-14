import type { Metadata } from "next";
import { BRAND_NAME, WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Disclaimer | RovoTools",
  description: "Limitations of liability and accuracy for RovoTools free online utilities.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
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
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} tools are provided “as is” for general information and everyday tasks. While
          we test our calculation engines, results may contain errors — always verify critical
          figures (financial, health, legal or engineering decisions) with a qualified professional
          or authoritative source.
        </p>
        <p>
          Password, hash and token tools run locally in your browser, but no online guidance can
          guarantee security. Use unique, randomly generated secrets and a reputable password
          manager.
        </p>
        <p>
          QR payloads, converted files and generated code should be checked by scanning or opening
          them before relying on them.
        </p>
      </div>
    </div>
  );
}
