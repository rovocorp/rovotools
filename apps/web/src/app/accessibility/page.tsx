import type { Metadata } from "next";
import { BRAND_NAME, SITE_LAST_REVIEWED, SUPPORT_EMAIL, WEB_URL } from "@/shared/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Our commitment to accessible, keyboard-friendly tools for everyone.",
  alternates: { canonical: "/accessibility" },
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
    title: "Accessibility Statement | RovoTools",
    description: "Our commitment to accessible, keyboard-friendly tools for everyone.",
    type: "website",
    url: `${WEB_URL}/accessibility`,
  },
};

export default function AccessibilityPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Accessibility" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Accessibility Statement</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Last reviewed: {SITE_LAST_REVIEWED}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} aims to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.
          We treat accessibility as part of building the site, not an afterthought, and we fix reported
          barriers as a priority.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">What we do</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Semantic HTML with landmarks, headings and labelled form controls.</li>
          <li>Full keyboard navigation, with a visible focus indicator on every interactive element.</li>
          <li>Colour combinations chosen to meet AA contrast in light and dark themes.</li>
          <li>Results and errors announced to screen readers through status messages.</li>
          <li>Respect for reduced-motion preferences and no essential information conveyed by colour alone.</li>
          <li>Layouts that reflow on small screens and remain usable when zoomed to 200%.</li>
        </ul>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Known limitations
        </h2>
        <p>
          Accessibility is an ongoing effort. Third-party advertising content is outside our direct
          control, and a new tool occasionally ships with a minor issue before we catch it in review.
          When we find a problem — or when you report one — we fix it and check the related pages for
          the same mistake.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Feedback</h2>
        <p>
          If you encounter a barrier — an unlabelled control, a contrast issue, a keyboard trap or a
          screen-reader problem — please tell us through the{" "}
          <a href="/contact" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            contact page
          </a>{" "}
          or email {SUPPORT_EMAIL}. Include the page and, if you can, the assistive technology you are
          using so we can reproduce the issue.
        </p>
      </div>
    </div>
  );
}
