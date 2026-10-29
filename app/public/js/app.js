// Said in Colour — the exam room, the trial-lens case, and a live try-on.
import { readColour } from "./names.js";
import { rgbToLab } from "./colour.js";
import { goodOnYou } from "./onyou.js";
import { simulatePixels } from "./cvd.js";

const $ = (id) => document.getElementById(id);
const stage = $("stage"), base = $("base"), sim = $("sim");
const state = { type: "deutan", severity: 1, hair: "", img: null, item: null, catalog: [], lx: 0, ly: 0 };
const TYPE_NAME = { deutan: "deuteranopia", protan: "protanopia", tritan: "tritanopia" };

// ---------- render + simulation ----------
function draw(img) {
  state.img = img;
  for (const c of [base, sim]) { c.width = img.naturalWidth; c.height = img.naturalHeight; }
  base.getContext("2d").drawImage(img, 0, 0);
  simulate();
  layout();
  stage.classList.add("ready");
}

function simulate() {
  if (!state.img) return;
  const ctx = sim.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(state.img, 0, 0);
  const d = ctx.getImageData(0, 0, sim.width, sim.height);
  simulatePixels(d.data, state.type, state.severity);
  ctx.putImageData(d, 0, 0);
  words();
}

// Where the shirt is: the pixels the try-on changed. YouCam puts the shirt on the person, so comparing the photo
// before and after finds the garment on *you*, under your light, wherever it sits in the frame. If the shirt
// barely changed the photo (a white shirt on a white T-shirt), fall back to a chest patch below the collar.
function garmentColour() {
  const w = base.width, h = base.height;
  const after = base.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  let before = null;
  if (state.source) {
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(state.source, 0, 0, w, h);
    before = ctx.getImageData(0, 0, w, h).data;
  }
  const ch = [[], [], []];
  if (before) {
    for (let i = 0; i < after.length; i += 16) {
      const d = Math.abs(after[i] - before[i]) + Math.abs(after[i + 1] - before[i + 1]) + Math.abs(after[i + 2] - before[i + 2]);
      if (d > 90) { ch[0].push(after[i]); ch[1].push(after[i + 1]); ch[2].push(after[i + 2]); }
    }
  }
  const found = ch[0].length > (w * h / 4) * 0.03;
  if (!found) {
    for (let y = Math.round(h * .70); y < Math.round(h * .85); y += 2)
      for (let x = Math.round(w * .38); x < Math.round(w * .62); x += 2) {
        const i = (y * w + x) * 4; ch[0].push(after[i]); ch[1].push(after[i + 1]); ch[2].push(after[i + 2]);
      }
  }
  return { rgb: ch.map((a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; }), fromTryOn: found };
}

// One source of truth for the words: the shirt's own colour (the product), the same reading the case uses, so
// the room and the case can never disagree. The try-on adds what only it can: how the shirt reads in this
// photo's light, measured on the pixels it changed.
function words() {
  const it = state.item;
  const r = readColour(it ? it.rgb : garmentColour().rgb, state.type, state.severity, it?.sold);
  const safe = r.level === "safe";
  $("youWord").textContent = (safe ? r.everyone : r.you).toUpperCase();
  $("theyWord").textContent = r.everyone.toUpperCase();
  $("chart").classList.toggle("same", safe);
  const label = { trap: "▲ TRAP", careful: "◆ CAREFUL", safe: "✓ SAFE · you both see " + r.everyone }[r.level];
  // The try-on measures the shirt on you, in your light. We don't give that its own colour name (shadows would
  // turn navy into "black" and contradict the words above); we only say if your light makes it read darker or lighter.
  const g = garmentColour();
  const dL = it ? rgbToLab(g.rgb)[0] - rgbToLab(it.rgb)[0] : 0;
  const lit = Math.abs(dL) < 12 ? "" : dL < 0 ? "a little darker" : "a little lighter";
  $("verdict").innerHTML = `<b>${label}</b> · difference ${r.gap.toFixed(1)} (CIEDE2000)` +
    (it ? ` · sold as “${it.sold}”` : "") +
    (g.fromTryOn && lit ? ` · on you, in this photo's light, it reads ${lit}` : "");
  onYou(it);
  $("tabText").textContent = `${state.type.toUpperCase()} ${state.severity.toFixed(1)}`;
  $("chart").classList.add("ready");
  $("caption").textContent = `1 = your eyes (simulated: ${TYPE_NAME[state.type]}) · 2 = everyone else`;
}


