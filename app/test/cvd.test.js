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

test("milder severities use the paper's own 0.1-step matrices", async () => {
  const { matrixFor, MACHADO, MACHADO_STEPS } = await import("../src/cvd.js");
  assert.deepEqual(matrixFor("deutan", 1), MACHADO.deutan);
  assert.deepEqual(matrixFor("protan", 0.5), MACHADO_STEPS.protan[5]);
  const id = matrixFor("tritan", 0);
  assert.deepEqual(id.map((r) => r.map((v) => Math.round(v * 1e6) / 1e6)), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  // published 0.5 is not the halfway blend of identity and full: the old approximation was off
  const blend = MACHADO.protan[0][0] * 0.5 + 0.5;
  assert.ok(Math.abs(MACHADO_STEPS.protan[5][0][0] - blend) > 0.01);
});

// SPEC: under our own simulation (deutan and protan at 1.0) every text/background pair keeps WCAG 4.5:1.
test("every text/background pair keeps 4.5:1 for colour-blind eyes too", () => {
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const room = hex("#0b0f14"), light = hex("#eef3f4"), ink = hex("#0b0f14"), card = hex("#ede9df"), signal = hex("#0072b2");
  const pairs = {
    "light on room": [light, room], "dim light on room": [over(light, 0.62, room), room], "ink on card": [ink, card],
    "ink on tag": [ink, light], "ink on careful tag": [ink, hex("#f0e442")], "ink on trap stripe": [ink, hex("#c9ced3")],
    "white on signal button": [hex("#ffffff"), signal], "light on panel": [light, hex("#121924")],
    "dim light on panel": [over(light, 0.62, hex("#121924")), hex("#121924")],
  };
  for (const type of ["deutan", "protan"]) {
    for (const [name, [fg, bg]] of Object.entries(pairs)) {
      const r = ratio(simulateRgb(fg, type, 1), simulateRgb(bg, type, 1));
      assert.ok(r >= 4.5, `${name} under ${type}: ${r.toFixed(2)}:1`);
    }
  }
});
