import type { Metadata } from "next";
import { WEB_URL, SUPPORT_EMAIL, BRAND_NAME } from "@rovotools/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | RovoTools",
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
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Questions, bug reports or suggestions? Send us a message — or email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
