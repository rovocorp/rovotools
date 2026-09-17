# Accessibility audit — WCAG 2.2 AA

## Automated (CI, `e2e/a11y.spec.ts`)

Axe-core with `wcag2a + wcag2aa + wcag22aa` tags over 15 route templates
× light/dark themes, plus the command-palette and cookie-banner dialogs.
Zero `serious`/`critical` violations to pass.

Verified 2026-09-17 on the production standalone artifact: green on
Chromium (32/32), Firefox (32/32), mobile-chrome and mobile-safari
template sweeps; WebKit green except one load-flake (passes isolated).
Fixed along the way: footer social `role="img"`, skeleton `role="status"`,
file-input names, scrollable-region focus (matrix table, code output),
category badge scale, ~120 low-contrast text spots, theme-settled audit
waits (unsettled stylesheets produce phantom blended-color failures).

## Manual protocol (human sign-off required)

- [ ] Keyboard-only run per template: logical tab order, visible focus on
      every control, no traps, Esc closes palette/menus/dialogs, skip link
      lands on `#main-content`.
- [ ] Screen reader (NVDA + VoiceOver): landmarks/headings announced, every
      custom-tool input has an associated label, results and errors exposed
      via live regions, decorative hero canvas ignored.
- [ ] 200% zoom reflow: no clipped controls or overlapping text.
- [ ] `prefers-reduced-motion`: hero canvas static, float cards hidden,
      marquee still.
- [ ] Contrast spot-check incl. gradient headline text and zinc-400/500
      secondary text in both themes.
- [ ] Touch targets ≥ 24px on header/footer icon buttons (axe `target-size`
      rule) across mobile viewports.

Signed off: _(name, date)_ — open until completed.
