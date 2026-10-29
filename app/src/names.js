// Plain-words colour names in the language menswear actually uses, and the
// "trap" verdict: a garment is a trap when the man and everyone else would call
// it by different names. Names are matched by CIEDE2000 to the nearest entry;
// the hex values are representative swatches, not a standard.
import { deltaE2000, hexToRgb, rgbToHex, rgbToLab } from "./colour.js";
import { simulateRgb } from "./cvd.js";

export const NAMES = [
  ["white", "#f4f4f1"], ["off-white", "#ece6d6"], ["light grey", "#c9cacb"], ["grey", "#8f9092"],
  ["charcoal", "#45474b"], ["black", "#1c1c1e"], ["navy", "#1f2a44"], ["cobalt", "#2f55a4"],
  ["sky blue", "#8fb3d9"], ["light blue", "#b9cfe6"], ["teal", "#1f6f73"], ["forest green", "#2e4a33"],
  ["olive", "#6b6a3a"], ["sage", "#9aa58a"], ["khaki", "#a89b74"], ["stone", "#b2a894"],
  ["tan", "#b58a5a"], ["camel", "#c19a6b"], ["brown", "#6b4a33"], ["chocolate", "#4a3022"],
  ["rust", "#a4522c"], ["mustard", "#c9a227"], ["yellow", "#e3c547"], ["orange", "#d9772e"],
  ["coral", "#e07a68"], ["red", "#b3262e"], ["burgundy", "#6e1f2e"], ["pink", "#e5a6b6"],
  ["dusty rose", "#b98a8c"], ["salmon", "#e39a85"], ["lavender", "#a99cc8"], ["purple", "#5b3f7a"],
  ["mauve", "#9c7b8e"], ["mint", "#a9d3b9"], ["green", "#3f8a4c"], ["lime", "#a8c545"],
];
const LABS = NAMES.map(([n, hex]) => [n, rgbToLab(hexToRgb(hex))]);

export function nameOf(rgb) {
  const lab = rgbToLab(rgb);
  let best = null;
  for (const [n, l] of LABS) {
    const d = deltaE2000(lab, l);
    if (!best || d < best.d) best = { name: n, d };
  }
  return best;
}

// How a garment colour reads to him vs to everyone else, in three honest tiers:
//   trap    — different names AND a big shift (ΔE ≥ TRAP_DE): he'd buy it as one colour, everyone sees another;
//   careful — different names and a noticeable shift (CAREFUL_DE ≤ ΔE < TRAP_DE), e.g. sage that reads as grey;
//   safe    — same name, or a shift too small to matter (a name boundary is not a perception difference).
export const TRAP_DE = 8;
export const CAREFUL_DE = 4;
// The shop's own name wins when it really is that colour (within ΔE 12 of our swatch for it): "cobalt" stays
// cobalt even if its exact shade sits nearer our "navy" swatch. Otherwise the nearest swatch names it.
const SHOP_NAME_DE = 12;
export function readColour(rgb, type = "deutan", severity = 1, sold = null) {
  const his = simulateRgb(rgb, type, severity);
  let theirs = nameOf(rgb);
  const shop = sold && LABS.find(([n]) => n === String(sold).toLowerCase());
  if (shop && deltaE2000(rgbToLab(rgb), shop[1]) <= SHOP_NAME_DE) theirs = { name: shop[0], d: deltaE2000(rgbToLab(rgb), shop[1]) };
  const yours = nameOf(his);
  const gap = deltaE2000(rgbToLab(rgb), rgbToLab(his));
  return {
    hex: rgbToHex(rgb),
    hisHex: rgbToHex(his),
    everyone: theirs.name,
    you: yours.name,
    gap,
    trap: theirs.name !== yours.name && gap >= TRAP_DE,
    level: theirs.name === yours.name || gap < CAREFUL_DE ? "safe" : gap >= TRAP_DE ? "trap" : "careful",
  };
}
