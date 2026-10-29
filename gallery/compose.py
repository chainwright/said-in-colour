"""Said in Colour gallery, step 2: raw/*.png -> final/*.jpg (1920x1080, 16:9).

    python3 gallery/compose.py

Frames 01-04 are the viewport as captured, with an "AI-generated" label added. 05 is the method panel
cropped out of the page bottom. 06 puts "good on you" side by side, before and after he picks his hair
(raw 06_on_you + 07_your_hair). Rendered by headless Chromium; no network except Google Fonts.
"""
import time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

G = Path(__file__).resolve().parent
RAW, FINAL, TMP = G / "raw", G / "final", G / "raw" / "_crops"
FINAL.mkdir(exist_ok=True); TMP.mkdir(exist_ok=True)
MAN = "The man and the shirts are AI-generated · every render is a real YouCam result"
SHIRTS = "The shirts are AI-generated product photos"

HEAD = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;600&family=Atkinson+Hyperlegible+Next:wght@400;600;800&display=swap" rel="stylesheet">
<style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#0b0f14;color:#eef3f4;font-family:"Atkinson Hyperlegible Next",sans-serif}
.full{position:absolute;inset:0;width:1920px;height:1080px}
.ai{position:absolute;left:50%;top:18px;transform:translateX(-50%);font:600 19px/1 "Atkinson Hyperlegible Mono",monospace;background:rgba(238,243,244,.93);
 color:#0b0f14;padding:9px 16px;border-radius:999px;white-space:nowrap}
</style></head><body>"""


def crop(name, box, tag):
    out = TMP / f"{name}_{tag}.png"
    Image.open(RAW / f"{name}.png").convert("RGB").crop(box).save(out)
    return f"file://{out}"


def frames():
    for n in ("01_hero_trap", "02_everyone", "03_you"):
        yield n, f'<img class="full" src="file://{RAW / (n + ".png")}"><div class="ai">{MAN}</div>'
    edge = "#%02x%02x%02x" % Image.open(RAW / "04_case.png").convert("RGB").getpixel((4, 1200))
    yield "04_case", (f'<div style="position:absolute;inset:0;background:{edge};display:grid;place-items:center"><img src="file://{RAW / "04_case.png"}" style="height:1080px"></div>'
                      f'<div class="ai" style="left:auto;right:24px;transform:none;top:auto;bottom:18px;font-size:16px">{SHIRTS}</div>')
    yield "05_method", f'<img class="full" src="file://{RAW / "05_method.png"}">'
    man = crop("06_on_you", (0, 0, 1600, 2160), "man")
    before = crop("06_on_you", (2290, 1365, 3620, 1595), "lines")
    after = crop("07_your_hair", (2290, 1365, 3620, 1595), "lines")
    yield "06_good_on_you", f"""
<img src="{man}" style="position:absolute;left:0;top:0;height:1080px">
<div style="position:absolute;left:860px;right:56px;top:110px">
  <div style="font-weight:800;font-size:66px;line-height:1.02;letter-spacing:.01em">GOOD ON YOU, TOO</div>
  <p style="font-size:27px;line-height:1.35;color:rgba(238,243,244,.78);margin:18px 0 34px">Skin is measured by YouCam's Facial Color Tones. Hair comes back as a palette
  category, so it's shown as one, and compared only once you pick your own hair.</p>
  <p style="font:600 18px/1 'Atkinson Hyperlegible Mono',monospace;letter-spacing:.08em;color:#9fb3c8;margin:0 0 10px">COBALT SHIRT · BEFORE YOU PICK</p>
  <img src="{before}" style="width:100%;border:1px solid #2a3442;border-radius:10px">
  <p style="font:600 18px/1 'Atkinson Hyperlegible Mono',monospace;letter-spacing:.08em;color:#9fb3c8;margin:30px 0 10px">AFTER “YOUR HAIR: DARK”</p>
  <img src="{after}" style="width:100%;border:1px solid #2a3442;border-radius:10px">
</div>
<div class="ai" style="left:24px;transform:none;top:auto;bottom:18px;font-size:16px">The man and the shirt are AI-generated · real YouCam render</div>"""


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
    for name, body in frames():
        page = TMP / f"{name}.html"; page.write_text(HEAD + body + "</body></html>")
        pg.goto(f"file://{page}"); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); time.sleep(0.4)
        pg.screenshot(path=str(FINAL / f"{name}.jpg"), type="jpeg", quality=90)
        print("final", name)
    b.close()