// "Good on you": skin is a measured colour from YouCam's Facial Color Tones, so we compare against it.
// Hair comes back as a palette category, not a measurement, so it only becomes a verdict once you pick your hair.
const HAIR_PICKS = ["dark", "brown", "blond", "red", "grey", "white"];
function onYou(it) {
  const box = $("onYou");
  if (!it || !state.tones) { box.innerHTML = ""; return; }
  const r = goodOnYou(it.rgb, state.tones, state.hair);
  const parts = [];
  if (r.skin) parts.push(`against your skin: <b>${r.skin}</b>`);
  if (r.hair) parts.push(`against your hair (${r.hair.pick}, your pick): <b>${r.hair.word}</b>`);
  const head = parts.length ? `On you · ${parts.join(" · ")} <span class="src">(skin read by YouCam)</span>` : "";
  const note = r.palette && !r.hair ? `YouCam's hair palette: ${r.palette} (a category, not your hair). ` : "";
  box.innerHTML = `${head}<span class="hairpick">${note}<label>Your hair <select id="hairSel" aria-label="Your hair colour">
    <option value="">pick to compare</option>${HAIR_PICKS.map((h) => `<option value="${h}"${h === state.hair ? " selected" : ""}>${h}</option>`).join("")}
    </select></label></span>`;
  $("hairSel").onchange = (e) => { state.hair = e.target.value; onYou(state.item); };
}

// ---------- the lens ----------
function radius() { return stage.clientHeight * 0.15; }
function setLens(x, y) {
  const w = base.getBoundingClientRect().width, h = stage.clientHeight, r = radius();
  state.lx = Math.max(r * .4, Math.min(w - r * .4, x));
  state.ly = Math.max(r * .4, Math.min(h - r * .4, y));
  for (const [k, v] of [["--lx", state.lx], ["--ly", state.ly], ["--x", state.lx], ["--y", state.ly], ["--r", r]]) stage.style.setProperty(k, `${v}px`);
}
function layout() {
  const w = base.getBoundingClientRect().width, h = stage.clientHeight;
  stage.style.setProperty("--imgw", `${w}px`);
  if (!state.placed) { setLens(w * 1.2, h * .66); requestAnimationFrame(() => glideTo(w * .5, h * .68)); state.placed = true; }
  else setLens(state.lx, state.ly);
}
function glideTo(x, y) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const x0 = state.lx, y0 = state.ly, t0 = performance.now(), T = reduce ? 0 : 1100;
  const step = (t) => {
    const p = T ? Math.min(1, (t - t0) / T) : 1, e = 1 - (1 - p) ** 3;
    setLens(x0 + (x - x0) * e, y0 + (y - y0) * e);
    if (p < 1) requestAnimationFrame(step); else $("tagline").classList.add("sharp");
  };
  requestAnimationFrame(step);
}

const handle = $("lensHandle");
handle.addEventListener("pointerdown", (e) => {
  handle.setPointerCapture(e.pointerId);
  const box = stage.getBoundingClientRect(), dx = e.clientX - box.left - state.lx, dy = e.clientY - box.top - state.ly;
  const move = (ev) => setLens(ev.clientX - box.left - dx, ev.clientY - box.top - dy);
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", () => handle.removeEventListener("pointermove", move), { once: true });
});
handle.addEventListener("keydown", (e) => {
  const s = stage.clientHeight * .02, k = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
  if (k) { e.preventDefault(); setLens(state.lx + k[0], state.ly + k[1]); }
  if (e.key === " ") { e.preventDefault(); cycleFlip(); }
});
addEventListener("resize", () => state.img && layout());

// ---------- whole-picture flip ----------
const FLIPS = [["flipYou", "full-you"], ["flipLens", ""], ["flipThem", "full-them"]];
function setFlip(id) {
  for (const [b, cls] of FLIPS) {
    const on = b === id;
    $(b).classList.toggle("on", on); $(b).setAttribute("aria-pressed", on);
    if (cls) stage.classList.toggle(cls, on);
  }
}
function cycleFlip() { const i = FLIPS.findIndex(([b]) => $(b).classList.contains("on")); setFlip(FLIPS[(i + 1) % 3][0]); }
for (const [b] of FLIPS) $(b).onclick = () => setFlip(b);

