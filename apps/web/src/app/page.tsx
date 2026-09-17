import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Check,
  Copy,
  FileJson,
  Gift,
  KeyRound,
  Lock,
  Palette,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import { t } from "@rovotools/localization";
import type { ToolRegistryEntry } from "@rovotools/types";
import ToolCard from "@/components/tools/ToolCard";
import CategoryNav from "@/components/tools/CategoryNav";
import RecentTools from "@/components/RecentTools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getToolRegistry } from "@/lib/registry";
import { getCategoryStyle } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { WEB_URL, BRAND_NAME } from "@rovotools/config";
import HeroNetwork from "@/components/hero/HeroNetwork";

export const metadata: Metadata = {
  // Brand suffix is explicit: the root layout template does not apply to a
  // page-level string title in this setup (verified in production HTML).
  title: "Free Online Tools for PDFs, Images, Developers & More | RovoTools",
  description:
    "Free online tools for PDFs, images, developers, calculators, finance, text, security and more. Fast, simple and browser-friendly tools for everyday digital tasks.",
  alternates: { canonical: "/" },
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
    title: "Free Online Tools for PDFs, Images, Developers & More | RovoTools",
    description:
      "Free online tools for PDFs, images, developers, calculators, finance, text, security and more. Fast, simple and browser-friendly tools for everyday digital tasks.",
    type: "website",
    url: WEB_URL,
  },
};

const WHY = [
  {
    icon: Zap,
    titleKey: "home.whyFastTitle",
    bodyKey: "home.whyFastBody",
    gradient: "from-amber-500 to-orange-600",
    soft: "bg-amber-50 dark:bg-amber-950/50",
    glow: "shadow-amber-500/25",
  },
  {
    icon: Lock,
    titleKey: "home.whyPrivateTitle",
    bodyKey: "home.whyPrivateBody",
    gradient: "from-emerald-500 to-teal-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/50",
    glow: "shadow-emerald-500/25",
  },
  {
    icon: Gift,
    titleKey: "home.whyFreeTitle",
    bodyKey: "home.whyFreeBody",
    gradient: "from-fuchsia-500 to-pink-600",
    soft: "bg-fuchsia-50 dark:bg-fuchsia-950/50",
    glow: "shadow-fuchsia-500/25",
  },
  {
    icon: Sparkles,
    titleKey: "home.whySimpleTitle",
    bodyKey: "home.whySimpleBody",
    gradient: "from-indigo-600 to-violet-600",
    soft: "bg-indigo-50 dark:bg-indigo-950/50",
    glow: "shadow-indigo-500/25",
  },
] as const;

const FAQS = ["1", "2", "3"] as const;

const QUICK_LINKS = [  { icon: Braces, label: "JSON Formatter", href: "/tools/json-formatter", category: "developer" },
  { icon: Lock, label: "Base64 Encoder", href: "/tools/base64-encoder", category: "developer" },
  { icon: KeyRound, label: "JWT Decoder", href: "/tools/jwt-decoder", category: "developer" },
  { icon: ShieldCheck, label: "Password Generator", href: "/tools/password-generator", category: "security" },
  { icon: QrCode, label: "QR Generator", href: "/tools/url-qr-generator", category: "qr" },
] as const;

function renderHeroTitle(title: string): React.ReactNode {
  const marker = "for Everyday Work";
  if (title.includes(marker)) {
    const [before] = title.split(marker);
    return (
      <>
        {before}for{" "}
        <span className="text-hero-gradient">Everyday&nbsp;Work</span>
      </>
    );
  }
  const words = title.split(" ");
  if (words.length > 3) {
    const head = words.slice(0, -3).join(" ");
    const tail = words.slice(-3).join(" ");
    return (
      <>
        {head} <span className="text-hero-gradient">{tail}</span>
      </>
    );
  }
  return title;
}

