"""Said in Colour gallery, step 1: full-res stills of the local build (same files as the live site), 1920x1080 @2x.

    python3 gallery/shots.py      # -> gallery/raw/NN_name.png   (then gallery/compose.py -> gallery/final/)

Headless Chromium, fresh profile. Every /api/ request is aborted, so no YouCam call can run: all
renders are the saved demo results and the skin/hair reading is the saved demo/tones.json.
(The 27 Oct version drove Chrome on 9224 and ran one live try-on: shots_2026-10-27.py.)
"""
import sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

D = Path(__file__).resolve().parent
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:18766"
W, H = 1920, 1080
blocked = []


def shot(pg, name, settle=1.5):
    pg.wait_for_function("[...document.images].every(i=>i.complete)", timeout=30000)
    time.sleep(settle)
    pg.screenshot(path=str(D / "raw" / f"{name}.png"))
    print("saved", name, flush=True)


def home(pg, q):
    pg.goto(f"{BASE}/?{q}={time.time()}")
    pg.wait_for_function("document.getElementById('chart').classList.contains('ready')", timeout=60000)


def pick(pg, sid):
    pg.click(f".slot[data-id={sid}]")
    pg.wait_for_function(f"document.querySelector('.slot[data-id={sid}]').getAttribute('aria-current')==='true'")
    time.sleep(0.8)
    pg.evaluate("document.getElementById('room').scrollIntoView()")
    time.sleep(2.0)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=2)
    ctx.route("**/api/**", lambda r: (blocked.append(r.request.url), r.abort()))
    pg = ctx.new_page()

    # 1. Hero: coral on the man, lens settled (TRAP)
    home(pg, "g1"); pick(pg, "s04_coral")
    shot(pg, "01_hero_trap")
    # 2-3. Whole-picture flip: everyone, then him
    pg.click("#flipThem"); shot(pg, "02_everyone")
    pg.click("#flipYou"); shot(pg, "03_you")
    pg.click("#flipLens"); time.sleep(0.5)

    # 4. The trial-lens case with all twelve tags
    # The case section is taller than one screen at 1080 (the case scales with the viewport), so clip the
    # section itself from the full page: title to legend.
    top, bottom = pg.evaluate("[document.getElementById('caseTitle').getBoundingClientRect().top+scrollY-40,"
                              " document.querySelector('.legend').getBoundingClientRect().bottom+scrollY+40]")
    pg.wait_for_function("[...document.images].every(i=>i.complete)"); time.sleep(1.5)
    pg.screenshot(path=str(D / "raw" / "04_case.png"), full_page=True, clip={"x": 0, "y": top, "width": W, "height": bottom - top})
    print("saved 04_case", flush=True)

    # 5. The method panel
    # The method is the last section, so it can't scroll to the top; set the sections above it aside
    # for this one frame (display only) so the panel sits alone on the page background.
    pg.evaluate("for (const id of ['room','case','you']) document.getElementById(id).style.display='none'; document.getElementById('method').style.paddingTop='27vh'")
    pg.evaluate("window.scrollTo(0, 0)")
    shot(pg, "05_method", 1.2)

    # 6. Good on you: skin read by YouCam's Facial Color Tones, hair shown as YouCam's palette until he picks
    home(pg, "g6"); pick(pg, "s11_cobalt")
    shot(pg, "06_on_you")
    # 7. ...and once he picks his own hair
    pg.select_option("#hairSel", "dark"); time.sleep(0.6)
    pg.evaluate("document.getElementById('room').scrollIntoView()")
    shot(pg, "07_your_hair")
    b.close()

print("blocked /api/ requests:", blocked or "none")