// ---------- the trial-lens case ----------
function load(src) {
  return new Promise((ok, fail) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = fail; i.src = src; });
}
let pickToken = 0;
async function pick(item, { scroll = true } = {}) {
  const mine = ++pickToken;   // a slow image that arrives after a newer pick is thrown away
  state.item = item;
  document.querySelectorAll(".slot").forEach((s) => s.setAttribute("aria-current", s.dataset.id === item.id));
  if ($("ticket")) ticket(item);
  const img = await load(item.demo);
  if (mine !== pickToken) return;
  state.source = state.demoSource;
  state.tones = state.demoTones;
  draw(img);
  if (scroll) $("room").scrollIntoView({ behavior: "smooth" });
}
// Well centres measured on the case photo (mockups/case/wells.json), snapped to the grid.
const COLS = [19.6, 39.5, 59.5, 79.2], ROWS = [23.4, 50.3, 77.6];
const TIERS = { trap: "▲ TRAP", careful: "◆ CAREFUL", safe: "✓ SAFE" };
function ticket(it) {
  const r = readColour(it.rgb, state.type, state.severity, it.sold);
  $("ticket").innerHTML = `<span class="no">${it.no}</span><span class="plain">${it.plain}</span>
    <span class="row">sold as <b>${it.sold}</b> · ${r.level === "safe" ? `you both see <b>${r.everyone}</b>` : `reads to you as <b>${r.you}</b>`}</span>
    <span class="tag big ${r.level}">${TIERS[r.level]}</span>`;
}
function buildCase() {
  $("caseGrid").innerHTML = state.catalog.map((it, i) => {
    const r = readColour(it.rgb, state.type, state.severity, it.sold);
    return `<button class="slot" role="listitem" data-id="${it.id}" style="left:${COLS[i % 4]}%;top:${ROWS[i >> 2]}%"
      aria-label="${it.no}, ${it.plain}, sold as ${it.sold}, ${r.level === "safe" ? `you both see ${r.everyone}` : `reads to you as ${r.you}`}: ${r.level}">
      <span class="glass" style="background-image:url(${it.thumb})"></span>
      <span class="tag ${r.level}">${TIERS[r.level]}</span><span class="num">${it.no.replace("No. ", "")}</span>
    </button>`;
  }).join("");
  document.querySelectorAll(".slot").forEach((s) => {
    const it = state.catalog.find((c) => c.id === s.dataset.id);
    s.onclick = () => pick(it);
    s.onmouseenter = s.onfocus = () => ticket(it);
    s.onmouseleave = s.onblur = () => ticket(state.item || state.catalog[0]);
  });
  if (state.item) document.querySelector(`.slot[data-id="${state.item.id}"]`)?.setAttribute("aria-current", "true");
  ticket(state.item || state.catalog[0]);
}

// ---------- your eyes ----------
document.querySelectorAll("input[name=cvd]").forEach((r) => (r.onchange = () => { state.type = r.value; simulate(); buildCase(); }));
$("sev").oninput = (e) => { state.severity = +e.target.value; $("sevOut").textContent = state.severity.toFixed(1); simulate(); buildCase(); };

// ---------- live try-on on your own photo ----------
async function toJpegBase64(fileOrUrl, max = 1600) {
  const img = typeof fileOrUrl === "string" ? await load(fileOrUrl) : await createImageBitmap(fileOrUrl);
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = Object.assign(document.createElement("canvas"), { width: Math.round(img.width * s), height: Math.round(img.height * s) });
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", .9).split(",")[1];
}
async function api(path, body) {
  const r = await fetch(`/api/${path}`, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {});
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
$("photo").onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  const item = state.item || state.catalog[0], status = $("status");
  try {
    status.textContent = "Uploading your photo and the shirt…";
    const mine = ++pickToken;
    const srcB64 = await toJpegBase64(file);
    const [src, ref] = await Promise.all([api("upload", { image: srcB64 }), api("upload", { image: await toJpegBase64(item.full) })]);
    status.textContent = "YouCam is putting the shirt on you (about 20 seconds)…";
    const { taskId } = await api("task", { feature: "cloth-v4", body: { src_file_id: src.fileId, ref_file_id: ref.fileId } });
    const tones = api("task", { feature: "skin-tone-analysis", body: { src_file_id: src.fileId } })
      .then(async ({ taskId: t }) => {
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const s = await api(`status?feature=skin-tone-analysis&id=${encodeURIComponent(t)}`);
          if (s.status === "success") return s.results;
          if (s.status === "error") return null;
        }
        return null;
      }).catch(() => null);
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const s = await api(`status?feature=cloth-v4&id=${encodeURIComponent(taskId)}`);
      if (s.status === "success") {
        const { image } = await api(`result?feature=cloth-v4&id=${encodeURIComponent(taskId)}`);
        if (mine !== pickToken) return;
        state.source = await load(`data:image/jpeg;base64,${srcB64}`);
        state.tones = await tones;
        draw(await load(`data:image/jpeg;base64,${image}`));
        status.textContent = "Done. Drag the lens across your shirt.";
        $("room").scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (s.status === "error") throw new Error(s.error || "YouCam could not render this photo");
    }
    throw new Error("Timed out. Try a photo from the chest up, standing, facing the camera.");
  } catch (err) { status.textContent = `Couldn't do it: ${err.message}`; }
};

// ---------- start ----------
(async () => {
  state.catalog = await (await fetch("catalog.json")).json();
  state.demoSource = state.source = await load("demo/source.jpg").catch(() => null);
  state.demoTones = state.tones = await fetch("demo/tones.json").then((r) => r.json()).catch(() => null);
  buildCase();
  await pick(state.catalog[0], { scroll: false });
})();
