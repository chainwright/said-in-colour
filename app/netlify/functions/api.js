// One Netlify function for the calls the browser makes:
//   POST /api/upload  {image: base64 JPEG}      → {fileId}
//   POST /api/task    {feature, body}           → {taskId}
//   GET  /api/status?feature=…&id=…             → {status, results, error}
//   GET  /api/health                            → {ok, credit}
// The YouCam key lives only in this function's environment.
import { YouCam } from "../../src/youcam.js";

const MAX_BYTES = 4 * 1024 * 1024;
// YouCam serves results from its S3 buckets (e.g. yce-us.s3-accelerate.amazonaws.com).
const RESULT_HOST = /^yce[-\w]*\.s3[-\w.]*\.amazonaws\.com$/;

const json = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(data),
});

let client;
const youcam = () => (client ??= new YouCam({ key: process.env.YOUCAM_API_KEY }));

// Guards for a public demo that has to last until judging ends: only our own page may start paid work, each
// visitor gets a fair share per hour, and the site has a daily ceiling. The example shirts never call YouCam.
const ORIGINS = (process.env.ALLOWED_ORIGINS || "https://said-in-colour.netlify.app,http://localhost:8888")
  .split(",").map((o) => o.trim()).filter(Boolean);
const PER_IP_PER_HOUR = Number(process.env.TASKS_PER_IP_PER_HOUR || 12);
const PER_DAY = Number(process.env.TASKS_PER_DAY || 80);
let perIp = new Map(), day = { key: "", n: 0 };
export const resetForTests = () => { client = undefined; perIp = new Map(); day = { key: "", n: 0 }; };
const lower = (event) => Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
function guard(event) {
  const h = lower(event);
  if (h.origin && !ORIGINS.includes(h.origin)) return "This demo only takes requests from its own page.";
  const ip = h["x-nf-client-connection-ip"] || h["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (perIp.get(ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= PER_IP_PER_HOUR) return "That's a lot of try-ons for one hour. Please come back a little later.";
  const today = new Date(now).toISOString().slice(0, 10);
  if (day.key !== today) day = { key: today, n: 0 };
  if (day.n >= PER_DAY) return "The live try-on has reached today's limit. The example shirts still work.";
  recent.push(now); perIp.set(ip, recent); day.n += 1;
  return null;
}

// Only file ids from our own uploads go on to a task, and the garment category is fixed:
// shirts and tops only (upper_body), which is what the fitting room is for.
export function cleanBody(feature, body = {}) {
  const id = (v) => typeof v === "string" && /^[A-Za-z0-9+/=_-]{8,300}$/.test(v);
  if (!id(body.src_file_id)) throw new Error("Missing photo");
  if (feature === "cloth-v4") {
    if (!id(body.ref_file_id)) throw new Error("Missing garment photo");
    return { src_file_id: body.src_file_id, ref_file_id: body.ref_file_id, garment_category: "upper_body" };
  }
  if (feature === "skin-tone-analysis") return { src_file_id: body.src_file_id, face_angle_strictness_level: "medium" };
  throw new Error(`Feature not allowed: ${feature}`);
}

export const handler = async (event) => {
  const route = String(event.path || "").split("/").filter(Boolean).pop();
  try {
    if (event.httpMethod === "POST" && route === "upload") {
      const { image } = JSON.parse(event.body || "{}");
      const bytes = Buffer.from(String(image || ""), "base64");
      if (!bytes.length || bytes.length > MAX_BYTES) return json(400, { error: "Photo must be a JPEG under 4 MB" });
      if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return json(400, { error: "Photo must be a JPEG" });
      return json(200, { fileId: await youcam().upload(bytes) });
    }
    if (event.httpMethod === "POST" && route === "task") {
      const { feature, body } = JSON.parse(event.body || "{}");
      const cleaned = cleanBody(feature, body);
      const refused = guard(event);
      if (refused) return json(429, { error: refused });
      return json(200, { taskId: await youcam().start(feature, cleaned) });
    }
    if (event.httpMethod === "GET" && route === "status") {
      const { feature, id } = event.queryStringParameters || {};
      return json(200, await youcam().status(feature, id));
    }
    // The finished render as base64, so the browser can read its pixels for the simulation
    // (the result URL itself has no CORS headers). The URL comes from YouCam's own task
    // status, never from the browser, and must be on YouCam's storage host.
    if (event.httpMethod === "GET" && route === "result") {
      const { feature, id } = event.queryStringParameters || {};
      const s = await youcam().status(feature, id);
      const url = s.results?.url;
      if (s.status !== "success" || !url) return json(409, { error: "Not ready" });
      if (!RESULT_HOST.test(new URL(url).hostname)) return json(400, { error: "Unexpected result host" });
      const r = await fetch(url);
      if (!r.ok) return json(502, { error: `Result download failed: ${r.status}` });
      return json(200, { image: Buffer.from(await r.arrayBuffer()).toString("base64") });
    }
    if (event.httpMethod === "GET" && route === "health") {
      return json(200, { ok: true, credit: await youcam().credit() });
    }
    return json(404, { error: "Not found" });
  } catch (error) {
    if (error.code === "budget") return json(429, { error: error.message });
    return json(400, { error: error.message });
  }
};
