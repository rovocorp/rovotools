import type { Metadata } from "next";
import { BRAND_NAME, SUPPORT_EMAIL, WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Security & Privacy | RovoTools",
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
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} is local-first: tools run in your browser whenever technically possible, so
          your files, passwords, tokens and documents never travel over the network. We never log
          tool inputs or uploaded file contents.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Protections</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Secure headers including Content Security Policy, HSTS and frame protection.</li>
          <li>Server-side input validation with strict schemas and rate limits on APIs.</li>
          <li>File type and size validation before any processing.</li>
          <li>No secrets in client-side code; configuration via environment variables.</li>
        </ul>
        <p>
          Found a vulnerability? Please report it responsibly to {SUPPORT_EMAIL}. See our{" "}
          <a href="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Privacy Policy
          </a>{" "}
          for data handling details.
        </p>
      </div>
    </div>
  );
}
