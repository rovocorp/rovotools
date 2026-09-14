import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND_NAME, COMPANY_NAME, WEB_URL } from "@rovotools/config";
import { t } from "@rovotools/localization";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CommandPalette from "@/components/CommandPalette";
import CookieBanner from "@/components/CookieBanner";
import PWARegister from "@/components/PWARegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import PwaUpdatePrompt from "@/components/pwa/PwaUpdatePrompt";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/app/providers";
import { metadata as baseMetadata } from "./metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = baseMetadata;

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY_NAME,
  url: WEB_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme")||"system";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.classList.toggle("dark",r==="dark");}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t("en", "a11y.skipToContent")}
        </a>
        <ThemeProvider>
          <QueryProvider>
            <PWARegister />
            <Header />
            <CommandPalette />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <PwaUpdatePrompt />
            <InstallPrompt />
          </QueryProvider>
        </ThemeProvider>
        <span className="sr-only">{BRAND_NAME}</span>
      </body>
    </html>
  );
}
