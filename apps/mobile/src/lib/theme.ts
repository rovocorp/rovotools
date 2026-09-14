import { getTheme } from "@rovotools/theme";
import type { AppPalette } from "./palette";

export type { AppPalette } from "./palette";
export { darkTheme, getTheme, lightTheme } from "@rovotools/theme";

export function getPalette(resolved: "light" | "dark"): AppPalette {
  const theme = getTheme(resolved);
  return {
    background: theme.colors.background,
    surface: theme.colors.surface,
    surfaceAlt: theme.colors.surfaceAlt,
    text: theme.colors.foreground,
    muted: theme.colors.mutedForeground,
    border: theme.colors.border,
    primary: theme.colors.primary,
    onPrimary: theme.colors.primaryForeground,
    success: theme.colors.success,
    danger: theme.colors.destructive,
  };
}
