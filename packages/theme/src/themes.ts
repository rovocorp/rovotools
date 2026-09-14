import { DARK_COLORS, LIGHT_COLORS, type ThemeMode, type ThemeTokens } from "./tokens";

export const lightTheme: ThemeTokens = { mode: "light", colors: LIGHT_COLORS };
export const darkTheme: ThemeTokens = { mode: "dark", colors: DARK_COLORS };

export function getTheme(mode: ThemeMode): ThemeTokens {
  return mode === "dark" ? darkTheme : lightTheme;
}

export function resolveThemeMode(preference: ThemeMode | "system", systemDark: boolean): ThemeMode {
  if (preference === "system") {
    return systemDark ? "dark" : "light";
  }
  return preference;
}
