import type { Metadata } from "next";
import { BRAND_NAME, COMPANY_NAME, SITE_LAST_REVIEWED, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import { t } from "@/shared/localization";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: t("en", "seo.termsTitle"),
  description: t("en", "seo.termsDescription"),
  alternates: { canonical: "/terms" },
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
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Last updated: {SITE_LAST_REVIEWED}
      </p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          These terms govern your use of {BRAND_NAME}, operated by {COMPANY_NAME} (“we”, “us”). By
          using the site you agree to them. If you do not agree, please do not use the site.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">The service</h2>
        <p>
          {BRAND_NAME} provides free online tools and explanatory content for general information and
          everyday tasks. The service is offered as-is and may change: tools can be added, improved,
          moved or retired, and the site may be unavailable at times for maintenance.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>use the site for unlawful purposes or to process content you have no right to use;</li>
          <li>attempt to disrupt, overload or gain unauthorised access to the service;</li>
          <li>run automated scraping that degrades availability for other users;</li>
          <li>misrepresent the site or its output as your own professional advice.</li>
        </ul>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Intellectual property
        </h2>
        <p>
          The site’s design, text and code are owned by {COMPANY_NAME} or its licensors and are
          protected by applicable law. You may use the tools and read the content for personal or
          internal business purposes. You may not republish substantial portions of the site’s content
          without permission. Output you generate from your own inputs is yours to use.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Third-party content and advertising
        </h2>
        <p>
          The site is supported by advertising and may link to third-party sites or services. We do not
          control and are not responsible for third-party content, and a link is not an endorsement.
          Advertising is kept separate from tool controls.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          No professional advice
        </h2>
        <p>
          Results are estimates for general information. They are not financial, medical, legal,
          tax or engineering advice. Always verify important figures with a qualified professional or
          an authoritative source before acting on them.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Disclaimer of warranties
        </h2>
        <p>
          The service is provided “as is” and “as available”, without warranties of any kind, whether
          express or implied, including fitness for a particular purpose and accuracy. We work to keep
          tools correct but do not warrant that they are error-free or uninterrupted.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Limitation of liability
        </h2>
        <p>
          To the maximum extent permitted by law, {COMPANY_NAME} is not liable for any indirect or
          consequential loss, or for decisions made using these tools. Nothing in these terms limits
          liability that cannot be limited by law.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Changes</h2>
        <p>
          We may update these terms as the service evolves. Material changes will be reflected in the
          date above and, where appropriate, on the{" "}
          <a href="/changelog" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            changelog
          </a>
          . Continued use after a change means you accept the updated terms.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Contact</h2>
        <p>Questions about these terms: {SUPPORT_EMAIL}.</p>
      </div>
    </div>
  );
}
