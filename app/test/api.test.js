import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanBody } from "../netlify/functions/api.js";

const ID = "pfNK5PuRe0MrwLHcGA3DOmB1ahwfXTbY";

test("cloth task: only our ids pass and the category is always upper_body", () => {
  assert.deepEqual(cleanBody("cloth-v4", { src_file_id: ID, ref_file_id: ID, garment_category: "full_body", extra: 1 }),
    { src_file_id: ID, ref_file_id: ID, garment_category: "upper_body" });
  assert.throws(() => cleanBody("cloth-v4", { src_file_id: ID }), /garment/);
  assert.throws(() => cleanBody("cloth-v4", { src_file_id: "https://evil.example/x.jpg", ref_file_id: ID }), /photo/);
});

test("features outside the fitting room are refused", () => {
  for (const f of ["hair-color", "headshot", "face-swap", ""]) assert.throws(() => cleanBody(f, { src_file_id: ID }), /not allowed/);
});
