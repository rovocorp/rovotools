import type { Metadata } from "next";
import { BRAND_NAME, COMPANY_NAME, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";

const DESCRIPTION = t("en", "seo.siteDescription");

export const metadata: Metadata = {
  metadataBase: new URL(WEB_URL),
  title: {
    default: t("en", "seo.siteTitle"),
    template: `%s | ${BRAND_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND_NAME,
  authors: [{ name: COMPANY_NAME }],
  openGraph: {
    title: t("en", "seo.siteTitle"),
    description: DESCRIPTION,
    type: "website",
    locale: "en",
    url: WEB_URL,
    siteName: BRAND_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Free Online Tools for Everyday Work`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t("en", "seo.siteTitle"),
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
};
