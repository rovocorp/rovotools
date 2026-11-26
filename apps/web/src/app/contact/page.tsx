import type { Metadata } from "next";
import Link from "next/link";
import { WEB_URL, SUPPORT_EMAIL, BRAND_NAME, SITE_LAST_REVIEWED } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the RovoTools team — support, feedback and business enquiries.",
  alternates: { canonical: "/contact" },
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
    title: "Contact Us | RovoTools",
    description: "Contact the RovoTools team — support, feedback and business enquiries.",
    type: "website",
    url: `${WEB_URL}/contact`,
  },
};

export default function ContactPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Contact Us</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Last reviewed: {SITE_LAST_REVIEWED}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} is run by a small team, so email is the fastest way to reach us. We read every
          message and usually reply within a few business days. There is no phone support line.
        </p>

        <div className="mt-6">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("RovoTools enquiry")}`}
            className="inline-flex h-11 items-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Email {SUPPORT_EMAIL}
          </a>
        </div>

        <h2 className="pt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          What to contact us about
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Bug reports</strong> — a tool gives a wrong result, a file fails, or something on
            the page does not work.
          </li>
          <li>
            <strong>Corrections</strong> — an explanation, formula or example is unclear or out of date.
          </li>
          <li>
            <strong>Suggestions</strong> — a task you wish had a tool, or an improvement to one you use.
          </li>
          <li>
            <strong>Accessibility</strong> — a control is hard to use with a keyboard or screen reader.
          </li>
          <li>
            <strong>Business and partnerships</strong> — advertising, licensing or press enquiries.
          </li>
        </ul>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Reporting a bug
        </h2>
        <p>
          To help us reproduce the problem quickly, include the tool name, the inputs you used (for a
          calculation) or the type of file (for a file tool), what you expected, and what happened
          instead. Please do not attach sensitive documents — a description or a small sample file is
          usually enough. Screenshots of the result help too.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Privacy of your message
        </h2>
        <p>
          We use what you send only to reply and to fix the issue. Do not email passwords, private keys
          or personal documents; if a problem involves a sensitive file, describe it instead. Our{" "}
          <Link href="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            Privacy Policy
          </Link>{" "}
          explains how we handle data.
        </p>
      </div>
    </div>
  );
}
