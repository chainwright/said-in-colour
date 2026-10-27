// One Netlify function for the calls the browser makes:
//   POST /api/upload  {image: base64 JPEG}      → {fileId}
//   POST /api/task    {feature, body}           → {taskId}
//   GET  /api/status?feature=…&id=…             → {status, results, error}
//   GET  /api/health                            → {ok, credit}
// The YouCam key lives only in this function's environment.
import { YouCam } from "../../src/youcam.js";

const MAX_BYTES = 4 * 1024 * 1024;

const json = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(data),
});

let client;
const youcam = () => (client ??= new YouCam({ key: process.env.YOUCAM_API_KEY }));
export const resetForTests = () => { client = undefined; };

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
      return json(200, { taskId: await youcam().start(feature, cleanBody(feature, body)) });
    }
    if (event.httpMethod === "GET" && route === "status") {
      const { feature, id } = event.queryStringParameters || {};
      return json(200, await youcam().status(feature, id));
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
