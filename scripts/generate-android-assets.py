#!/usr/bin/env python3
"""Generate the Android launcher icons (adaptive + legacy) and splash screens from the
StudySphere brand icon (public/icons/icon-maskable-512.png), so no binary files need to be
committed. Run from the repo root:  pip install pillow && python scripts/generate-android-assets.py
"""
import glob
import os

from PIL import Image, ImageDraw

SRC = "public/icons/icon-maskable-512.png"
RES = "android/app/src/main/res/"

src = Image.open(SRC).convert("RGB")

# Clean vertical purple gradient (left edge has no glyph / highlight).
col = [src.getpixel((12, y)) for y in range(src.size[1])]
grad = Image.new("RGB", src.size)
gd = ImageDraw.Draw(grad)
for y, c in enumerate(col):
    gd.line([(0, y), (src.size[0], y)], fill=c)

def glyph_only(img):
    """White ring + 'S' on a transparent background."""
    rgb = img.convert("RGB")
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    po, pi = out.load(), rgb.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            w = min(pi[x, y])
            a = max(0, min(255, int((w - 170) * 255 / (255 - 170))))
            if a:
                po[x, y] = (255, 255, 255, a)
    return out

glyph = glyph_only(src)
DENSITIES = {"mdpi": (48, 108), "hdpi": (72, 162), "xhdpi": (96, 216), "xxhdpi": (144, 324), "xxxhdpi": (192, 432)}

for name, (legacy, adaptive) in DENSITIES.items():
    folder = f"{RES}mipmap-{name}/"
    os.makedirs(folder, exist_ok=True)
    grad.resize((adaptive, adaptive), Image.LANCZOS).convert("RGBA").save(folder + "ic_launcher_bg.png")
    g = glyph.resize((int(adaptive * 0.85), int(adaptive * 0.85)), Image.LANCZOS)  # stay inside the safe zone
    fg = Image.new("RGBA", (adaptive, adaptive), (0, 0, 0, 0))
    fg.paste(g, ((adaptive - g.size[0]) // 2, (adaptive - g.size[1]) // 2), g)
    fg.save(folder + "ic_launcher_foreground.png")

    big = src.resize((legacy * 4, legacy * 4), Image.LANCZOS).convert("RGBA")
    sq_mask = Image.new("L", big.size, 0)
    ImageDraw.Draw(sq_mask).rounded_rectangle((0, 0, big.size[0] - 1, big.size[1] - 1), radius=int(big.size[0] * 0.22), fill=255)
    sq = Image.new("RGBA", big.size, (0, 0, 0, 0)); sq.paste(big, (0, 0), sq_mask)
    sq.resize((legacy, legacy), Image.LANCZOS).save(folder + "ic_launcher.png")
    rd_mask = Image.new("L", big.size, 0)
    ImageDraw.Draw(rd_mask).ellipse((0, 0, big.size[0] - 1, big.size[1] - 1), fill=255)
    rd = Image.new("RGBA", big.size, (0, 0, 0, 0)); rd.paste(big, (0, 0), rd_mask)
    rd.resize((legacy, legacy), Image.LANCZOS).save(folder + "ic_launcher_round.png")

adaptive_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_bg"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>"""
os.makedirs(RES + "mipmap-anydpi-v26", exist_ok=True)
for f in ("ic_launcher.xml", "ic_launcher_round.xml"):
    with open(RES + "mipmap-anydpi-v26/" + f, "w") as fh:
        fh.write(adaptive_xml)

# Splash screens (keep each file's size): purple gradient + white mark.
count = 0
for path in glob.glob(RES + "drawable*/splash.png"):
    w, h = Image.open(path).size
    im = Image.new("RGB", (w, h)); d = ImageDraw.Draw(im)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=col[min(len(col) - 1, int(y * len(col) / h))])
    s = int(min(w, h) * 0.42)
    g = glyph.resize((s, s), Image.LANCZOS)
    im = im.convert("RGBA"); im.paste(g, ((w - s) // 2, (h - s) // 2), g)
    im.convert("RGB").save(path); count += 1

print(f"Generated launcher icons for {len(DENSITIES)} densities and {count} splash screens.")