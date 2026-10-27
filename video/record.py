"""Records each scene of the Said in Colour demo from the live site at 1920x1080 (desktop).

    python record.py [scene ...]

Each scene: actions on the live page while frames stream in; frames are saved with their timestamps and
encoded to scenes/sNN.mp4 at 30 fps (each frame held until the next one arrives).
"""
import base64, json, os, subprocess, sys, threading, time
sys.path.insert(0, "/Users/mini/agents/sora/scripts")
from cdp import CDP

D = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("SIC_BASE", "https://said-in-colour.netlify.app")
DEMO = "/Users/mini/agents/sora/hackathons/youcam_2026/app/public/demo"
W, H = 1920, 1080


class RCDP(CDP):
    """CDP whose send() also saves and acks screencast frames that arrive while it waits for a reply."""
    rec = None

    def send(self, method, **params):
        self._id += 1
        my = self._id
        self.ws.send(json.dumps({"id": my, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("method") == "Page.screencastFrame" and self.rec:
                self.rec.frame(msg["params"])
                continue
            if msg.get("id") == my:
                if "error" in msg:
                    raise RuntimeError(msg["error"])
                return msg.get("result", {})


class Rec:
    def __init__(self, c, name):
        self.c, self.name, self.frames = c, name, []
        self.dir = f"{D}/frames/{name}"
        os.makedirs(self.dir, exist_ok=True)
        for f in os.listdir(self.dir):
            os.remove(f"{self.dir}/{f}")

    def start(self):
        self.t0 = time.time()
        self.marks = {}
        self.c.send("Page.startScreencast", format="jpeg", quality=88, maxWidth=1920, maxHeight=1080, everyNthFrame=1)

    def reset(self):
        """Drop everything recorded so far: the scene starts now (used once the page has drawn its photo)."""
        for _, p in self.frames:
            try:
                os.remove(p)
            except OSError:
                pass
        self.frames, self.t0, self.marks = [], time.time(), {}
        # restart the stream: after a navigation Chrome sometimes stops sending frames (a whole scene came out empty)
        try:
            self.c.send("Page.stopScreencast")
        except Exception:
            pass
        self.c.send("Page.startScreencast", format="jpeg", quality=88, maxWidth=1920, maxHeight=1080, everyNthFrame=1)

    def mark(self, key):
        self.marks[key] = round(time.time() - self.t0, 3)

    def until(self, t):
        """Keep recording until scene time t (seconds since the scene started), to land actions on the voice."""
        self.pump(max(0.0, t - (time.time() - self.t0)))

    def pump(self, seconds):
        """Read screencast frames for `seconds` (the CDP helper is synchronous, so we poll its socket)."""
        end = time.time() + seconds
        ws = self.c.ws
        ws.settimeout(0.05)
        while time.time() < end:
            try:
                msg = json.loads(ws.recv())
            except Exception:
                continue
            if msg.get("method") == "Page.screencastFrame":
                self.frame(msg["params"])
        ws.settimeout(None)

    def frame(self, p):
        self.n = getattr(self, "n", 0) + 1
        n = self.n
        path = f"{self.dir}/{n:05d}.jpg"
        open(path, "wb").write(base64.b64decode(p["data"]))
        self.frames.append((time.time() - self.t0, path))
        self.c.ws.send(json.dumps({"id": 900000 + n, "method": "Page.screencastFrameAck",
                                   "params": {"sessionId": p["sessionId"]}}))

    def stop(self):
        try:
            self.c.send("Page.stopScreencast")
        except Exception:
            pass
        total = time.time() - self.t0
        json.dump(self.marks, open(f"{self.dir}/marks.json", "w"))
        lst = f"{self.dir}/list.txt"
        with open(lst, "w") as f:
            for i, (t, p) in enumerate(self.frames):
                nxt = self.frames[i + 1][0] if i + 1 < len(self.frames) else total
                f.write(f"file '{p}'\nduration {max(nxt - t, 0.001):.4f}\n")
            if self.frames:
                f.write(f"file '{self.frames[-1][1]}'\n")
        os.makedirs(f"{D}/scenes", exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf",
                        f"fps=30,scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0x0b0f14",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", f"{D}/scenes/{self.name}.mp4"], check=True)
        print(self.name, len(self.frames), "frames", round(total, 1), "s", flush=True)


def js(c, code):
    """Evaluate in the page and fail loudly: CDP reports page errors in exceptionDetails, which c.js() drops
    (a repeated top-level `const` silently did nothing on every call after the first)."""
    r = c.send("Runtime.evaluate", expression=code, returnByValue=True, awaitPromise=True)
    if "exceptionDetails" in r:
        raise RuntimeError(f"page JS failed: {r['exceptionDetails'].get('exception', {}).get('description', r['exceptionDetails'])}\n{code[:200]}")
    return r.get("result", {}).get("value")


def act(c, rec, code, wait):
    """Run JS, then keep recording for `wait` seconds (the JS call itself must not block the pump)."""
    js(c, code)
    rec.pump(wait)


def move(c, x, y):
    c.send("Input.dispatchMouseEvent", type="mouseMoved", x=x, y=y)


def hover_sel(c, rec, sel, wait=1.2):
    r = js(c, f"(()=>{{const e=document.querySelector({json.dumps(sel)});if(!e)return null;const q=e.getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]}})()")
    if r:
        move(c, r[0], r[1])
    rec.pump(wait)


def scroll_to(c, rec, sel, offset=80, wait=1.2):
    js(c, f"window.scrollTo({{top: document.querySelector({json.dumps(sel)}).getBoundingClientRect().top + scrollY - {offset}, behavior: 'smooth'}})")
    rec.pump(wait)


def scene(c, name, fn, tries=2):
    for k in range(tries):
        rec = Rec(c, name)
        c.rec = rec
        rec.start()
        fn(c, rec)
        c.rec = None
        if len(rec.frames) >= 30:
            rec.stop()
            return
        try:
            c.send("Page.stopScreencast")
        except Exception:
            pass
        print(name, "came out with", len(rec.frames), "frames, recording it again", flush=True)
    raise SystemExit(f"{name}: no frames after {tries} tries")


# ------------------------------------------------------------------ scenes
def center(c, sel):
    return js(c, f"(()=>{{const e=document.querySelector({json.dumps(sel)});const q=e.getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]}})()")


def mouse(c, t, x, y, **kw):
    c.send("Input.dispatchMouseEvent", type=t, x=x, y=y, **kw)


def click(c, sel):
    x, y = center(c, sel)
    mouse(c, "mouseMoved", x, y)
    for t in ("mousePressed", "mouseReleased"):
        mouse(c, t, x, y, button="left", clickCount=1)


def glide_mouse(c, rec, x0, y0, x1, y1, secs, held=False):
    """Move the mouse along an eased path in real time: the position follows the clock, so a leg takes `secs`."""
    t0 = time.time()
    while True:
        f = min(1.0, (time.time() - t0) / secs); e = f * f * (3 - 2 * f)
        mouse(c, "mouseMoved", x0 + (x1 - x0) * e, y0 + (y1 - y0) * e, **({"button": "left", "buttons": 1} if held else {}))
        if f >= 1:
            break
        rec.pump(1 / 60)


def wait(c, rec, cond, limit=25):
    end = time.time() + limit
    while time.time() < end:
        if js(c, cond):
            return
        rec.pump(0.3)
    raise SystemExit("timeout " + cond)


def home(c, q, rec):
    """Open the page fresh and start the scene only once the photo is drawn (nothing before that is kept)."""
    c.navigate(f"{BASE}/?{q}={time.time()}", timeout=40, settle=0)
    wait(c, rec, "document.getElementById('stage').classList.contains('ready')", 40)
    js(c, SCROLL_HELPER)
    rec.reset()


# a slow, eased scroll (the browser's own smooth scroll is too quick to read on video)
CASE_Y = "window.__top('#ticket',961)"   # the case and the ticket under it, both in frame

SCROLL_HELPER = """window.__sc=(y,ms)=>{const y0=scrollY,t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/ms),e=p<.5?2*p*p:1-(-2*p+2)**2/2;
scrollTo(0,y0+(y-y0)*e);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
window.__top=(sel,off)=>document.querySelector(sel).getBoundingClientRect().top+scrollY-(off||0);"""


def sc(c, rec, target_js, ms):
    js(c, f"window.__sc({target_js},{ms})")


def lens_xy(c):
    return center(c, "#lensHandle")


def drag_lens(c, rec, path, secs_each):
    """Hold the lens and move it through the points (absolute page coords), easing between them."""
    x, y = lens_xy(c)
    mouse(c, "mouseMoved", x, y); mouse(c, "mousePressed", x, y, button="left", clickCount=1)
    for (nx, ny), s in zip(path, secs_each):
        glide_mouse(c, rec, x, y, nx, ny, s, True)
        x, y = nx, ny
    mouse(c, "mouseReleased", x, y, button="left", clickCount=1)


def hover_slot(c, rec, sid, secs):
    x, y = center(c, f".slot[data-id={sid}]"); mouse(c, "mouseMoved", x, y)
    js(c, f"document.querySelector('.slot[data-id={sid}]').dispatchEvent(new Event('mouseenter'))"); rec.pump(secs)


def s0(c, rec):  # the lens drifts onto the chest; "grey" inside it; then the whole picture as everyone sees it
    home(c, "s0", rec)
    rec.until(2.2)                                      # drift-in and the chart sharpening
    x, y = lens_xy(c)
    drag_lens(c, rec, [(x - 90, y + 20), (x + 70, y - 10)], [1.3, 1.3])  # "...this shirt is grey"
    rec.until(4.9)
    click(c, "#flipThem"); rec.until(7.3)               # "To everyone else, it's dusty rose."
    click(c, "#flipLens"); rec.until(8.6)


def s1(c, rec):  # not grey, but collapsing; then the shop names that don't help
    home(c, "s1", rec)
    rec.until(0.7)
    click(c, "#flipYou"); rec.until(3.0)                # his whole view: the face isn't grey, the shirt is
    click(c, "#flipThem"); rec.until(4.4)
    click(c, "#flipYou"); rec.until(5.2)
    for k in range(2):                                  # "...collapse into others": rose <-> grey
        click(c, "#flipThem"); rec.pump(0.9)
        click(c, "#flipYou"); rec.pump(0.9)
    click(c, "#flipLens"); rec.until(8.6)
    sc(c, rec, CASE_Y, 1400); rec.until(10.4)   # "...sage, stone and dusty rose"
    hover_slot(c, rec, "s02_sage", 1.5)
    hover_slot(c, rec, "s01_dusty_rose", 1.6)
    hover_slot(c, rec, "s03_lavender", 1.4)
    rec.until(15.4)


def s2(c, rec):  # the same render twice: the lens is his eyes
    home(c, "s2", rec)
    rec.until(1.6)
    x, y = lens_xy(c)
    drag_lens(c, rec, [(x - 120, y - 140), (x + 60, y + 60)], [1.6, 1.6])   # "puts the shirt on him"
    rec.until(5.3)
    click(c, "#flipYou"); rec.pump(1.4)                 # "the same render twice"
    click(c, "#flipThem"); rec.pump(1.4)
    click(c, "#flipLens"); rec.until(8.7)
    x, y = lens_xy(c)                                   # "Inside the lens is what he sees."
    drag_lens(c, rec, [(x - 150, y + 30), (x + 140, y + 10), (x, y - 40)], [1.1, 1.4, 1.0])
    rec.until(12.2)
    x, y = lens_xy(c)                                   # "Outside is what everyone else sees."
    drag_lens(c, rec, [(x + 10, y - 330), (x - 20, y)], [1.6, 1.6])
    rec.until(16.2)


def s3(c, rec):  # the case: tags from measured colour; a trap; one that reads the same
    home(c, "s3", rec)
    sc(c, rec, CASE_Y, 1500); rec.until(2.0)
    for sid in ("s01_dusty_rose", "s03_lavender", "s04_coral"):   # "...a tag worked out from its measured colour"
        hover_slot(c, rec, sid, 1.25)
    rec.until(6.0)
    click(c, ".slot[data-id=s04_coral]")                # "Trap means ... different names" -> KHAKI / CORAL
    wait(c, rec, "scrollY<5 && document.getElementById('verdict').textContent.includes('coral')")
    rec.until(9.4)
    sc(c, rec, CASE_Y, 700); rec.pump(0.85)
    click(c, ".slot[data-id=s11_cobalt]")               # "Navy reads the same to both." -> NAVY / NAVY
    wait(c, rec, "scrollY<5 && document.getElementById('verdict').textContent.includes('cobalt')")
    rec.until(14.8)


def set_sev(c, v):
    js(c, f"{{const s=document.getElementById('sev');s.value='{v}';s.dispatchEvent(new Event('input'))}}")


def s4(c, rec):  # your eyes: the type, then the strength; at milder strengths the rose comes back into the lens
    home(c, "s4", rec)
    sc(c, rec, "window.__top('#you',20)", 1100); rec.until(1.4)
    click(c, "input[value=protan]"); rec.until(2.4)     # "...the kind of colour blindness he has"
    for v in (0.9, 0.8):
        set_sev(c, v); rec.pump(0.5)                     # the slider moves on the card
    sc(c, rec, "0", 1200); rec.until(4.4)               # back to him
    for v in (0.7, 0.6, 0.5, 0.4, 0.3):                 # "...and how strong it is": colour returns, TRAP turns SAFE
        set_sev(c, v); rec.pump(0.65)
    rec.until(8.4)
    x, y = lens_xy(c)                                   # "Milder forms are an approximation, and the app says so."
    drag_lens(c, rec, [(x - 80, y + 10), (x + 60, y - 10)], [1.2, 1.2])
    rec.until(11.3)


def s5(c, rec):  # a live try-on on his own photo; the wait is sped up in the edit
    home(c, "s5", rec)
    sc(c, rec, "window.__top('#you',20)", 1100); rec.until(1.5)
    c.send("DOM.enable"); root = c.send("DOM.getDocument")["root"]["nodeId"]
    nid = c.send("DOM.querySelector", nodeId=root, selector="#photo")["nodeId"]
    c.send("DOM.setFileInputFiles", nodeId=nid, files=[PHOTO])
    js(c, "document.getElementById('photo').dispatchEvent(new Event('change',{bubbles:true}))")
    rec.pump(1.2); rec.mark("wait_from")
    wait(c, rec, "/^(Done|Couldn)/.test(document.getElementById('status').textContent)", 120)
    rec.mark("wait_to")
    rec.pump(1.6)                                       # page scrolls to the new render
    x, y = lens_xy(c)
    drag_lens(c, rec, [(x - 100, y + 20), (x + 90, y - 20)], [1.2, 1.2])
    rec.pump(0.8)


# Recording-only emphasis for the method section (the last thing on the page, so it can't scroll further):
# a slow push-in, and one step lit at a time while the others dim. The content itself is untouched.
FOCUS_CSS = """{const st=document.createElement('style');st.textContent=`
#method{transform-origin:50% 45%;transition:transform 13s ease-in-out}
#method.push{transform:scale(1.14)}
#method .cols>div,#method .fine{transition:opacity .6s}
#method.lit .cols>div,#method.lit .fine{opacity:.28}
#method.lit .cols>div.on,#method.lit .fine.on{opacity:1}`;document.head.appendChild(st);}"""


def light(c, sel):
    js(c, "{const m=document.getElementById('method');m.classList.add('lit');"
          "m.querySelectorAll('.on').forEach(e=>e.classList.remove('on'));" + (f"m.querySelector({json.dumps(sel)}).classList.add('on');" if sel else "") + "}")


def s6(c, rec):  # how we know: one step at a time, in step with the voice; the end card comes in the edit
    home(c, "s6", rec)
    js(c, FOCUS_CSS)
    sc(c, rec, "window.__top('#method',-10)", 1600); rec.until(1.8)
    js(c, "document.getElementById('method').classList.add('push')")
    light(c, ".cols>div:nth-child(2)"); rec.until(5.6)   # "a published model from 2009, applied to every pixel"
    light(c, ".cols>div:nth-child(1)"); rec.until(7.2)
    light(c, ".cols>div:nth-child(3)"); rec.until(12.3)  # "...a standard colour-difference formula"
    light(c, ".fine"); rec.until(16.0)                    # "It's a shopping aid, not a medical test."


PHOTO = "/Users/mini/agents/sora/hackathons/youcam_2026/said_in_colour/gate/man2.jpg"
SCENES = {"s0": s0, "s1": s1, "s2": s2, "s3": s3, "s4": s4, "s5": s5, "s6": s6}

if __name__ == "__main__":
    c = RCDP(port=9224, url_contains="said-in-colour")
    # Cache on: Netlify serves max-age=0, must-revalidate, so files are rechecked and never stale. With the cache
    # off every pick re-downloaded a 600 KB render and the page reached the hero 2-3 s after the voice did.
    c.send("Network.enable"); c.send("Network.setCacheDisabled", cacheDisabled=False)
    c.navigate(f"{BASE}/?warm={time.time()}", timeout=40, settle=0)
    print("warm:", c.js("""(async()=>{const cat=await (await fetch('catalog.json')).json();
      await Promise.all(cat.map(it=>new Promise(ok=>{const i=new Image();i.crossOrigin='anonymous';i.onload=i.onerror=ok;i.src=it.demo})));
      return cat.length})()"""), "renders", flush=True)
    c.send("Emulation.setDeviceMetricsOverride", width=1920, height=1080, deviceScaleFactor=1, mobile=False)
    c.send("Page.enable")
    want = sys.argv[1:] or list(SCENES)
    try:
        for k in want:
            scene(c, k, SCENES[k])
    finally:
        c.send("Emulation.clearDeviceMetricsOverride")
