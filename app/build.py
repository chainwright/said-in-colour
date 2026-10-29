#!/usr/bin/env python3
"""Copy the tested core into public/js and build the catalogue (thumbs + catalog.json).
Tests run on src/; the browser loads public/js/ — one source of truth, copied here."""
import json, shutil, subprocess
from pathlib import Path

APP = Path(__file__).resolve().parent
ROOT = APP.parent
PUB = APP / "public"
(PUB / "js").mkdir(parents=True, exist_ok=True)
for f in ("colour.js", "cvd.js", "names.js", "onyou.js"):
    shutil.copy(APP / "src" / f, PUB / "js" / f)

# Plain word first (how a colour-blind man can actually use it), the shop's name second.
META = {
    "s01_dusty_rose": ("PINK, MUTED", "dusty rose"), "s02_sage": ("GREEN, GREYISH", "sage"),
    "s03_lavender": ("PURPLE, LIGHT", "lavender"), "s04_coral": ("ORANGE-PINK, WARM", "coral"),
    "s05_burgundy": ("RED, DEEP", "burgundy"), "s06_olive": ("GREEN, OLIVE", "olive"),
    "s07_navy": ("BLUE, VERY DARK", "navy"), "s08_grey": ("GREY, LIGHT", "grey"),
    "s09_white": ("WHITE", "white"), "s10_light_blue": ("BLUE, PALE", "light blue"),
    "s11_cobalt": ("BLUE, STRONG", "cobalt"), "s12_charcoal": ("GREY, DARK", "charcoal"),
}
centre = json.loads((ROOT / "catalog" / "centre_rgb.json").read_text())
(PUB / "catalog").mkdir(exist_ok=True)
items = []
for i, (k, (plain, sold)) in enumerate(META.items(), 1):
    src = ROOT / "catalog" / "raw" / f"{k}.png"
    for size, suffix in ((480, "thumb"), (1400, "full")):
        out = PUB / "catalog" / f"{k}_{suffix}.jpg"
        if not out.exists():
            subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", "-Z", str(size), str(src), "--out", str(out)],
                           check=True, capture_output=True)
    items.append({"id": k, "no": f"No. {i:02d}", "plain": plain, "sold": sold, "rgb": centre[k],
                  "thumb": f"catalog/{k}_thumb.jpg", "full": f"catalog/{k}_full.jpg", "demo": f"demo/on_{k}.jpg"})
(PUB / "catalog.json").write_text(json.dumps(items, indent=1))
print(f"core copied, {len(items)} catalogue items")
