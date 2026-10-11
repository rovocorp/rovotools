"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  resolved: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start from the server-rendered value ("light") so the first client render
  // matches the server HTML; adopt the stored preference in an effect (the
  // beforeInteractive script in layout.tsx already toggles the <html> class
  // pre-hydration, so only the React-owned toggle icon settles after mount).
  // User changes go through setTheme below, which applies the class directly.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Queued as a microtask (same pattern as RecentTools): the beforeInteractive
    // script in layout.tsx already set the <html> class pre-hydration, so this
    // only syncs React state for the toggle icon — no visual work happens here.
    queueMicrotask(() => {
      const stored = readStoredTheme();
      setThemeState(stored);
      applyTheme(stored);
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved: theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
