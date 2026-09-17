import type { Metadata } from "next";
import { BRAND_NAME, WEB_URL } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cookie Policy | RovoTools",
  description: "How RovoTools uses cookies and local storage, and how to control your choice.",
  alternates: { canonical: "/cookie-policy" },
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
    title: "Cookie Policy | RovoTools",
    description: "How RovoTools uses cookies and local storage, and how to control your choice.",
    type: "website",
    url: `${WEB_URL}/cookie-policy`,
  },
};

export default function CookiePolicyPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Cookie Policy</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {BRAND_NAME} keeps tracking to a minimum. Essential functionality — theme preference,
          favourites, recently used tools and offline support — uses your browser&apos;s local
          storage and does not require consent.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Optional cookies</h2>
        <p>
          Anonymous analytics and advertising partners only load after you press “Accept” on the
          consent banner. You can change your mind at any time by clearing this site&apos;s data in
          your browser settings; the banner will appear again.
        </p>
        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">What we never do</h2>
        <p>
          We never store your tool inputs, uploaded files, passwords, tokens or document contents in
          cookies or analytics, regardless of your choice.
        </p>
      </div>
    </div>
  );
}
