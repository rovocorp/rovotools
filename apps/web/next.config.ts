import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";

const here = path.dirname(fileURLToPath(import.meta.url));

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// next-pwa and the bundle analyzer are webpack plugins. Next 16 builds with
// Turbopack by default (`next build`), which hard-fails when a `webpack` key
// exists in the config — so both wrappers apply ONLY to explicit
// `--webpack` runs. The `build` script below pins `--webpack` deliberately:
// it is load-bearing, not nostalgia. next-pwa (workbox-webpack-plugin) only
// generates public/sw.js under webpack; a Turbopack build silently skips it,
// leaving a stale shell whose precache manifest 404s — breaking offline,
// hanging serviceWorker.ready, and storming the server with failed precache
// fetches (proven by CI: 8 PWA-spec failures + LCP damage). Hostinger just
// runs the build script, so SSR-from-GitHub is unaffected by the flag.
const useWebpack = process.argv.includes("--webpack");
const wrap = useWebpack ? (config: NextConfig): NextConfig => withAnalyzer(pwaConfig(config)) : (config: NextConfig): NextConfig => config;

// Hostinger "Node.js web app" hosting (SSR via `next start`): no static
// export — pages render on the server, data URLs resolve at request time.
// Legacy URL redirects live in `public/.htaccess` for Apache-fronted hosts;
// `redirects()` is intentionally unused so the config stays valid if the
// app is ever exported statically again.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // Hostinger Node.js apps start `{outputDirectory}/standalone/server.js`.
  // Their panel injects `output: "standalone"` by wrapping the next.config.*
  // found at the deploy ROOT directory — but this app deploys from the
  // monorepo root (root directory `./`, output `apps/web/.next`), so their
  // wrapper lands at the repo root and never touches the real `next build`
  // that runs here. Without this field the build produces no standalone
  // server and the domain 403s (Hostinger edge serves its static "resource
  // denied" page). Harmless if their injection ever does apply: they
  // replace any `output` value with the same standalone setting.
  output: "standalone",

  // Pin tracing to THIS package, not the pnpm-workspace root. Without it
  // Next auto-detects the monorepo root and emits
  // `.next/standalone/apps/web/server.js` — Hostinger only looks for
  // `.next/standalone/server.js`, so the process still never starts.
  // apps/web is self-contained (own pnpm-lock.yaml, vendored shared code),
  // so tracing stays complete with this root.
  outputFileTracingRoot: here,

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

export default wrap(nextConfig);
