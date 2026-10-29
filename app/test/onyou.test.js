import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { deltaE2000, hexToRgb, rgbToLab } from "../src/colour.js";
import { HAIR, contrastWord, goodOnYou } from "../src/onyou.js";

const tones = JSON.parse(readFileSync(new URL("../public/demo/tones.json", import.meta.url)));
const GREY_SHIRT = [160, 160, 158];

test("the saved demo reading is a palette category: Auburn", () => {
  assert.equal(tones.color.hair_color_name, "Auburn");
});

test("a user who picked grey gets a hair verdict against grey, not the API's Auburn", () => {
  const r = goodOnYou(GREY_SHIRT, tones, "grey");
  assert.equal(r.hair.pick, "grey");
  const vsGrey = contrastWord(deltaE2000(rgbToLab(GREY_SHIRT), rgbToLab(hexToRgb(HAIR.grey))));
  const vsAuburn = contrastWord(deltaE2000(rgbToLab(GREY_SHIRT), rgbToLab(hexToRgb(tones.color.hair_color))));
  assert.equal(r.hair.word, vsGrey);
  assert.notEqual(vsGrey, vsAuburn, "the test shirt must tell grey and Auburn apart");
});

test("with no pick there is no hair verdict, only the palette label", () => {
  for (const pick of [undefined, null, "", "auburn"]) {
    const r = goodOnYou(GREY_SHIRT, tones, pick);
    assert.equal(r.hair, null);
    assert.equal(r.palette, "Auburn");
  }
});

test("skin is still read from the measured colour", () => {
  const r = goodOnYou(GREY_SHIRT, tones);
  assert.equal(r.skin, contrastWord(deltaE2000(rgbToLab(GREY_SHIRT), rgbToLab(hexToRgb(tones.color.skin_color)))));
  assert.deepEqual(goodOnYou(GREY_SHIRT, null), { skin: null, hair: null, palette: null });
});
