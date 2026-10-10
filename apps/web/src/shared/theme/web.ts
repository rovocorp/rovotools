import { A11Y, FONT_FAMILY, MOTION, RADIUS, type ThemeTokens } from "./tokens";

/**
 * Maps shared tokens to CSS custom properties.
 *
 * Includes shadcn/ui aliases so web components consume tokens through
 * shadcn's semantic classes:
 *
 *   token background          ->  --background / bg-background
 *   token surface             ->  --card / bg-card
 *   token foreground          ->  --foreground / text-foreground
 *   token mutedForeground     ->  --muted-foreground / text-muted-foreground
 *   token surfaceAlt          ->  --muted / bg-muted
 *   token primary             ->  --primary / bg-primary
 *   token primaryForeground   ->  --primary-foreground
 *   token secondary           ->  --secondary / bg-secondary
 *   token secondaryForeground ->  --secondary-foreground
 *   token accent              ->  --accent / bg-accent
 *   token destructive         ->  --destructive
 *   token border              ->  --border / --input / border-border
 *   token ring                ->  --ring (focus-visible:ring-ring)
 */
export function cssVariablesForTheme(theme: ThemeTokens): Record<string, string> {
  const c = theme.colors;
  return {
    "--rovotools-background": c.background,
    "--rovotools-surface": c.surface,
    "--rovotools-surface-alt": c.surfaceAlt,
    "--rovotools-foreground": c.foreground,
    "--rovotools-muted": c.mutedForeground,
    "--rovotools-border": c.border,
    "--rovotools-ring": c.ring,
    "--rovotools-primary": c.primary,
    "--rovotools-primary-hover": c.primaryHover,
    "--rovotools-on-primary": c.primaryForeground,
    "--rovotools-secondary": c.secondary,
    "--rovotools-on-secondary": c.secondaryForeground,
    "--rovotools-accent": c.accent,
    "--rovotools-destructive": c.destructive,
    "--rovotools-success": c.success,
    "--rovotools-success-subtle": c.successSubtle,
    "--rovotools-warning": c.warning,
    "--rovotools-warning-subtle": c.warningSubtle,
    "--rovotools-info": c.info,
    "--rovotools-info-subtle": c.infoSubtle,
    "--rovotools-focus-ring-width": `${A11Y.focusRingWidthPx}px`,
    "--rovotools-disabled-opacity": String(A11Y.disabledOpacity),
    "--rovotools-radius-sm": `${RADIUS.sm}px`,
    "--rovotools-radius-md": `${RADIUS.md}px`,
    "--rovotools-radius-lg": `${RADIUS.lg}px`,
    "--rovotools-radius-xl": `${RADIUS.xl}px`,
    "--rovotools-font-sans": FONT_FAMILY.sans,
    "--rovotools-font-mono": FONT_FAMILY.mono,
    "--rovotools-motion-fast": `${MOTION.durationFastMs}ms`,
    "--rovotools-motion-base": `${MOTION.durationBaseMs}ms`,
    "--background": c.background,
    "--foreground": c.foreground,
    "--card": c.surface,
    "--card-foreground": c.foreground,
    "--popover": c.surface,
    "--popover-foreground": c.foreground,
    "--primary": c.primary,
    "--primary-foreground": c.primaryForeground,
    "--secondary": c.secondary,
    "--secondary-foreground": c.secondaryForeground,
    "--muted": c.surfaceAlt,
    "--muted-foreground": c.mutedForeground,
    "--accent": c.accent,
    "--accent-foreground": c.accentForeground,
    "--destructive": c.destructive,
    "--destructive-foreground": c.destructiveForeground,
    "--border": c.border,
    "--input": c.border,
    "--ring": c.ring,
  };
}
