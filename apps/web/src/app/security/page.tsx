import type { Metadata } from "next";
import { BRAND_NAME, SITE_LAST_REVIEWED, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description: "How RovoTools protects you: local-first processing, secure headers and safe file handling.",
  alternates: { canonical: "/security" },
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
    title: "Security & Privacy | RovoTools",
    description: "How RovoTools protects you: local-first processing, secure headers and safe file handling.",
    type: "website",
    url: `${WEB_URL}/security`,
  },
};

export default function SecurityPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Security" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Security &amp; Privacy</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Last reviewed: {SITE_LAST_REVIEWED}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} is local-first: tools run in your browser whenever technically possible, so
          your files, passwords, tokens and documents never travel over the network. We do not log
          tool inputs or uploaded file contents.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          What we do not collect
        </h2>
        <p>
          For local tools, the content you enter or upload stays in your browser and is discarded when
          you close the tab. We do not store your files, passwords or tokens on our servers, and we do
          not build profiles from tool inputs. Tools that need the network say so on the page before
          you use them.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Protections</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Secure headers including Content Security Policy, HSTS and frame protection.</li>
          <li>Server-side input validation with strict schemas and rate limits on APIs.</li>
          <li>File type and size validation before any processing.</li>
          <li>No secrets in client-side code; configuration via environment variables.</li>
          <li>Dependencies reviewed and upgraded when security advisories are published.</li>
        </ul>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Reporting a vulnerability
        </h2>
        <p>
          If you believe you have found a security issue, please report it responsibly to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            {SUPPORT_EMAIL}
          </a>{" "}
          with enough detail to reproduce it. Please do not access other users’ data, disrupt the
          service, or disclose the issue publicly before we have had a chance to fix it. We will
          acknowledge your report and keep you updated on the fix.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Third-party services
        </h2>
        <p>
          The site uses third-party services for advertising, analytics and, where noted, live data
          such as currency rates. These are described in our{" "}
          <a href="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Privacy Policy
          </a>
          . We limit what is shared with them to what each service needs to work.
        </p>
      </div>
    </div>
  );
}
