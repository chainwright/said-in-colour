import assert from "node:assert/strict";
import { test } from "node:test";

import { deltaE2000, hexToRgb, labToRgb, rgbToHex, rgbToLab } from "../src/colour.js";

// Reference pairs from Sharma, Wu & Dalal (2005), "The CIEDE2000 Color-Difference Formula".
const SHARMA = [
  [[50.0, 2.6772, -79.7751], [50.0, 0.0, -82.7485], 2.0425],
  [[50.0, 0.0, 0.0], [50.0, -1.0, 2.0], 2.3669],
  [[50.0, 2.5, 0.0], [73.0, 25.0, -18.0], 27.1492],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
  [[50.0, 2.49, -0.001], [50.0, -2.49, 0.0009], 7.1792],
];

test("CIEDE2000 matches the published reference pairs", () => {
  for (const [a, b, expected] of SHARMA) {
    assert.ok(Math.abs(deltaE2000(a, b) - expected) < 1e-3, `${a} vs ${b}: ${deltaE2000(a, b)} ≠ ${expected}`);
    assert.ok(Math.abs(deltaE2000(b, a) - expected) < 1e-3, "symmetric");
  }
});

test("hex and Lab round-trip", () => {
  for (const hex of ["#7a5a40", "#b56637", "#000000", "#ffffff", "#2b1d14"]) {
    assert.equal(rgbToHex(hexToRgb(hex)), hex);
    const back = rgbToHex(labToRgb(rgbToLab(hexToRgb(hex))));
    assert.ok(deltaE2000(rgbToLab(hexToRgb(hex)), rgbToLab(hexToRgb(back))) < 0.5, `${hex} → ${back}`);
  }
});

