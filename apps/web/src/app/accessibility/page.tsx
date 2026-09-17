import type { Metadata } from "next";
import { BRAND_NAME, SUPPORT_EMAIL, WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Accessibility Statement | RovoTools",
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
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} aims to meet WCAG 2.2 AA principles: keyboard navigation throughout, visible
          focus states, semantic HTML, labelled controls, sufficient color contrast, screen-reader
          status messages for results and errors, and full support for reduced-motion preferences.
        </p>
        <p>
          If you encounter an accessibility barrier — an unlabeled control, a contrast issue, or a
          keyboard trap — please tell us via the{" "}
          <a href="/contact" className="underline hover:text-indigo-600 dark:hover:text-indigo-300">
            contact form
          </a>{" "}
          or {SUPPORT_EMAIL} so we can fix it.
        </p>
      </div>
    </div>
  );
}
