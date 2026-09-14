"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolved: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }
  const stored = window.localStorage.getItem("theme");
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [resolved, setResolved] = useState<"light" | "dark">(() => {
    const initial = readStoredTheme();
    return initial === "system" ? getSystemTheme() : initial;
  });

  useEffect(() => {
    applyTheme(resolved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (readStoredTheme() === "system") {
        const next = getSystemTheme();
        setResolved(next);
        applyTheme(next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [resolved]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    const r = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolved(r);
    applyTheme(r);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
