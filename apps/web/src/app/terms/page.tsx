import type { Metadata } from "next";
import { BRAND_NAME, COMPANY_NAME, SUPPORT_EMAIL, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: t("en", "seo.termsTitle"),
  description: t("en", "seo.termsDescription"),
  alternates: { canonical: "/terms" },
  openGraph: {
    title: t("en", "seo.termsTitle"),
    description: t("en", "seo.termsDescription"),
    type: "website",
    url: `${WEB_URL}/terms`,
  },
};

export default function TermsPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: t("en", "seo.termsTitle") }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("en", "seo.termsTitle")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("en", "common.lastUpdated")}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} ({COMPANY_NAME}) provides free calculation tools for general information.
          Results are estimates, not professional financial, medical, or legal advice.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Acceptable use
        </h2>
        <p>
          Do not abuse, disrupt, or attempt to compromise the service. Automated scraping that
          degrades availability is prohibited.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Liability
        </h2>
        <p>
          The service is provided “as is”. To the maximum extent permitted by law, {COMPANY_NAME}{" "}
          is not liable for decisions made using these tools.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Contact</h2>
        <p>Questions about these terms: {SUPPORT_EMAIL}.</p>
      </div>
    </div>
  );
}
