// Colour vision deficiency simulation (Machado, Oliveira & Fernandes, 2009,
// "A Physiologically-based Model for Simulation of Color Vision Deficiency").
// Matrices are for full dichromacy (severity 1.0) and apply to LINEAR RGB.
// Milder forms (anomalous trichromacy) are approximated by blending linearly
// between the identity and the full matrix; the paper publishes a table per
// 0.1 step, so this is stated as an approximation in the methods panel.

export const MACHADO = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

const toLinear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const toSrgb = (v) => {
  const c = Math.min(1, Math.max(0, v));
  return Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055) * 255);
};

// 256-entry lookup so a whole photo converts quickly in the browser.
const LIN = Array.from({ length: 256 }, (_, i) => toLinear(i));

export function matrixFor(type, severity = 1) {
  const full = MACHADO[type];
  if (!full) throw new Error(`unknown CVD type: ${type}`);
  const s = Math.min(1, Math.max(0, severity));
  return full.map((row, i) => row.map((v, j) => (i === j ? 1 : 0) * (1 - s) + v * s));
}

export function simulateRgb([r, g, b], type = "deutan", severity = 1) {
  const m = matrixFor(type, severity);
  const l = [LIN[r], LIN[g], LIN[b]];
  return m.map((row) => toSrgb(row[0] * l[0] + row[1] * l[1] + row[2] * l[2]));
}

// In-place on RGBA pixel data (canvas ImageData.data). Alpha is untouched.
export function simulatePixels(data, type = "deutan", severity = 1) {
  const m = matrixFor(type, severity);
  for (let i = 0; i < data.length; i += 4) {
    const r = LIN[data[i]], g = LIN[data[i + 1]], b = LIN[data[i + 2]];
    data[i] = toSrgb(m[0][0] * r + m[0][1] * g + m[0][2] * b);
    data[i + 1] = toSrgb(m[1][0] * r + m[1][1] * g + m[1][2] * b);
    data[i + 2] = toSrgb(m[2][0] * r + m[2][1] * g + m[2][2] * b);
  }
  return data;
}
