import type { Metadata } from "next";
import { BRAND_NAME, SUPPORT_EMAIL, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: t("en", "seo.privacyTitle"),
  description: t("en", "seo.privacyDescription"),
  alternates: { canonical: "/privacy" },
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
    title: t("en", "seo.privacyTitle"),
    description: t("en", "seo.privacyDescription"),
    type: "website",
    url: `${WEB_URL}/privacy`,
  },
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: t("en", "seo.privacyTitle") }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("en", "seo.privacyTitle")}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("en", "common.lastUpdated")}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} is built local-first. Core calculators run entirely in your browser or on
          your device; the values you type into local tools are never sent to our servers.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          What we collect
        </h2>
        <p>
          We collect the minimum needed to operate the service: anonymous, aggregated usage
          counts and any message you voluntarily send to {SUPPORT_EMAIL}. Favorites you save in
          your browser stay in your browser unless you choose to sync them.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Cookies and storage
        </h2>
        <p>
          We use local storage for preferences such as theme, favorites and your cookie choice.
          Anonymous analytics and non-intrusive advertising (Google AdSense) run only after you accept cookies via
          the consent banner, and never see your tool inputs, files or passwords. See our{" "}
          <a href="/cookie-policy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Cookie Policy
          </a>
          .
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Advertising (Google AdSense)
        </h2>
        <p>
          We show non-intrusive ads supplied by Google AdSense to keep the tools free. Third-party
          vendors, including Google, use cookies to serve and measure ads based on your prior visits
          to this and other sites. Google&apos;s use of advertising cookies enables it to serve
          personalized or non-personalized ads depending on your consent choice and region.
        </p>
        <p>
          Learn more in{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-600 dark:hover:text-indigo-300"
          >
            How Google uses information from sites that use its services
          </a>
          . You can control personalized advertising via{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-600 dark:hover:text-indigo-300"
          >
            Google Ads Settings
          </a>{" "}
          and{" "}
          <a
            href="https://www.aboutads.info/choices"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-indigo-600 dark:hover:text-indigo-300"
          >
            aboutads.info/choices
          </a>
          . Ads never receive your tool inputs, uploaded files, passwords, tokens or document
          contents. Our authorized seller account is listed in{" "}
          <a href="/ads.txt" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            ads.txt
          </a>
          .
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Your rights
        </h2>
        <p>
          You can clear locally stored data at any time from your browser or device settings.
          Contact {SUPPORT_EMAIL} for questions about this policy.
        </p>
      </div>
    </div>
  );
}
