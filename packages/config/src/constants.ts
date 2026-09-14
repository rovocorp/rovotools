export const BRAND_NAME = "RovoTools" as const;
export const BRAND_SHORT_NAME = "Rovo" as const;
export const COMPANY_NAME = "RovoCorp LTD" as const;
export const PACKAGE_NAME = "@rovotools" as const;

export const VERSION = "0.1.0" as const;

export const DOMAIN = "rovotools.com" as const;
export const WEB_URL = `https://${DOMAIN}` as const;

export const SUPPORT_EMAIL = `support@${DOMAIN}` as const;

export interface SocialLink {
  readonly label: string;
  /** Official profile URL. Empty string = not configured yet (rendered as a muted placeholder, never a fake link). */
  readonly href: string;
}

/**
 * Configure official social profiles here. Leave `href` empty until the real
 * profile exists — the footer renders a non-link placeholder instead of a fake URL.
 */
export const SOCIAL_LINKS: ReadonlyArray<SocialLink> = [
  { label: "LinkedIn", href: "" },
  { label: "X", href: "" },
  { label: "Facebook", href: "" },
  { label: "Instagram", href: "" },
] as const;

export const DEFAULT_LOCALE = "en" as const;
export const SUPPORTED_LOCALES: ReadonlyArray<string> = ["en", "ar", "ur"] as const;

export const FONT_FAMILY = {
  sans: "Inter, system-ui, -apple-system, sans-serif",
  mono: "JetBrains Mono, Fira Code, monospace",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
