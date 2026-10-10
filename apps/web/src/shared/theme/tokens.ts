export type ThemeMode = "light" | "dark";

export const BRAND_PRIMARY = "#0066FF";
export const BRAND_PRIMARY_HOVER = "#004ECC";
export const BRAND_PRIMARY_DARK = "#3385FF";
export const BRAND_PRIMARY_DARK_HOVER = "#5C9CFF";
export const BRAND_VIOLET = "#7C3AED";
export const BRAND_FUCHSIA = "#D946EF";
export const BRAND_CYAN = "#00A76F";
export const BRAND_CYAN_BRIGHT = "#00E676";
export const BRAND_SKY = "#00D2FF";
export const BRAND_ORANGE = "#F44336";
export const BRAND_AMBER = "#F59E0B";
export const BRAND_GOLD = "#FFB300";
export const BRAND_EMERALD = "#10B981";
export const BRAND_ROSE = "#F43F5E";
export const BRAND_NAVY = "#0A1A33";
export const BRAND_NAVY_DEEP = "#070F22";

/** Signature brand gradient — blue → cyan → emerald → amber → red (from logo "Tools"). */
export const BRAND_GRADIENT =
  "linear-gradient(90deg, #0066FF 0%, #00D2FF 28%, #00E676 48%, #FFB300 74%, #F44336 100%)";

/** Modern hero gradient — indigo → violet → fuchsia → amber. Used for headlines & CTAs. */
export const HERO_GRADIENT =
  "linear-gradient(100deg, #0066FF 0%, #7C3AED 38%, #D946EF 68%, #FB923C 100%)";

/** Soft mesh stops for light-mode hero washes. */
export const MESH_LIGHT = {
  violet: "#DDD6FE",
  sky: "#BAE6FD",
  emerald: "#A7F3D0",
  amber: "#FDE68A",
  rose: "#FECDD3",
} as const;

/** Glowing mesh stops for dark-mode hero. */
export const MESH_DARK = {
  indigo: "#312E81",
  violet: "#6D28D9",
  fuchsia: "#A21CAF",
  cyan: "#0E7490",
} as const;

export const NEUTRAL = {
  white: "#ffffff",
  zinc50: "#fafafa",
  zinc100: "#f8fafc",
  zinc200: "#e2e8f0",
  zinc300: "#cbd5e1",
  zinc400: "#94a3b8",
  zinc500: "#64748b",
  zinc600: "#475569",
  zinc700: "#334155",
  zinc800: "#1e293b",
  zinc900: "#0f172a",
  zinc950: "#0b132b",
  black: "#000000",
} as const;

export const FONT_FAMILY = {
  sans: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
} as const;

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const LINE_HEIGHT = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export interface ElevationLevel {
  readonly web: string;
  readonly android: number;
  readonly iosShadowOpacity: number;
  readonly iosShadowRadius: number;
  readonly iosShadowOffsetY: number;
}

export const ELEVATION: Record<0 | 1 | 2 | 3 | 4, ElevationLevel> = {
  0: { web: "none", android: 0, iosShadowOpacity: 0, iosShadowRadius: 0, iosShadowOffsetY: 0 },
  1: {
    web: "0 1px 2px rgb(0 0 0 / 0.06)",
    android: 1,
    iosShadowOpacity: 0.06,
    iosShadowRadius: 2,
    iosShadowOffsetY: 1,
  },
  2: {
    web: "0 2px 6px rgb(0 0 0 / 0.08)",
    android: 2,
    iosShadowOpacity: 0.08,
    iosShadowRadius: 4,
    iosShadowOffsetY: 2,
  },
  3: {
    web: "0 8px 24px rgb(0 0 0 / 0.12)",
    android: 4,
    iosShadowOpacity: 0.12,
    iosShadowRadius: 10,
    iosShadowOffsetY: 4,
  },
  4: {
    web: "0 16px 48px rgb(0 0 0 / 0.18)",
    android: 8,
    iosShadowOpacity: 0.18,
    iosShadowRadius: 16,
    iosShadowOffsetY: 8,
  },
};

export const MOTION = {
  durationFastMs: 120,
  durationBaseMs: 200,
  durationSlowMs: 320,
} as const;

export const A11Y = {
  focusRingWidthPx: 2,
  focusRingOffsetPx: 2,
  disabledOpacity: 0.5,
  minTouchTargetPx: 44,
} as const;

export interface SemanticColors {
  readonly background: string;
  readonly surface: string;
  readonly surfaceAlt: string;
  readonly foreground: string;
  readonly mutedForeground: string;
  readonly border: string;
  readonly ring: string;
  readonly primary: string;
  readonly primaryHover: string;
  readonly primaryForeground: string;
  readonly secondary: string;
  readonly secondaryForeground: string;
  readonly accent: string;
  readonly accentForeground: string;
  readonly destructive: string;
  readonly destructiveForeground: string;
  readonly success: string;
  readonly successSubtle: string;
  readonly warning: string;
  readonly warningSubtle: string;
  readonly info: string;
  readonly infoSubtle: string;
}

export interface ThemeTokens {
  readonly mode: ThemeMode;
  readonly colors: SemanticColors;
}

export const LIGHT_COLORS: SemanticColors = {
  background: "#F8FAFC",
  surface: NEUTRAL.white,
  surfaceAlt: "#EFF3F9",
  foreground: "#0A1A33",
  mutedForeground: "#5B6B82",
  border: "#E1E8F2",
  ring: BRAND_PRIMARY.toLowerCase(),
  primary: BRAND_PRIMARY.toLowerCase(),
  primaryHover: BRAND_PRIMARY_HOVER.toLowerCase(),
  primaryForeground: NEUTRAL.white,
  secondary: "#E8F0FE",
  secondaryForeground: BRAND_PRIMARY_HOVER.toLowerCase(),
  accent: BRAND_CYAN.toLowerCase(),
  accentForeground: NEUTRAL.white,
  destructive: "#DC2626",
  destructiveForeground: NEUTRAL.white,
  success: "#0E9F6E",
  successSubtle: "#D1FAE5",
  warning: "#D97706",
  warningSubtle: "#FEF3C7",
  info: "#0066ff",
  infoSubtle: "#E0EFFF",
};

export const DARK_COLORS: SemanticColors = {
  background: "#09090b",
  surface: "#111114",
  surfaceAlt: "#1c1c21",
  foreground: "#f4f4f5",
  mutedForeground: "#a7a7b3",
  border: "#26262c",
  ring: BRAND_PRIMARY_DARK_HOVER.toLowerCase(),
  primary: BRAND_PRIMARY_DARK.toLowerCase(),
  primaryHover: BRAND_PRIMARY_DARK_HOVER.toLowerCase(),
  primaryForeground: "#06101f",
  secondary: "#1e1e24",
  secondaryForeground: "#9ec1ff",
  accent: "#2DD4A7",
  accentForeground: "#09090b",
  destructive: "#F87171",
  destructiveForeground: "#09090b",
  success: "#34D399",
  successSubtle: "#064E3B",
  warning: "#FBBF24",
  warningSubtle: "#78350F",
  info: "#38BDF8",
  infoSubtle: "#0C4A6E",
};


