import type { NextConfig } from "next";
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Static shared-hosting build: `output: "export"` writes self-contained
// HTML/CSS/JS to `out/` for upload to `public_html`. No Node server, no DB,
// no API routes. Legacy URL redirects live in `public/.htaccess` (Apache)
// because `redirects()` requires a server and breaks `output: export`.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,
  generateEtags: false,
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
      // Hashed Next.js assets are immutable: cache hard, never revalidate.
      // Must sit BEFORE pages-cache so _next/* never hits the page handler.
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static-cache",
        expiration: {
          maxEntries: 100,
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
      // Same-origin documents only: NetworkFirst (3s timeout → cache
      // fallback) instead of StaleWhileRevalidate. SWR fired a background
      // revalidation on EVERY hit, doubling origin requests after each
      // deploy and tripping shared-hosting 429s. The function form also
      // excludes _next/*, static files, and crawler endpoints so only real
      // page navigations are cached (max 30 shells / 7d).
      urlPattern: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) => {
        if (!sameOrigin) {
          return false;
        }
        const path = url.pathname;
        if (path.startsWith("/_next/")) {
          return false;
        }
        if (
          /\.(?:js|css|map|json|txt|xml|png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?|ttf|pdf|zip)$/i.test(
            path,
          )
        ) {
          return false;
        }
        if (
          path === "/sw.js" ||
          path === "/manifest.json" ||
          path === "/robots.txt" ||
          path === "/sitemap.xml" ||
          path === "/ads.txt" ||
          path === "/app-ads.txt"
        ) {
          return false;
        }
        return true;
      },
      handler: "NetworkFirst",
      method: "GET",
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
});

export default withAnalyzer(pwaConfig(nextConfig));