export default function Home(): React.ReactElement {
  const registry = getToolRegistry();
  const featured = registry.featured(6);
  // Curated high-intent tools for the "Popular Online Tools" section.
  // Every id is resolved against the registry so only real tools render.
  const POPULAR_TOOL_IDS = [
    "image-compressor",
    "image-resizer",
    "text-to-pdf",
    "json-formatter",
    "base64-encoder",
    "password-generator",
    "bmi-calculator",
    "loan-calculator",
  ] as const;
  const popular = POPULAR_TOOL_IDS.map((id) => registry.get(id)).filter(
    (entry): entry is ToolRegistryEntry => entry !== undefined,
  );
  const facets = registry.categories();
  const totalTools = facets.reduce((sum, facet) => sum + facet.count, 0);
  const heroTitle = t("en", "home.heroTitle");

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((n) => ({
              "@type": "Question",
              name: t("en", `faq.q${n}` as "faq.q1"),
              acceptedAnswer: {
                "@type": "Answer",
                text: t("en", `faq.a${n}` as "faq.a1"),
              },
            })),
          }),
        }}
      />

      {/* ============ MODERN HERO ============ */}
      <section className="hero-mesh relative overflow-hidden border-b border-indigo-100/70 dark:border-white/10">
        <div aria-hidden="true" className="hero-grid absolute inset-0" />
        <HeroNetwork />
        {/* soft orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-600/25" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/15" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-96 rounded-full bg-amber-300/25 blur-3xl dark:bg-fuchsia-600/10" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:pb-20">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 py-1.5 pl-2 pr-4 text-xs font-bold shadow-lg shadow-indigo-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0066FF] via-[#7C3AED] to-[#D946EF] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                New
              </span>
              <span className="text-slate-700 dark:text-slate-200">
                🛡️ {t("en", "home.heroBadge")} · {totalTools}+ free tools
              </span>
            </div>

            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.6rem]">
              {renderHeroTitle(heroTitle)}
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              {t("en", "home.heroSubtitle")}
            </p>

            {/* Hero search */}
            <p className="mt-7 text-sm font-bold text-slate-700 dark:text-slate-200">
              What do you need to do?
            </p>
            <form
              action="/tools"
              method="get"
              role="search"
              className="mt-2 flex max-w-xl items-center gap-2 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-xl shadow-indigo-500/15 backdrop-blur-xl transition-shadow focus-within:shadow-indigo-500/25 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/40"
            >
              <Search className="ml-2 h-5 w-5 shrink-0 text-indigo-500 dark:text-indigo-300" aria-hidden="true" />
              <label htmlFor="hero-search" className="sr-only">
                Search tools
              </label>
              <input
                id="hero-search"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="Try “compress image”, “format JSON” or “calculate BMI”…"
                className="h-11 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0066FF] via-[#7C3AED] to-[#D946EF] px-5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                Search
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="border-0 bg-gradient-to-r from-[#0066FF] via-[#7C3AED] to-[#D946EF] font-bold text-white shadow-xl shadow-indigo-500/30 transition-transform hover:scale-[1.02]"
                asChild
              >
                <Link href="/tools">
                  {t("en", "home.browseTools")}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-200 bg-white/70 font-bold text-slate-700 backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                asChild
              >
                <Link href="/tools#popular">{t("en", "home.readGuides")}</Link>
              </Button>
            </div>

            {/* Stats */}
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: `${totalTools}+`, label: "Free tools", gradient: "from-blue-600 to-indigo-600" },
                { value: "100%", label: "Private", gradient: "from-emerald-500 to-teal-600" },
                { value: "0", label: "Sign-ups", gradient: "from-fuchsia-500 to-pink-600" },
                { value: "Offline", label: "Ready", gradient: "from-amber-500 to-orange-600" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >
                  <dt className="order-2 mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </dt>
                  <dd className={cn("bg-gradient-to-r bg-clip-text text-xl font-black text-transparent", stat.gradient)}>
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <nav aria-label="Popular right now" className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Popular right now:
              </span>
              {QUICK_LINKS.map((link) => {
                const style = getCategoryStyle(link.category);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition-all hover:-translate-y-px hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white", style.gradient)}>
                      <link.icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right visual bento */}
          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-amber-400/15 blur-2xl" />
            {/* Main mock window */}
            <div className="glass-card relative rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-indigo-500/20 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/50">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 dark:border-white/10">
                <span className="h-3 w-3 rounded-full bg-rose-400" aria-hidden="true" />
                <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="ml-3 hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 sm:inline-flex dark:bg-white/5 dark:text-slate-400">
                  <Lock className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  rovotools.com/tools/json-formatter
                </span>
                <Badge className="ml-auto border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-bold text-white">
                  <Wifi className="mr-1 h-3 w-3" aria-hidden="true" /> in-browser
                </Badge>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30">
                    <FileJson className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">JSON Formatter</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Validate · Format · Minify — instantly</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Check className="h-3 w-3" aria-hidden="true" /> Valid
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-950 p-4 font-mono text-[12px] leading-relaxed dark:border-white/10">
                  <p><span className="text-fuchsia-400">{"{"}</span></p>
                  <p className="pl-4"><span className="text-sky-300">{'"name"'}</span><span className="text-slate-400">:</span> <span className="text-emerald-300">{'"rovotools"'}</span><span className="text-slate-400">,</span></p>
                  <p className="pl-4"><span className="text-sky-300">{'"private"'}</span><span className="text-slate-400">:</span> <span className="text-amber-300">true</span><span className="text-slate-400">,</span></p>
                  <p className="pl-4"><span className="text-sky-300">{'"tools"'}</span><span className="text-slate-400">:</span> <span className="text-amber-300">{totalTools}+</span></p>
                  <p><span className="text-fuchsia-400">{"}"}</span></p>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#7C3AED] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25">
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy formatted
                  </span>
                  <span className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
                    Minify
                  </span>
                </div>
              </div>
            </div>

            {/* Floating card: password */}
            <div
              className="hero-float-card glass-card absolute -right-3 -top-8 w-52 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl shadow-emerald-500/15 backdrop-blur-xl sm:-right-6 dark:border-white/10 dark:bg-slate-900/90"
              style={{ "--float-rotate": "2deg", animationDelay: "0.6s" } as React.CSSProperties}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Password Gen</p>
              </div>
              <p className="mt-2 truncate rounded-lg bg-slate-100 px-2 py-1.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200">
                Tr7$kQ!9mZ#2x
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
              </div>
              <p className="mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Very strong</p>
            </div>

            {/* Floating card: QR */}
            <div
              className="hero-float-card glass-card absolute -bottom-8 -left-3 w-56 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl shadow-violet-500/15 backdrop-blur-xl sm:-left-8 dark:border-white/10 dark:bg-slate-900/90"
              style={{ "--float-rotate": "-2deg", animationDelay: "1.4s" } as React.CSSProperties}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                  <QrCode className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">QR Generator</p>
                <ShieldCheck className="ml-auto h-4 w-4 text-emerald-500" aria-hidden="true" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
                {["bg-slate-900 dark:bg-white", "bg-violet-500", "bg-slate-900 dark:bg-white", "bg-slate-200 dark:bg-white/20", "bg-fuchsia-500", "bg-slate-900 dark:bg-white", "bg-slate-200 dark:bg-white/20", "bg-slate-900 dark:bg-white", "bg-slate-900 dark:bg-white", "bg-slate-200 dark:bg-white/20", "bg-cyan-400", "bg-slate-900 dark:bg-white", "bg-slate-200 dark:bg-white/20", "bg-slate-900 dark:bg-white", "bg-slate-900 dark:bg-white", "bg-violet-500"].map((cls, i) => (
                  <span key={i} className={cn("h-5 rounded-[4px]", cls)} />
                ))}
              </div>
              <p className="mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">Scan-ready · offline</p>
            </div>

            {/* Floating pill */}
            <div
              className="hero-float-card absolute -top-5 left-6 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-slate-700 shadow-lg backdrop-blur-xl sm:left-2 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-200"
              style={{ "--float-rotate": "-1deg", animationDelay: "2.1s" } as React.CSSProperties}
            >
              <Palette className="h-3.5 w-3.5 text-fuchsia-500" aria-hidden="true" />
              {facets.length} tool categories
            </div>
          </div>
        </div>

        {/* Category marquee */}
        <div className="relative border-t border-indigo-100/60 bg-white/60 py-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
          <div className="marquee-mask overflow-hidden">
            <div className="animate-rovo-marquee flex w-max items-center gap-3 pr-3">
              {[...facets, ...facets].map((facet, index) => {
                const style = getCategoryStyle(facet.category);
                return (
                  <Link
                    key={`${facet.category}-${index}`}
                    href={`/tools/category/${facet.category}`}
                    tabIndex={index >= facets.length ? -1 : undefined}
                    aria-hidden={index >= facets.length}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold capitalize text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    <span className={cn("h-2 w-2 rounded-full", style.dot)} aria-hidden="true" />
                    {facet.category}
                    <span className="text-slate-500 dark:text-slate-400">{facet.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED ============ */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Hand-picked
            </p>
            <h2 id="featured-heading" className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t("en", "home.featuredTitle")} <span className="text-hero-gradient">essentials</span>
            </h2>
            <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">{t("en", "home.featuredSubtitle")}</p>
          </div>
          <Link href="/tools" className="group inline-flex items-center gap-1 text-sm font-bold text-[#7C3AED] hover:underline dark:text-violet-300">
            {t("en", "common.viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((entry) => (
            <ToolCard key={entry.definition.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section id="categories" aria-labelledby="categories-heading" className="relative overflow-hidden border-y border-indigo-100/70 bg-gradient-to-br from-indigo-50/80 via-fuchsia-50/60 to-amber-50/70 py-14 dark:border-white/10 dark:from-indigo-950/40 dark:via-[#09090B] dark:to-fuchsia-950/20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-fuchsia-600 shadow-sm dark:bg-white/5 dark:text-fuchsia-300">
            <Palette className="h-3.5 w-3.5" aria-hidden="true" /> {facets.length} categories
          </p>
          <h2 id="categories-heading" className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t("en", "home.categoriesTitle")} <span className="text-brand-gradient">for everything</span>
          </h2>
          <div className="mt-6 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-xl shadow-indigo-500/10 backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-slate-900/60">
            <CategoryNav facets={facets} />
          </div>
        </div>
      </section>

      {/* ============ POPULAR ============ */}
      <section id="popular" aria-labelledby="popular-heading" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Most used
            </p>
            <h2 id="popular-heading" className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t("en", "home.popularTitle")}
            </h2>
            <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">{t("en", "home.popularSubtitle")}</p>
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((entry) => (
            <ToolCard key={entry.definition.id} entry={entry} />
          ))}
        </div>
      </section>

      <RecentTools />

      {/* ============ WHY ============ */}
      <section aria-labelledby="why-heading" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 id="why-heading" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t("en", "home.whyTitle")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
            <div
              key={item.titleKey}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70"
            >
              <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", item.gradient)} />
              <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110", item.gradient, item.glow)}>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-extrabold text-slate-900 dark:text-white">{t("en", item.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t("en", item.bodyKey)}</p>
              <span aria-hidden="true" className={cn("pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25 bg-gradient-to-br", item.gradient)} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ FAQ + CTA ============ */}
      <section aria-labelledby="faq-heading" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t("en", "faq.title")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {FAQS.map((n, index) => {
            const accents = [
              "from-blue-600 to-indigo-600",
              "from-fuchsia-500 to-pink-600",
              "from-emerald-500 to-teal-600",
            ] as const;
            return (
              <div
                key={n}
                className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
              >
                <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accents[index % accents.length])} />
                <h3 className="font-extrabold text-slate-900 dark:text-white">{t("en", `faq.q${n}` as "faq.q1")}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t("en", `faq.a${n}` as "faq.a1")}</p>
              </div>
            );
          })}
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0066FF] via-[#7C3AED] to-[#D946EF] p-8 shadow-2xl shadow-indigo-500/30 sm:p-12">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
          <div aria-hidden="true" className="hero-dots absolute inset-0 opacity-20" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Private by design
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                {totalTools}+ tools. Zero sign-up. Zero uploads.
              </h2>
              <p className="mt-2 font-medium text-white/85">
                Convert, compress, generate and calculate — everything runs in your browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools"
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-extrabold text-slate-900 shadow-xl transition-transform hover:scale-[1.03]"
              >
                Start exploring
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex h-12 items-center rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Read guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
