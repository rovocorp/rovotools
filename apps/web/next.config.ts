import type { NextConfig } from "next";
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  generateEtags: true,

  async redirects() {
    return [
      {
        source: "/tools/emi-calculator",
        destination: "/tools/loan-calculator",
        permanent: true,
      },
      {
        source: "/tools/loan-payment-calculator",
        destination: "/tools/loan-calculator",
        permanent: true,
      },
      // Merged duplicates: the old tool was a strict subset of the target,
      // so its URL permanently redirects to the canonical survivor.
      {
        source: "/tools/vat-calculator",
        destination: "/tools/tax-calculator",
        permanent: true,
      },
      {
        source: "/tools/character-counter",
        destination: "/tools/word-counter",
        permanent: true,
      },
      {
        source: "/tools/text-to-pdf",
        destination: "/tools/pdf/pdf-creator",
        permanent: true,
      },
      // Retired empty categories: their sole tools moved elsewhere, so the
      // old section URLs land on the homepage categories anchor — except
      // Unit Converters, which merged into the Calculators hub (now titled
      // "Calculators & Converters") and redirects straight there.
      {
        source: "/tools/category/converter",
        destination: "/tools/category/calculator",
        permanent: true,
      },
      {
        source: "/tools/category/analytics",
        destination: "/#categories",
        permanent: true,
      },
      {
        source: "/tools/category/utility",
        destination: "/#categories",
        permanent: true,
      },
      {
        source: "/tools/category/other",
        destination: "/#categories",
        permanent: true,
      },
      {
        source: "/tools/category/document",
        destination: "/#categories",
        permanent: true,
      },
      // Each high-demand PDF task has its own nested landing page at
      // /tools/pdf/<slug> (see app/tools/pdf/[toolId]). The old flat
      // /tools/<slug> URLs permanently redirect to their canonical
      // nested form so search engines see exactly one URL per tool —
      // there is deliberately no single combined /pdf-tools page.
      {
        source: "/tools/merge-pdf",
        destination: "/tools/pdf/merge-pdf",
        permanent: true,
      },
      {
        source: "/tools/split-pdf",
        destination: "/tools/pdf/split-pdf",
        permanent: true,
      },
      {
        source: "/tools/compress-pdf",
        destination: "/tools/pdf/compress-pdf",
        permanent: true,
      },
      {
        source: "/tools/jpg-to-pdf",
        destination: "/tools/pdf/jpg-to-pdf",
        permanent: true,
      },
      {
        source: "/tools/pdf-to-jpg",
        destination: "/tools/pdf/pdf-to-jpg",
        permanent: true,
      },
      {
        source: "/tools/word-to-pdf",
        destination: "/tools/pdf/word-to-pdf",
        permanent: true,
      },
      {
        source: "/tools/pdf-creator",
        destination: "/tools/pdf/pdf-creator",
        permanent: true,
      },
      {
        source: "/tools/sign-pdf",
        destination: "/tools/pdf/sign-pdf",
        permanent: true,
      },
      {
        source: "/tools/pdf-to-word",
        destination: "/tools/pdf/pdf-to-word",
        permanent: true,
      },
      {
        source: "/tools/pdf-to-excel",
        destination: "/tools/pdf/pdf-to-excel",
        permanent: true,
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: "public",
  // Registration is owned by <PWARegister /> so update handling,
  // install prompts, and offline UX stay in one controlled place.
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Uncached navigations fall back to the precached offline shell.
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      // API traffic is never cached: favorites are device-scoped and
      // tool metadata must never serve stale results.
      urlPattern: /\/api\//i,
      handler: "NetworkOnly",
      options: {
        cacheName: "api-no-cache",
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      // Same-origin pages (excluding API): serve the cached shell instantly
      // while revalidating in the background, so repeat visits and refreshes
      // never wait on the network. Bounded to respect storage limits.
      urlPattern: /^https?:\/\/[^/]+\/(?!api\/).*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
});

export default withAnalyzer(pwaConfig(nextConfig));
