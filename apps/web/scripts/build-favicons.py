"""Regenerate web favicon and PWA icons from the canonical PNG logo.

Source : <repo-root>/apps/mobile/assets/icon.png (1024x1024, opaque navy)
Outputs: apps/web/public/favicon-{16x16,32x32,48x48}.png
         apps/web/public/favicon.ico           (16/32/48 frames)
         apps/web/public/apple-touch-icon.png  (180x180, opaque)
         apps/web/public/icon-192.png
         apps/web/public/icon-512.png
         apps/web/public/icon-maskable-512.png

Do not generate these from the old SVG mark: the current brand logo is the
R mark in the PNG above. Run:  python apps/web/scripts/build-favicons.py
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# apps/web/scripts -> apps/web -> apps -> repo root
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(SCRIPT_DIR)))
SOURCE = os.path.join(REPO_ROOT, "apps", "mobile", "assets", "icon.png")
PUBLIC = os.path.join(REPO_ROOT, "apps", "web", "public")

CORNER_RADIUS_RATIO = 0.22
FAVICON_SIZES = (16, 32, 48)
ICO_SIZES = [(16, 16), (32, 32), (48, 48)]


def rounded(source: Image.Image, size: int) -> Image.Image:
    """Resize the square source and apply a high-quality rounded-corner mask."""
    icon = source.resize((size, size), Image.LANCZOS).convert("RGBA")
    scale = 4
    mask = Image.new("L", (size * scale, size * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        (0, 0, size * scale - 1, size * scale - 1),
        radius=round(size * scale * CORNER_RADIUS_RATIO),
        fill=255,
    )
    icon.putalpha(mask.resize((size, size), Image.LANCZOS))
    return icon


def save_png(image: Image.Image, name: str) -> None:
    path = os.path.join(PUBLIC, name)
    image.save(path, optimize=True)
    print(f"wrote {name}  {image.size[0]}x{image.size[1]}  {image.mode}")


def main() -> int:
    if not os.path.isfile(SOURCE):
        print(f"source not found: {SOURCE}")
        return 1

    source = Image.open(SOURCE).convert("RGB")
    print(f"source {os.path.relpath(SOURCE, REPO_ROOT)}  {source.size[0]}x{source.size[1]}")

    for size in FAVICON_SIZES:
        save_png(rounded(source, size), f"favicon-{size}x{size}.png")

    ico = rounded(source, 512)
    ico.save(os.path.join(PUBLIC, "favicon.ico"), format="ICO", sizes=ICO_SIZES)
    print("wrote favicon.ico  16x16 32x32 48x48")

    # iOS masks the icon itself, so this variant must stay opaque and square.
    save_png(source.resize((180, 180), Image.LANCZOS), "apple-touch-icon.png")

    for size in (192, 512):
        save_png(rounded(source, size), f"icon-{size}.png")

    # Maskable icons are cropped to a circle on some launchers: keep the
    # full-bleed navy background and the mark inside the 80% safe zone.
    save_png(source.resize((512, 512), Image.LANCZOS), "icon-maskable-512.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
