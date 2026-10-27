import assert from "node:assert/strict";
import { test } from "node:test";

import { deltaE2000, rgbToLab } from "../src/colour.js";
import { MACHADO, matrixFor, simulatePixels, simulateRgb } from "../src/cvd.js";
import { nameOf, readColour } from "../src/names.js";

test("Machado matrices keep neutrals neutral (rows sum to 1)", () => {
  for (const [type, m] of Object.entries(MACHADO)) {
    for (const row of m) assert.ok(Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 1e-3, `${type} row ${row}`);
  }
  for (const g of [0, 60, 128, 200, 255]) {
    const [r, gg, b] = simulateRgb([g, g, g], "deutan");
    assert.ok(Math.abs(r - g) <= 1 && Math.abs(gg - g) <= 1 && Math.abs(b - g) <= 1, `grey ${g} moved`);
  }
});

test("severity 0 is the identity, severity 1 is the published matrix", () => {
  assert.deepEqual(matrixFor("deutan", 0), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  assert.deepEqual(matrixFor("deutan", 1), MACHADO.deutan);
  assert.deepEqual(simulateRgb([182, 92, 104], "protan", 0), [182, 92, 104]);
});

test("the gate result is reproduced: rose vs grey shirt collapse under deuteranopia", () => {
  // Chest-patch means measured from the real YouCam cloth-v4 renders on 27.10 (gate/).
  const rose = [162, 129, 128], grey = [143, 140, 142];
  const typical = deltaE2000(rgbToLab(rose), rgbToLab(grey));
  const deutan = deltaE2000(rgbToLab(simulateRgb(rose)), rgbToLab(simulateRgb(grey)));
  assert.ok(typical > 11 && typical < 13, `typical ${typical}`);
  assert.ok(deutan < typical * 0.6, `deutan ${deutan} should be well below typical ${typical}`);
});

test("pixel path matches the per-colour path and leaves alpha alone", () => {
  const px = new Uint8ClampedArray([162, 129, 128, 77, 30, 200, 90, 255]);
  simulatePixels(px, "deutan");
  assert.deepEqual([...px.slice(0, 3)], simulateRgb([162, 129, 128]));
  assert.equal(px[3], 77);
  assert.deepEqual([...px.slice(4, 7)], simulateRgb([30, 200, 90]));
});

test("names: a dusty rose shirt is a trap; navy and grey are not", () => {
  const rose = readColour([162, 129, 128]);
  assert.equal(rose.everyone, "dusty rose");
  assert.notEqual(rose.you, "dusty rose");
  assert.ok(rose.trap, JSON.stringify(rose));
  for (const safe of [[31, 42, 68], [143, 144, 146], [244, 244, 241]]) {
    const r = readColour(safe);
    assert.ok(!r.trap, `${safe} flagged: ${JSON.stringify(r)}`);
  }
});

test("nameOf finds exact swatches", () => {
  assert.equal(nameOf([31, 42, 68]).name, "navy");
  assert.equal(nameOf([185, 138, 140]).name, "dusty rose");
});

test("catalogue tiers on the real generated shirts (centre patches, catalog/centre_rgb.json)", async () => {
  const c = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("../../catalog/centre_rgb.json", import.meta.url)));
  const lvl = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, readColour(v).level]));
  for (const k of ["s01_dusty_rose", "s03_lavender", "s04_coral", "s05_burgundy"]) assert.equal(lvl[k], "trap", k);
  assert.equal(lvl.s02_sage, "careful");
  for (const k of ["s07_navy", "s08_grey", "s09_white", "s10_light_blue", "s12_charcoal"]) assert.equal(lvl[k], "safe", k);
});
