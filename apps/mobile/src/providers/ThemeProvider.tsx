import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === "dark" ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  void resolved;
}

const THEME_KEY = "rovotools:theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        const initial: Theme = stored === "light" || stored === "dark" ? stored : "system";
        setThemeState(initial);
        const next = initial === "system" ? getSystemTheme() : initial;
        setResolved(next);
        applyTheme(next);
      })
      .catch(() => undefined);
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeState((current) => {
        if (current === "system") {
          const next = colorScheme === "dark" ? "dark" : "light";
          setResolved(next);
          applyTheme(next);
        }
        return current;
      });
    });
    return () => subscription.remove();
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    const next = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolved(next);
    applyTheme(next);
    AsyncStorage.setItem(THEME_KEY, newTheme).catch(() => undefined);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
