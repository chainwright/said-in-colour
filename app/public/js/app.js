// Said in Colour — the exam room, the trial-lens case, and a live try-on.
import { readColour } from "./names.js";
import { simulatePixels } from "./cvd.js";

const $ = (id) => document.getElementById(id);
const stage = $("stage"), base = $("base"), sim = $("sim");
const state = { type: "deutan", severity: 1, img: null, item: null, catalog: [], lx: 0, ly: 0 };
const TYPE_NAME = { deutan: "deuteranopia", protan: "protanopia", tritan: "tritanopia" };

// ---------- render + simulation ----------
function draw(img) {
  state.img = img;
  for (const c of [base, sim]) { c.width = img.naturalWidth; c.height = img.naturalHeight; }
  base.getContext("2d").drawImage(img, 0, 0);
  simulate();
  layout();
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

// The shirt colour, measured where the gate measured it: a chest patch below the collar.
function chestColour() {
  const ctx = base.getContext("2d", { willReadFrequently: true });
  const w = base.width, h = base.height;
  const x0 = Math.round(w * .38), y0 = Math.round(h * .70), pw = Math.round(w * .24), ph = Math.round(h * .15);
  const d = ctx.getImageData(x0, y0, pw, ph).data;
  const ch = [[], [], []];
  for (let i = 0; i < d.length; i += 4) { ch[0].push(d[i]); ch[1].push(d[i + 1]); ch[2].push(d[i + 2]); }
  return ch.map((a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; });
}

function words() {
  const r = readColour(chestColour(), state.type, state.severity);
  $("youWord").textContent = r.you.toUpperCase();
  $("theyWord").textContent = r.everyone.toUpperCase();
  const label = { trap: "▲ TRAP", careful: "◆ CAREFUL", safe: "✓ SAFE" }[r.level];
  $("verdict").innerHTML = `<b>${label}</b> · difference ${r.gap.toFixed(1)} (CIEDE2000)` +
    (state.item ? ` · sold as “${state.item.sold}”` : "");
  $("tabText").textContent = `${state.type.toUpperCase()} ${state.severity.toFixed(1)}`;
  $("chart").classList.add("ready");
  $("caption").textContent = `1 = your eyes (simulated: ${TYPE_NAME[state.type]}) · 2 = everyone else`;
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
async function pick(item, { scroll = true } = {}) {
  state.item = item;
  document.querySelectorAll(".slot").forEach((s) => s.setAttribute("aria-current", s.dataset.id === item.id));
  if ($("ticket")) ticket(item);
  draw(await load(item.demo));
  if (scroll) $("room").scrollIntoView({ behavior: "smooth" });
}
// Well centres measured on the case photo (mockups/case/wells.json), snapped to the grid.
const COLS = [19.6, 39.5, 59.5, 79.2], ROWS = [23.4, 50.3, 77.6];
const TIERS = { trap: "▲ TRAP", careful: "◆ CAREFUL", safe: "✓ SAFE" };
function ticket(it) {
  const r = readColour(it.rgb, state.type, state.severity);
  $("ticket").innerHTML = `<span class="no">${it.no}</span><span class="plain">${it.plain}</span>
    <span class="row">sold as <b>${it.sold}</b> · reads to you as <b>${r.you}</b></span>
    <span class="tag big ${r.level}">${TIERS[r.level]}</span>`;
}
function buildCase() {
  $("caseGrid").innerHTML = state.catalog.map((it, i) => {
    const r = readColour(it.rgb, state.type, state.severity);
    return `<button class="slot" role="listitem" data-id="${it.id}" style="left:${COLS[i % 4]}%;top:${ROWS[i >> 2]}%"
      aria-label="${it.no}, ${it.plain}, sold as ${it.sold}, reads to you as ${r.you}: ${r.level}">
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
    const [src, ref] = await Promise.all([api("upload", { image: await toJpegBase64(file) }), api("upload", { image: await toJpegBase64(item.full) })]);
    status.textContent = "YouCam is putting the shirt on you (about 20 seconds)…";
    const { taskId } = await api("task", { feature: "cloth-v4", body: { src_file_id: src.fileId, ref_file_id: ref.fileId } });
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const s = await api(`status?feature=cloth-v4&id=${encodeURIComponent(taskId)}`);
      if (s.status === "success") {
        const { image } = await api(`result?feature=cloth-v4&id=${encodeURIComponent(taskId)}`);
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
  buildCase();
  await pick(state.catalog[0], { scroll: false });
})();
