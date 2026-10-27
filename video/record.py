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
        self.c.send("Page.startScreencast", format="jpeg", quality=88, maxWidth=1920, maxHeight=1080, everyNthFrame=1)

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
        n = len(self.frames)
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
    return c.js(code)


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


def scene(c, name, fn):
    rec = Rec(c, name)
    c.rec = rec
    rec.start()
    fn(c, rec)
    c.rec = None
    rec.stop()


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
    n = max(1, int(secs * 30))
    for k in range(1, n + 1):
        f = k / n; e = f * f * (3 - 2 * f)
        mouse(c, "mouseMoved", x0 + (x1 - x0) * e, y0 + (y1 - y0) * e, **({"button": "left", "buttons": 1} if held else {}))
        rec.pump(1 / 30)


def wait(c, rec, cond, limit=25):
    end = time.time() + limit
    while time.time() < end:
        if js(c, cond):
            return
        rec.pump(0.3)
    raise SystemExit("timeout " + cond)


def home(c, q):
    c.navigate(f"{BASE}/?{q}={time.time()}", timeout=40, settle=0)


def s0(c, rec):  # the lens drifts in and settles; the chart line sharpens
    home(c, "s0"); rec.pump(9)


def s1(c, rec):  # hold on the chart and the verdict
    home(c, "s1"); rec.pump(2.5)
    js(c, "document.querySelector('.chart').scrollIntoView({block:'center'})"); rec.pump(12)


def s2(c, rec):  # drag the lens across the shirt, then flip the whole picture
    home(c, "s2"); rec.pump(2.5)
    x, y = center(c, "#lensHandle")
    mouse(c, "mouseMoved", x, y); mouse(c, "mousePressed", x, y, button="left", clickCount=1)
    glide_mouse(c, rec, x, y, x - 170, y - 60, 1.6, True)
    glide_mouse(c, rec, x - 170, y - 60, x + 160, y + 40, 2.2, True)
    glide_mouse(c, rec, x + 160, y + 40, x, y, 1.4, True)
    mouse(c, "mouseReleased", x, y, button="left", clickCount=1); rec.pump(1.2)
    click(c, "#flipYou"); rec.pump(2.6)
    click(c, "#flipThem"); rec.pump(2.6)
    click(c, "#flipLens"); rec.pump(2.0)


def s3(c, rec):  # the case: hover traps, pick coral, burgundy, navy
    home(c, "s3"); rec.pump(1.5)
    js(c, "window.scrollTo({top: document.getElementById('case').offsetTop + 40, behavior:'smooth'})"); rec.pump(2.5)
    for sid in ("s01_dusty_rose", "s04_coral", "s05_burgundy"):
        x, y = center(c, f".slot[data-id={sid}]"); mouse(c, "mouseMoved", x, y)
        js(c, f"document.querySelector('.slot[data-id={sid}]').dispatchEvent(new Event('mouseenter'))"); rec.pump(1.8)
    click(c, ".slot[data-id=s04_coral]"); rec.pump(0.8)
    js(c, "window.scrollTo({top: 0, behavior:'smooth'})"); rec.pump(4.5)
    js(c, "window.scrollTo({top: document.getElementById('case').offsetTop + 40, behavior:'smooth'})"); rec.pump(1.8)
    click(c, ".slot[data-id=s07_navy]"); rec.pump(0.8)
    js(c, "window.scrollTo({top: 0, behavior:'smooth'})"); rec.pump(4.5)


def s4(c, rec):  # your eyes: red-weak, then milder
    home(c, "s4"); rec.pump(1.0)
    js(c, "window.scrollTo({top: document.getElementById('you').offsetTop - 20, behavior:'smooth'})"); rec.pump(2.2)
    click(c, "input[value=protan]"); rec.pump(2.0)
    js(c, "const s=document.getElementById('sev');s.value='0.6';s.dispatchEvent(new Event('input'))"); rec.pump(2.0)
    js(c, "window.scrollTo({top: 0, behavior:'smooth'})"); rec.pump(3.5)
    js(c, "document.querySelector('input[value=deutan]').click();const s=document.getElementById('sev');s.value='1';s.dispatchEvent(new Event('input'))"); rec.pump(2.5)


def s5(c, rec):  # a live try-on on a photo (sped up in the edit)
    home(c, "s5")
    wait(c, rec, "!!document.querySelector('.slot[data-id=s04_coral]') && document.getElementById('chart').classList.contains('ready')")
    js(c, "document.querySelector('.slot[data-id=s04_coral]').click()")
    wait(c, rec, "document.querySelector('.slot[data-id=s04_coral]').getAttribute('aria-current')==='true'"); rec.pump(1.0)
    js(c, "window.scrollTo({top: document.getElementById('you').offsetTop - 20, behavior:'smooth'})"); rec.pump(2.0)
    c.send("DOM.enable"); root = c.send("DOM.getDocument")["root"]["nodeId"]
    nid = c.send("DOM.querySelector", nodeId=root, selector="#photo")["nodeId"]
    c.send("DOM.setFileInputFiles", nodeId=nid, files=[PHOTO])
    js(c, "document.getElementById('photo').dispatchEvent(new Event('change',{bubbles:true}))")
    wait(c, rec, "/^(Done|Couldn)/.test(document.getElementById('status').textContent)", 120)
    rec.pump(3.5)


def s6(c, rec):  # how we know
    home(c, "s6"); rec.pump(1.0)
    js(c, "window.scrollTo({top: document.getElementById('method').offsetTop - 20, behavior:'smooth'})"); rec.pump(9)
    js(c, "window.scrollTo({top: 0, behavior:'smooth'})"); rec.pump(6)


PHOTO = "/Users/mini/agents/sora/hackathons/youcam_2026/said_in_colour/gate/man2.jpg"
SCENES = {"s0": s0, "s1": s1, "s2": s2, "s3": s3, "s4": s4, "s5": s5, "s6": s6}

if __name__ == "__main__":
    c = RCDP(port=9224, url_contains="said-in-colour")
    c.send("Network.enable"); c.send("Network.setCacheDisabled", cacheDisabled=True)
    c.send("Emulation.setDeviceMetricsOverride", width=1920, height=1080, deviceScaleFactor=1, mobile=False)
    c.send("Page.enable")
    want = sys.argv[1:] or list(SCENES)
    try:
        for k in want:
            scene(c, k, SCENES[k])
    finally:
        c.send("Emulation.clearDeviceMetricsOverride")
