"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, Menu, Moon, Search, Sun, X } from "lucide-react";
import { BRAND_NAME } from "@rovotools/config";
import { t } from "@rovotools/localization";
import { useTheme } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { RovoToolsImageLogo } from "@/components/RovoToolsLogo";
import { cn } from "@/lib/utils";

export const OPEN_SEARCH_EVENT = "rovotools:open-search";

export function openGlobalSearch(): void {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
}

const NAV_LINKS = [
  { label: t("en", "navigation.home"), href: "/" },
  { label: t("en", "navigation.tools"), href: "/tools" },
  { label: t("en", "navigation.categories"), href: "/tools#categories" },
  { label: t("en", "navigation.blog"), href: "/blog" },
];

function ThemeToggle({ id }: { id: string }): React.ReactElement {
  const { setTheme, resolved } = useTheme();
  return (
    <Button
      id={id}
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
      aria-label="Toggle colour theme"
      title={t("en", "a11y.toggleTheme")}
      className="text-[var(--muted)] hover:text-primary dark:text-slate-300 dark:hover:text-blue-400"
    >
      {resolved === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}

export default function Header(): React.ReactElement {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openGlobalSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#0066FF] via-[#7C3AED] to-[#D946EF]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold text-white sm:px-6 lg:px-8">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>All tools run in your browser — your files never leave your device.</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0B132B]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.01]" aria-label={`${BRAND_NAME} home`}>
          <RovoToolsImageLogo height={34} priority />
        </Link>

        <nav aria-label={t("en", "a11y.primaryNav")} className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-600 transition-colors hover:text-[#7C3AED] dark:text-slate-300 dark:hover:text-violet-300"
            >
              {link.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={openGlobalSearch}
            aria-label={`${t("en", "a11y.searchTools")} (Ctrl+K)`}
            title="Search tools (Ctrl+K)"
            className="gap-2 border border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-violet-300"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">{t("en", "common.search")}</span>
            <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold lg:inline dark:border-slate-700 dark:bg-slate-800">
              Ctrl K
            </kbd>
          </Button>
          <ThemeToggle id="theme-toggle-desktop" />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={openGlobalSearch}
            aria-label={`${t("en", "a11y.searchTools")} (Ctrl+K)`}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>
          <ThemeToggle id="theme-toggle-mobile" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? t("en", "a11y.closeMenu") : t("en", "a11y.openMenu")}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={cn("border-t border-[#E1E8F2] dark:border-[#1E2F52] md:hidden", open ? "block" : "hidden")}
      >
        <nav aria-label={t("en", "a11y.mobileNav")} className="space-y-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#5B6B82] hover:bg-[#EFF3F9] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:bg-[#1A2B4D] dark:hover:text-[#5C9CFF]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
    </>
  );
}

