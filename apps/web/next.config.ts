import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  generateEtags: true,
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
      // Same-origin pages (excluding API): fresh when online, cached
      // shell when offline. Bounded to respect storage limits.
      urlPattern: /^https?:\/\/[^/]+\/(?!api\/).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 4,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
