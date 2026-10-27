"""Clean full-res gallery stills from the live Said in Colour site (CDP on 9224).

    python gallery/shots.py

Each shot navigates the live page, drives it to one state, waits for it to settle, and
screenshots the viewport at 1920x1080. Output: gallery/raw/NN_name.png.
"""
import base64, json, os, sys, time
sys.path.insert(0, "/Users/mini/agents/sora/scripts")
from cdp import CDP

D = os.path.dirname(os.path.abspath(__file__))
BASE = "https://said-in-colour.netlify.app"
PHOTO = "/Users/mini/agents/sora/hackathons/youcam_2026/said_in_colour/gate/man2.jpg"
W, H = 1920, 1080


def shot(c, name):
    data = c.send("Page.captureScreenshot", format="png")["data"]
    p = f"{D}/raw/{name}.png"
    open(p, "wb").write(base64.b64decode(data))
    print("saved", name, flush=True)


def js(c, code):
    return c.js(code)


def wait(c, cond, limit=120):
    end = time.time() + limit
    while time.time() < end:
        if js(c, cond):
            return
        time.sleep(0.4)
    raise SystemExit("timeout " + cond)


def home(c, q):
    c.navigate(f"{BASE}/?{q}={time.time()}", timeout=40, settle=0)
    wait(c, "document.getElementById('chart').classList.contains('ready')")


def main():
    c = CDP(port=9224, url_contains="said-in-colour")
    c.send("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=2, mobile=False)
    try:
        # 1. Hero: coral on the man, lens settled, chart sharp (TRAP)
        home(c, "g1")
        js(c, "document.querySelector('.slot[data-id=s04_coral]').click()")
        wait(c, "document.querySelector('.slot[data-id=s04_coral]').getAttribute('aria-current')==='true'")
        js(c, "document.getElementById('room').scrollIntoView()")
        time.sleep(2.5)
        shot(c, "01_hero_trap")

        # 2. Whole-picture flip: EVERYONE (the true render, full frame)
        js(c, "document.getElementById('flipThem').click()"); time.sleep(1.5)
        shot(c, "02_everyone")
        # 3. ...and YOU (his view, full frame) — the same shirt, same face
        js(c, "document.getElementById('flipYou').click()"); time.sleep(1.5)
        shot(c, "03_you")
        js(c, "document.getElementById('flipLens').click()"); time.sleep(0.5)

        # 4. The trial-lens case with all twelve tags
        js(c, "window.scrollTo({top: document.getElementById('case').offsetTop + 30})")
        time.sleep(1.5)
        shot(c, "04_case")

        # 5. The method panel: Machado matrix + CIEDE2000
        js(c, "window.scrollTo({top: document.getElementById('method').offsetTop - 20})")
        time.sleep(1.2)
        shot(c, "05_method")

        # 6. A live try-on on his own photo
        home(c, "g6")
        js(c, "window.scrollTo({top: document.getElementById('you').offsetTop - 20})")
        time.sleep(1.0)
        c.send("DOM.enable"); root = c.send("DOM.getDocument")["root"]["nodeId"]
        nid = c.send("DOM.querySelector", nodeId=root, selector="#photo")["nodeId"]
        c.send("DOM.setFileInputFiles", nodeId=nid, files=[PHOTO])
        js(c, "document.getElementById('photo').dispatchEvent(new Event('change',{bubbles:true}))")
        wait(c, "/^(Done|Couldn)/.test(document.getElementById('status').textContent)", 120)
        js(c, "document.getElementById('room').scrollIntoView()")
        time.sleep(2.0)
        shot(c, "06_live_tryon")
    finally:
        c.send("Emulation.clearDeviceMetricsOverride")


if __name__ == "__main__":
    main()
