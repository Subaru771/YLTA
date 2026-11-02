#!/usr/bin/env python3
"""Vendor release-pinned OFL fonts as local WOFF2 assets (manual maintenance only).

Python 3.11+ and fonttools[woff] required. This uses Google Fonts repository
sources at a fixed commit, then records the original OFL notices separately.
"""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from fontTools.ttLib import TTFont

GOOGLE_FONTS_COMMIT = "6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec"
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "fonts"
FONTS = {
    "barlow-regular": "ofl/barlow/Barlow-Regular.ttf",
    "barlow-medium": "ofl/barlow/Barlow-Medium.ttf",
    "barlow-semibold": "ofl/barlow/Barlow-SemiBold.ttf",
    "barlow-condensed-medium": "ofl/barlowcondensed/BarlowCondensed-Medium.ttf",
    "barlow-condensed-semibold": "ofl/barlowcondensed/BarlowCondensed-SemiBold.ttf",
    "barlow-condensed-bold": "ofl/barlowcondensed/BarlowCondensed-Bold.ttf",
    "jetbrains-mono-variable": "ofl/jetbrainsmono/JetBrainsMono[wght].ttf",
}
LICENSES = {
    "barlow-OFL.txt": "ofl/barlow/OFL.txt",
    "jetbrainsmono-OFL.txt": "ofl/jetbrainsmono/OFL.txt",
}


def upstream(path: str) -> bytes:
    url = f"https://raw.githubusercontent.com/google/fonts/{GOOGLE_FONTS_COMMIT}/{path}"
    request = Request(url, headers={"User-Agent": "YLTA-Font-Vendoring/1.0"})
    with urlopen(request, timeout=60) as res:
        return res.read()


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    notices = DEST / "licenses"
    notices.mkdir(exist_ok=True)
    for name, path in FONTS.items():
        font = TTFont(BytesIO(upstream(path)), recalcBBoxes=False, recalcTimestamp=False)
        font.flavor = "woff2"
        output = DEST / f"{name}.woff2"
        font.save(output, reorderTables=True)
        font.close()
        assert output.stat().st_size > 2_000, f"Font empty: {name}"
        print(f"{name}: {output.stat().st_size} bytes")
    for name, path in LICENSES.items():
        (notices / name).write_bytes(upstream(path))
    print("Vendored pinned OFL fonts and license notices.")


if __name__ == "__main__":
    main()
