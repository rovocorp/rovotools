"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { t } from "@rovotools/localization";
import { OPEN_SEARCH_EVENT } from "@/components/Header";
import { getCategoryLabel } from "@/lib/category-label";

interface PublicTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  keywords: ReadonlyArray<string>;
  popular: boolean;
  path: string;
}

function fuzzyScore(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (n === "") {
    return 0;
  }
  if (h.includes(n)) {
    return 100 + n.length;
  }
  let score = 0;
  let hi = 0;
  let consecutive = 0;
  for (let ni = 0; ni < n.length; ni += 1) {
    const found = h.indexOf(n[ni] as string, hi);
    if (found === -1) {
      return -1;
    }
    score += found === 0 || h[found - 1] === " " || h[found - 1] === "-" ? 3 : 1;
    consecutive = found === hi ? consecutive + 1 : 0;
    score += consecutive;
    hi = found + 1;
  }
  return score;
}

function rankTools(tools: ReadonlyArray<PublicTool>, query: string): Array<PublicTool> {
  const q = query.trim();
  if (q === "") {
    return [...tools.filter((tool) => tool.popular).slice(0, 6)];
  }
  return tools
    .map((tool) => ({
      tool,
      score: Math.max(
        fuzzyScore(`${tool.name} ${tool.description} ${tool.category} ${tool.keywords.join(" ")}`, q),
        fuzzyScore(tool.slug.replace(/-/g, " "), q),
      ),
    }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, 10)
    .map((item) => item.tool);
}

export default function CommandPalette(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tools, setTools] = useState<ReadonlyArray<PublicTool>>([]);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<ReadonlyArray<string>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openPalette = (): void => {
      try {
        setRecents(JSON.parse(window.localStorage.getItem("rovotools:recents") ?? "[]") as Array<string>);
      } catch {
        setRecents([]);
      }
      setOpen(true);
      setQuery("");
      setActive(0);
    };
    window.addEventListener(OPEN_SEARCH_EVENT, openPalette);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, openPalette);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    inputRef.current?.focus();
    if (tools.length === 0) {
      let cancelled = false;
      fetch("/api/tools?limit=100")
        .then((res) => res.json() as Promise<{ tools: Array<PublicTool> }>)
        .then((data) => {
          if (!cancelled) {
            setTools(data.tools ?? []);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setTools([]);
          }
        });
      return () => {
        cancelled = true;
      };
    }
    return undefined;
  }, [open, tools.length]);

  const results = useMemo(() => rankTools(tools, query), [tools, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter" && results[active] !== undefined) {
        window.location.href = (results[active] as PublicTool).path;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, close]);

  if (!open) {
    return <></>;
  }

  const recentTools = recents
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is PublicTool => tool !== undefined)
    .slice(0, 4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("en", "a11y.searchTools")}
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder={`${t("en", "common.search")} tools… (try "compress pdf", "jwt", "qr")`}
            aria-label={t("en", "a11y.searchTools")}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
          <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400 dark:border-zinc-700">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[40vh] overflow-y-auto p-2" aria-label="Results">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">{t("en", "tool.noResults")}</li>
          ) : (
            results.map((tool, index) => (
              <li key={tool.id}>
                <Link
                  href={tool.path}
                  onClick={close}
                  onMouseEnter={() => setActive(index)}
                  aria-current={index === active ? "true" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    index === active ? "bg-indigo-50 dark:bg-indigo-950/50" : ""
                  }`}
                >
                  <span>
                    <span className="block font-medium text-zinc-900 dark:text-zinc-100">{tool.name}</span>
                    <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">{tool.description}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 dark:bg-zinc-800">
                    {getCategoryLabel(tool.category)}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
        {query.trim() === "" && recentTools.length > 0 ? (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{t("en", "home.recentTitle")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recentTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.path}
                  onClick={close}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
