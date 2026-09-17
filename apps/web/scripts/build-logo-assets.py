"""Regenerate web logo assets from the updated black brand sheet.

Source : <repo-root>/img/rovotoollogo.png (black background, 1774x887)
Outputs: apps/web/public/logo-dark.png  (header/footer lockup for dark mode)
         apps/web/public/og-image.png    (1200x630 social card, dark)

The black sheet reuses the light-mode dark-navy "Rovo" ink, which is
illegible on black, and the export carries JPEG halo fringes. This script
repairs both: "Rovo" glyphs are unblended from black and repainted white
(AA edges preserved), the tagline gray is lifted, and near-black halo
noise is crushed. Run:  python3 scripts/build-logo-assets.py

Mobile reuses the same bytes: copy public/logo-dark.png to
apps/mobile/assets/logo-dark.png after regenerating.
"""

from __future__ import annotations

import hashlib
import os
import sys

from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# apps/web/scripts -> apps/web -> apps -> repo root
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(SCRIPT_DIR)))
SOURCE = os.path.join(REPO_ROOT, "img", "rovotoollogo.png")
PUBLIC = os.path.join(REPO_ROOT, "apps", "web", "public")

# Lockup region (R mark + wordmark + tagline), excluding the app-icon tile
# at the bottom-right and the JPEG smudge below the R leg.
LOCKUP_CROP = (21, 120, 1773, 618)

# "Rovo" glyphs live here (dark-navy ink on black); the blue "T" starts at x~1115.
ROVO_BOX = (495, 235, 1110, 480)
# Tagline row (dim gray + blue halo shimmer on black).
TAGLINE_BOX = (460, 455, 1660, 565)

OG_SIZE = (1200, 630)
OG_LOCKUP_WIDTH = 1020


def luminance(pixel: tuple[int, int, int]) -> float:
    r, g, b = pixel
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def repair_rovo(image: Image.Image) -> None:
    """Repaint dark-navy "Rovo" glyphs white, preserving anti-aliased edges."""
    region = image.crop(ROVO_BOX)
    px = region.load()
    w, h = region.size
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            lum = luminance(p)
            if lum < 70:
                alpha = min(lum / 16.0, 1.0)
                v = int(round(255 * alpha))
                px[x, y] = (v, v, v)
    image.paste(region, ROVO_BOX)


def repair_tagline(image: Image.Image) -> None:
    """Lift the dim tagline to light gray while neutralizing its blue halo.

    The tagline zone is halo-tinted, so the lift is deliberately
    desaturating: residual glow becomes a soft gray outer glow instead of
    a blue fringe. Proportional scaling preserves anti-aliased edges.
    """
    region = image.crop(TAGLINE_BOX)
    px = region.load()
    w, h = region.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            lum = luminance((r, g, b))
            if 20 < lum < 190 and max(r, g, b) - min(r, g, b) < 70:
                lift = min(lum * 2.6, 235)
                nr, ng, nb_ = (min(int(c * 2.6), 235) for c in (r, g, b))
                px[x, y] = (
                    int(nr * 0.5 + lift * 0.5),
                    int(ng * 0.5 + lift * 0.5),
                    int(nb_ * 0.5 + lift * 0.5),
                )
    image.paste(region, TAGLINE_BOX)


def crush_halo_noise(image: Image.Image, threshold: int = 16) -> Image.Image:
    """Crush near-black JPEG halo shimmer to pure black."""
    return image.point(lambda v: 0 if v < threshold else v)


def build_og_image(lockup: Image.Image) -> Image.Image:
    """Compose the 1200x630 dark social card from the repaired lockup."""
    card = Image.new("RGB", OG_SIZE, (0, 0, 0))
    scale = OG_LOCKUP_WIDTH / lockup.width
    resized = lockup.resize((OG_LOCKUP_WIDTH, round(lockup.height * scale)), Image.LANCZOS)
    card.paste(resized, (80, (OG_SIZE[1] - resized.height) // 2))
    return card


def save_and_report(image: Image.Image, path: str) -> None:
    image.save(path, optimize=True)
    with open(path, "rb") as handle:
        digest = hashlib.sha256(handle.read()).hexdigest()[:12]
    size = os.path.getsize(path)
    print(f"wrote {os.path.relpath(path, REPO_ROOT)}  {image.size[0]}x{image.size[1]}  {size // 1024} KB  sha:{digest}")


def main() -> int:
    if not os.path.isfile(SOURCE):
        print(f"source not found: {SOURCE}", file=sys.stderr)
        return 1
    base = Image.open(SOURCE).convert("RGB")
    print(f"source {os.path.relpath(SOURCE, REPO_ROOT)}  {base.size[0]}x{base.size[1]}")
    repair_rovo(base)
    repair_tagline(base)
    repaired = crush_halo_noise(base)
    lockup = repaired.crop(LOCKUP_CROP)
    save_and_report(lockup, os.path.join(PUBLIC, "logo-dark.png"))
    save_and_report(build_og_image(lockup), os.path.join(PUBLIC, "og-image.png"))
    print("mobile: copy public/logo-dark.png to apps/mobile/assets/logo-dark.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
