"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Code2,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Type,
  X,
} from "lucide-react";
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
  { label: t("en", "navigation.blog"), href: "/blog" },
];

interface ToolsSubmenuItem {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly icon: typeof LayoutGrid;
  readonly gradient: string;
}

const TOOLS_SUBMENU: ReadonlyArray<ToolsSubmenuItem> = [
  {
    label: "All Tools",
    href: "/tools",
    description: "Browse every free calculator and utility",
    icon: LayoutGrid,
    gradient: "from-[#0066FF] to-[#7C3AED]",
  },
  {
    label: "PDF Tools",
    href: "/tools/category/pdf",
    description: "Create, convert and work with PDFs",
    icon: FileText,
    gradient: "from-[#EF4444] to-[#F97316]",
  },
  {
    label: "Image Tools",
    href: "/tools/category/image",
    description: "Compress, convert, resize and crop",
    icon: ImageIcon,
    gradient: "from-[#8B5CF6] to-[#D946EF]",
  },
  {
    label: "Developer Tools",
    href: "/tools/category/developer",
    description: "JSON, Base64, JWT, regex and UUIDs",
    icon: Code2,
    gradient: "from-[#0EA5E9] to-[#22C55E]",
  },
  {
    label: "Text Tools",
    href: "/tools/category/text",
    description: "Count, convert, clean and generate",
    icon: Type,
    gradient: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    label: "Security Tools",
    href: "/tools/category/security",
    description: "Passwords and hashes, fully local",
    icon: ShieldCheck,
    gradient: "from-[#10B981] to-[#0EA5E9]",
  },
];

function ToolsDropdown({ onNavigate }: { onNavigate?: () => void }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function onPointerDown(event: PointerEvent): void {
      if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = (): void => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const cancelClose = (): void => {
    window.clearTimeout(closeTimer.current);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex items-center gap-1 text-sm font-bold text-slate-600 transition-colors hover:text-[#7C3AED] dark:text-slate-300 dark:hover:text-violet-300"
      >
        {t("en", "navigation.tools")}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-[min(92vw,34rem)] -translate-x-1/2 pt-3 transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0F1E3C]/95 dark:shadow-black/40">
          <div className="h-1 w-full bg-gradient-to-r from-[#0066FF] via-[#7C3AED] to-[#D946EF]" aria-hidden="true" />
          <div className="grid gap-1 p-2 sm:grid-cols-2">
            {TOOLS_SUBMENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover/item:scale-105",
                    item.gradient,
                  )}
                  aria-hidden="true"
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900 group-hover/item:text-[#7C3AED] dark:text-white dark:group-hover/item:text-violet-300">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [toolsOpen, setToolsOpen] = useState(true);

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
          <Link
            href="/"
            className="text-sm font-bold text-slate-600 transition-colors hover:text-[#7C3AED] dark:text-slate-300 dark:hover:text-violet-300"
          >
            {t("en", "navigation.home")}
          </Link>
          <ToolsDropdown />
          {NAV_LINKS.filter((link) => link.href !== "/").map((link) => (
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
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#5B6B82] hover:bg-[#EFF3F9] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:bg-[#1A2B4D] dark:hover:text-[#5C9CFF]"
          >
            {t("en", "navigation.home")}
          </Link>

          <button
            type="button"
            onClick={() => setToolsOpen((value) => !value)}
            aria-expanded={toolsOpen}
            aria-controls="mobile-tools-submenu"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[#5B6B82] hover:bg-[#EFF3F9] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:bg-[#1A2B4D] dark:hover:text-[#5C9CFF]"
          >
            {t("en", "navigation.tools")}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-200", toolsOpen && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          <div id="mobile-tools-submenu" className={cn("space-y-1 pb-1 pl-2", !toolsOpen && "hidden")}>
            {TOOLS_SUBMENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#5B6B82] hover:bg-[#EFF3F9] hover:text-[#0066FF] dark:text-[#93A1B8] dark:hover:bg-[#1A2B4D] dark:hover:text-[#5C9CFF]"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                    item.gradient,
                  )}
                  aria-hidden="true"
                >
                  <item.icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          {NAV_LINKS.filter((link) => link.href !== "/").map((link) => (
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

